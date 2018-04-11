import _ from 'lodash'

import superagent from 'superagent'
import superagentPromise from 'superagent-promise'

import { noop } from '../utils'
import { StopPipeline, BadRequestError, ForbiddenError } from '../utils/errors'

import Logger from '../utils/Logger'
import Template from './Template.service'

const agent = superagentPromise(superagent, Promise)

export default class SAPJam extends Template {

  /* Check parameters validity to create a Channel */
  static checkParamsValidity (channel) {
    const params = ['userName', 'apiKey', 'serviceId', 'token']
    params.forEach(param => {
      if (!channel[param] || typeof channel[param] !== 'string') {
        throw new BadRequestError('Bad parameter "'.concat(param).concat('" : missing or not string.'))
      }
    })
  }

  /* Call when a channel is created */
  static async onChannelCreate (channel) {
    Logger.info('[SAPJam] onChannelCreate')
  }

  /* Call when a channel is updated */
  static onChannelUpdate (channel) {
    Logger.info('[SAPJam] onChannelUpdate')
  }

  /* Call when a channel is deleted */
  static onChannelDelete (channel) {
    Logger.info('[SAPJam] onChannelDelete')
  }

  /* Check webhook validity for certain channels (Messenger) */
  static onWebhookChecking (req, res, channel)  {
    console.log(req.body)
    throw new BadRequestError('Unimplemented service method')
  }

  /* Call when a message is received for security purpose */
  static async checkSecurity (req, res, channel) {
    Logger.info('[SAPJam] checkSecurity')
    console.log(req.body)
    if (_.get(req.body, '@sapjam.hub.verificationToken') !== channel.token) {
      throw new ForbiddenError('Verification token mismatch')
    }
    res.status(200).send(_.get(req.body, '@sapjam.hub.challenge'))
  }

  static async beforePipeline (req, res, channel) {

    Logger.info('[SAPJam] beforePipeline')

    /* Currently, we only support message events */
    if (channel.type === 'sapjam' && !_.get(req.body, ['value', 0, '@sapjam.event.categories']).includes('message_received')) {
      console.log(_.get(req.body, 'value', 0, '@sapjam.event.categories'))
      throw new StopPipeline()
    }

    /* We will ignore events in which the channel's user is the actor */
    if (_.get(req.body, ['value', 0, '@sapjam.event.actor', 'Id']) === channel.userName) {
      throw new StopPipeline()
    }

    return channel
  }

  /* Call before entering the pipeline, to build the options object */
  static extractOptions (req) {
    return {
      chatId: _.get(req.body, ['value', 0, '@sapjam.event.object', 'MessageThread', 'Id']),
      senderId: _.get(req.body, ['value', 0, '@sapjam.event.actor', 'Id']),
    }
  }

  /* Call before entering the pipeline, to send a isTyping message */
  static sendIsTyping (channel, options) {
    Logger.info('[SAPJam] sendIsTyping')
    return agent('POST', `${channel.serviceId}/api/v1/OData/MessageThread_Typing`)
      .query({ Id: `'${options.chatId}'` })
      .set('Authorization', `Bearer ${channel.apiKey}`)
      .send()
  }

  /* Call to update a conversation based on data from the message */
  static updateConversationWithMessage = (conversation, msg, opts) => { return Promise.all([conversation, msg, opts]) }

  /* Call to parse a message received from a channel */
  static parseChannelMessage (conversation, message, opts) {
    Logger.info('[SAPJam] parseChannelMessage')
    const msg = {
      attachment: {
        type: 'text',
        content: _.get(message, ['value', 0, '@sapjam.event.object', 'Text']),
      },
    }
    return [conversation, msg, { ...opts, mentioned: true }]
  }

  /* Call to format a message received by the bot */
  static formatMessage (conversation, message, opts) {
    Logger.info('[SAPJam] formatMessage')
    const { type, content } = _.get(message, 'attachment', {})

    switch (type) {
    case 'text':
      return { Text: content }
    case 'picture':
      return { Text: 'not yet supported' }
    case 'video':
      return { Text: 'not yet supported' }
    case 'list': {
      return { Text: 'not yet supported' }
    }
    case 'quickReplies': {
      return {
        Text: content.title,
        Cards: [{
          __metadata: {
            uri: 'Cards(Id=\'\')',
            type: 'SAPJam.Card',
          },
          Actions: content.buttons.map(button => ({
            __metadata: {
              uri: 'CardActions(Id=\'\')',
              type: 'SAPJam.CardAction',
            },
            ActionType: 'Button',
            Name: button.value,
            Value: button.value,
            Label: button.title,
          })),
        }],
      }
    }
    case 'card': {
      return {
        Text: 'This is a card:',
        Cards: [{
          __metadata: {
            uri: 'Cards(Id=\'\')',
            type: 'SAPJam.Card',
          },
          Title: content.title,
          Subtitle: content.subtitle,
          Actions: content.buttons.map(button => ({
            __metadata: {
              uri: 'CardActions(Id=\'\')',
              type: 'SAPJam.CardAction',
            },
            ActionType: 'Button',
            Name: button.value,
            Value: button.value,
            Label: button.title,
          })),
        }],
      }
    }
    case 'carousel':
    case 'carouselle': {
      return {
        Text: 'This is a carousel:',
        Cards: content.map(card => ({
          __metadata: {
            uri: 'Cards(Id=\'\')',
            type: 'SAPJam.Card',
          },
          Title: card.title,
          Subtitle: card.subtitle,
          Actions: card.buttons.map(button => ({
            __metadata: {
              uri: 'CardActions(Id=\'\')',
              type: 'SAPJam.CardAction',
            },
            ActionType: 'Button',
            Name: button.value,
            Value: button.value,
            Label: button.title,
          })),
        }))
      }
    }
    default:
      throw new BadRequestError('Message type non-supported by SAP Jam')
    }
  }

  /* Call to send a message to the channel conversation */
  static async sendMessage (conversation, message) {
    Logger.info('[SAPJam] sendMessage')
    await agent('POST', `${conversation.channel.serviceId}/api/v1/OData/MessageThreads('${conversation.chatId}')/Messages`)
      .set('Authorization', `Bearer ${conversation.channel.apiKey}`)
      .send(message)
  }
}
