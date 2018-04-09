import chai from 'chai'
import chaiHttp from 'chai-http'
import mongoose from 'mongoose'

import Connector from '../../src/models/Connector.model'
import Conversation from '../../src/models/Conversation.model'
import Channel from '../../src/models/Channel.model'

import MessagesController from '../../src/controllers/Messages.controller'

import sinon from 'sinon'

const assert = require('chai').assert
const expect = chai.expect
const should = chai.should()

chai.use(chaiHttp)

function clearDB () {
  for (const i in mongoose.connection.collections) {
    if (mongoose.connection.collections.hasOwnProperty(i)) {
      mongoose.connection.collections[i].remove()
    }
  }
}

const url = 'https://bonjour.com'
const baseUrl = 'http://localhost:8080'
const updatedUrl = 'https://aurevoir.com'

describe('Messages controller', () => {
  describe('postMessages', () => {
    after(async () => clearDB())

    it('should send messages to all connectors conversation', async () => {
      let connector = await new Connector({ url: 'url' }).save()
      const channel1 = await new Channel({
        connector: connector,
        slug: 'channel-1',
        type: 'slack',
        token: 'abcd',
        isActivated: true,
      }).save()
      const convers1 = await new Conversation({
        channel: channel1,
        connector: connector,
        isActive: true,
        chatId: '123',
      }).save()
      channel1.conversations = [convers1._id]
      await channel1.save()

      const channel2 = await new Channel({
        connector: connector,
        slug: 'channel-2',
        type: 'slack',
        token: 'abcd',
        isActivated: true,
      }).save()
      const convers2 = await new Conversation({
        channel: channel2,
        connector: connector,
        isActive: true,
        chatId: '1234',
      }).save()
      channel2.conversations = [convers2._id]
      await channel2.save()

      connector.channels = [channel1, channel2]
      connector.conversations = [convers1, convers2]
      await connector.save()

      // With valid json parameter
      let stub = sinon.stub(MessagesController, 'postToConversation', () => { true })
      let res = await chai.request(baseUrl).post(`/connectors/${connector._id.toString()}/messages`).send({
        messages: [{
          type: 'text',
          content: 'Hello'
        }],
      })
      expect(res.status).to.equal(201)
      expect(res.body.message).to.equal('Messages successfully posted')
      expect(stub.callCount).to.equal(2)
      stub.restore()

      // With valid string parameter
      stub = sinon.stub(MessagesController, 'postToConversation', () => { true })
      res = await chai.request(baseUrl).post(`/connectors/${connector._id.toString()}/messages`).send({
        messages: JSON.stringify([{ type: 'text', content: 'Hello' }]),
      })
      expect(res.status).to.equal(201)
      expect(res.body.message).to.equal('Messages successfully posted')
      expect(stub.callCount).to.equal(2)
      stub.restore()

      // With invalid string parameter
      stub = sinon.stub(MessagesController, 'postToConversation', () => { throw new Error('error') })
      try {
        res = await chai.request(baseUrl).post(`/connectors/${connector._id.toString()}/messages`).send({
          messages: '[,{ "type": "text",, "content": "Hello" }]]'
        })
        should.fail()
      } catch (err) {
        res = err.response
        const { message, results } = res.body

        expect(res.status).to.equal(400)
        expect(res.body.message).to.equal("Invalid 'messages' parameter")
        expect(stub.callCount).to.equal(0)
      } finally {
        stub.restore()
      }

      // With error in postToConversation
      stub = sinon.stub(MessagesController, 'postToConversation', () => { throw new Error('error') })
      try {
        res = await chai.request(baseUrl).post(`/connectors/${connector._id.toString()}/messages`).send({
          messages: [{
            type: 'text',
            content: 'Hello'
          }]
        })
        should.fail()
      } catch (err) {
        res = err.response
        const { message, results } = res.body

        expect(res.status).to.equal(500)
        expect(res.body.message).to.equal('Error while posting message')
        expect(stub.callCount).to.equal(1)
      } finally {
        stub.restore()
      }
    })
  })
})
