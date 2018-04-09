import chai from 'chai'
import chaiHttp from 'chai-http'
import config from '../../config'

import model from '../../src/models'
import Connector from '../../src/models/Connector.model'
import Channel from '../../src/models/Channel.model'
import Conversation from '../../src/models/Conversation.model'

const expect = chai.expect
const assert = chai.assert

chai.use(chaiHttp)

const url = 'http://bonjour.com'
const baseUrl = 'http://localhost:8080'
const channelPayload = {
  isActivated: true,
  slug: 'test',
  type: 'slack',
  token: 'test',
}
const conversationPayload = {
  isActive: true,
  chatId: 'test',
}

describe('Conversation controller', () => {
  let connector = {}
  let channel = {}
  let conversation = {}
  before(async () => {
    connector = await new Connector({ url }).save()
    channel = await new Channel({ connector: connector._id, ...channelPayload }).save()
    conversation = await new Conversation({ connector: connector._id, channel: channel._id, ...conversationPayload }).save()
    connector.conversations.push(conversation._id)
    await connector.save()
  })
  after(async () => await Promise.all([
    Connector.remove({}),
    Channel.remove({}),
    Conversation.remove({}),
  ]))

  describe('GET: get a connector conversations', () => {
    it('should be a 200 with conversations', async () => {
      const res = await chai.request(baseUrl).get(`/connectors/${connector._id}/conversations`).send()
      const { message, results } = res.body

      assert.equal(res.status, 200)
      assert.equal(results.length, 1)
      assert.equal(message, 'Conversations successfully rendered')
    })

    it('should be a 200 with no conversations', async () => {
      const connector = await new Connector({ url }).save()
      const res = await chai.request(baseUrl).get(`/connectors/${connector._id}/conversations`).send()
      const { message, results } = res.body

      assert.equal(res.status, 200)
      assert.equal(results.length, 0)
      assert.equal(message, 'No conversations')
    })

    it('should be a 404 with no connector', async () => {
      try {
        const connector = await new Connector({ url }).save()
        await Connector.remove({ _id: connector._id })
        const res = await chai.request(baseUrl).get(`/connectors/${connector._id}/conversations`).send()
      } catch (err) {
        const res = err.response
        const { message, results } = res.body

        assert.equal(res.status, 404)
        assert.equal(results, null)
        assert.equal(message, 'Connector not found')
      }
    })
  })

  describe('GET: get a conversation', () => {
    it('should be a 200 with a conversation', async () => {
      const res = await chai.request(baseUrl).get(`/connectors/${connector._id}/conversations/${conversation._id}`).send()
      const { message, results } = res.body

      assert.equal(res.status, 200)
      assert.equal(results.id, conversation._id)
      assert.equal(message, 'Conversation successfully rendered')
    })

    it('should be a 404 with no connector', async () => {
      try {
        const connector = await new Connector({ url }).save()
        await Connector.remove({ _id: connector._id })
        const res = await chai.request(baseUrl).get(`/connectors/${connector._id}/conversations/${conversation._id}`).send()
      } catch (err) {
        const res = err.response
        const { message, results } = res.body

        assert.equal(res.status, 404)
        assert.equal(results, null)
        assert.equal(message, 'Connector not found')
      }
    })

    it('should be a 404 with no connector', async () => {
      try {
        const conversation = await new Conversation({ connector: connectors._id, channel: channel._id, ...conversationPayload }).save()
        await Conversation.remove({ _id: conversation._id })
        const res = await chai.request(baseUrl).get(`/connectors/${connector._id}/conversations/${conversation._id}`).send()
        should.fail()
      } catch (err) {
        const res = err.response
        const { message, results } = res.body

        assert.equal(res.status, 404)
        assert.equal(results, null)
        assert.equal(message, 'Conversation not found')
      }
    })
  })

  describe('DELETE: delete a conversation', () => {
    it('should be a 204 with a conversation', async () => {
      const conversation = await new Conversation({ connector: connectors._id, channel: channel._id, ...conversationPayload }).save()
      const res = await chai.request(baseUrl).delete(`/connectors/${connector._id}/conversations/${conversation._id}`).send()
      const { message, results } = res.body

      assert.equal(res.status, 204)
      assert.equal(results, null)
      assert.equal(message, null)
    })

    it('should be a 404 with no conversation', async () => {
      try {
        const conversation = await new Conversation({ connector: connector._id, channel: channel._id, ...conversationPayload }).save()
        await Conversation.remove({ _id: conversation._id })
        const res = await chai.request(baseUrl).delete(`/connectors/${connector._id}/conversations/${conversation._id}`).send()
        should.fail()
      } catch (err) {
        const res = err.response
        const { message, results } = res.body

        assert.equal(res.status, 404)
        assert.equal(results, null)
        assert.equal(message, 'Conversation not found')
      }
    })
  })
})
