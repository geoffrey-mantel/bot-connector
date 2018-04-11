import chai from 'chai'
import chaiHttp from 'chai-http'
import sinon from 'sinon'

import model from '../../src/models'
import Connector from '../../src/models/Connector.model'
import Channel from '../../src/models/Channel.model'
import KikService from '../../src/services/Kik.service'

import config from '../../config'

const assert = require('chai').assert
const expect = chai.expect
const should = chai.should()

chai.use(chaiHttp)

const url = 'https://bonjour.com'
const baseUrl = 'http://localhost:8080'
const channelPayload = {
  type: 'slack',
  isActivated: true,
  slug: 'slack-test',
  token: 'test-token',
}

describe('Channel controller', () => {
  let connector = {}
  before(async () => connector = await Connector({ url }).save())
  after(async () => await Connector.remove({}))

  describe('POST: create a channel', () => {
    afterEach(async () => Promise.all([Channel.remove({})]))

    it ('should be a 201', async () => {
      const res = await chai.request(baseUrl).post(`/connectors/${connector._id}/channels`)
        .send(channelPayload)
      const { message, results } = res.body

      assert.equal(res.status, 201)
      assert.equal(results.type, channelPayload.type)
      assert.equal(results.isActivated, channelPayload.isActivated)
      assert.equal(results.slug, channelPayload.slug)
      assert.equal(results.token, channelPayload.token)
      assert.equal(message, 'Channel successfully created')
    })

  it ('should be a 404 with no connectors', async () => {
    try {
      const newConnector = await new Connector({ url }).save()
      await Connector.remove({ _id: newConnector._id })
      const res = await chai.request(baseUrl).post(`/connectors/${newConnector._id}/channels`)
        .send(channelPayload)
      should.fail()
    } catch (err) {
      const res = err.response
      const { message, results } = res.body

      assert.equal(res.status, 404)
      assert.equal(results, null)
      assert.equal(message, 'Connector not found')
    }
  })

  it ('should be a 409 with a slug already existing', async () => {
    const payload = { type: 'slack', isActivated: true, slug: 'test', token: 'test-token' }
    const channel = await new Channel({ ...payload, connector: connector._id }).save()
    connector.channels.push(channel._id)
    await connector.save()

    try {
      await chai.request(baseUrl).post(`/connectors/${connector._id}/channels`).send(payload)
      should.fail()
    } catch (err) {
      const res = err.response

      assert.equal(res.status, 409)
      assert.equal(res.body.message, 'Channel slug is already taken')
    }
  })
})

  describe('GET: get a connector\'s channels', () => {
   afterEach(async () => Channel.remove({}))

    it ('should be a 200 with channels', async () => {
      const channel1 = await new Channel({ connector: connector._id, ...channelPayload }).save()
      const channel2 = await new Channel({ connector: connector._id, ...channelPayload }).save()
      connector.channels.push(channel1._id)
      connector.channels.push(channel2._id)
      await connector.save()

      const res = await chai.request(baseUrl).get(`/connectors/${connector._id}/channels`).send()
      const { message, results } = res.body

      assert.equal(res.status, 200)
      assert.equal(results.length, 2)
      assert.equal(message, 'Channels successfully rendered')
    })

    it ('should be a 200 with no channels', async () => {
      const res = await chai.request(baseUrl).get(`/connectors/${connector._id}/channels`).send()
      const { message, results } = res.body

      assert.equal(res.status, 200)
      assert.equal(results.length, 0)
      assert.equal(message, 'No channels')
    })
  })

  describe('GET: get a connector\'s channel', () => {
    afterEach(async () => Channel.remove({}))

    it('should be a 200 with a channel', async () => {
      const channel = await new Channel({ connector: connector._id, ...channelPayload }).save()
      const res = await chai.request(baseUrl).get(`/connectors/${connector._id}/channels/${channel.slug}`).send()
      const { message, results } = res.body

      assert.equal(res.status, 200)
      assert.equal(results.id, channel._id)
      assert.equal(results.slug, channel.slug)
      assert.equal(message, 'Channel successfully rendered')
    })

    it('should be a 404 with no channels', async () => {
      try {
        const channel = await new Channel({ connector: connector._id, ...channelPayload }).save()
        await Channel.remove({})
        const res = await chai.request(baseUrl).get(`/connectors/${connector._id}/channels/${channel.slug}`).send()
        should.fail()
      } catch (err) {
        const res = err.response
        const { message, results } = res.body

        assert.equal(res.status, 404)
        assert.equal(results, null)
        assert.equal(message, 'Channel not found')
      }
    })
  })

  describe('PUT: update a channel', () => {
    afterEach(async () => Channel.remove({}))

    it('should be a 200 with a channel', async () => {
      const channel = await new Channel({ connector: connector._id, ...channelPayload }).save()
      const res = await chai.request(baseUrl).put(`/connectors/${connector._id}/channels/${channel.slug}`).send({ slug: 'updatedSlug' })
      const { message, results } = res.body

      assert.equal(res.status, 200)
      assert.equal(results.slug, 'updatedSlug')
      assert.equal(message, 'Channel successfully updated')
    })

    it('should be a 404 with no channels', async () => {
      try {
        const channel = await new Channel({ connector: connector._id, ...channelPayload }).save()
        await Channel.remove({})
        const res = await chai.request(baseUrl).put(`/connectors/${connector._id}/channels/${channel.slug}`).send()
        should.fail()
      } catch (err) {
        const res = err.response
        const { message, results } = res.body

        assert.equal(res.status, 404)
        assert.equal(results, null)
        assert.equal(message, 'Channel not found')
      }
    })
  })

  describe('DELETE: delete a channel', () => {
    it('should be a 200 with a channel', async () => {
      const channel = await new Channel({ connector: connector._id, ...channelPayload }).save()
      connector.channels.push(channel._id)
      await connector.save()

      const res = await chai.request(baseUrl).del(`/connectors/${connector._id}/channels/${channel.slug}`).send()
      const { message, results } = res.body

      assert.equal(res.status, 200)
      assert.equal(results, null)
      assert.equal(message, 'Channel successfully deleted')
    })

    it('should be a 404 with no channels', async () => {
      try {
        const channel = await new Channel({ connector: connector._id, ...channelPayload }).save()
        await Channel.remove({})
        const res = await chai.request(baseUrl).del(`/connectors/${connector._id}/channels/${channel.slug}`).send()
        should.fail()
      } catch (err) {
        const res = err.response
        const { message, results } = res.body

        assert.equal(res.status, 404)
        assert.equal(results, null)
        assert.equal(message, 'Channel not found')
      }
    })
  })
})
