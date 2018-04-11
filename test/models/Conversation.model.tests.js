import chai from 'chai'
import chaiHttp from 'chai-http'

import Connector from '../../src/models/Connector.model'
import Channel from '../../src/models/Channel.model'
import Conversation from '../../src/models/Conversation.model'

const assert = chai.assert
const expect = chai.expect

chai.use(chaiHttp)

let connector = null
let channel = null
let payload = null

describe('Conversation Model', () => {
  before(async () => {
    connector = await new Connector({ url: 'https://bonjour.com' }).save()
    channel = await new Channel({ connector: connector._id, type: 'kik', slug: 'kik', isActivated: true }).save()

    payload = {
      channel: channel._id,
      connector: connector._id,
      chatId: 'testChatId',
    }
  })

  after(async () => {
    await Promise.all([
      Connector.remove({}),
      Channel.remove({}),
      Conversation.remove({}),
    ])
  })

  describe('Create conversation', () => {
    after(async () => Conversation.remove({}))

    it('can create conversation when no one created', async () => {
      const conversation = await new Conversation(payload)

      assert.equal(conversation.connector, payload.connector)
      assert.equal(conversation.channel, payload.channel)
      assert.equal(conversation.chatId, payload.chatId)
    })
  })

  describe('List Conversations', () => {
    after(async () => Conversation.remove({}))

    it('can list Conversations when no one exists', async () => {
      const conversations = await Conversation.find({}).exec()
      expect(conversations).to.have.length(0)
    })

    it('can list 1 conversation', async () => {
      await Promise.all([
        new Conversation(payload).save(),
        new Conversation(payload).save(),
      ])

      const conversations = await Conversation.find({}).exec()
      expect(conversations).to.have.length(2)
    })
  })

  describe('Delete Channel', () => {
    after(async () => Conversation.remove({}))

    it('can remove conversation', async () => {
      await new Conversation(payload).save()
      const deletedConversations = await Conversation.remove({})

      assert.equal(deletedConversations.result.n, 1)
    })
  })
})
