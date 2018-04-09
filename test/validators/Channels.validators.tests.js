import chai from 'chai'
import chaiHttp from 'chai-http'
import mongoose from 'mongoose'

import Connector from '../../src/models/Connector.model'
import Channel from '../../src/models/Channel.model'

const assert = require('chai').assert
const expect = chai.expect
const should = chai.should()

chai.use(chaiHttp)

const url = 'https://test.com'
const baseUrl = 'http://localhost:8080'
const payload = {
  type: 'slack',
  isActivated: true,
  slug: 'test',
}

describe('Channel validator', () => {
  describe('createChannelByConnectorId', () => {
    let connector = {}
    before(async () => connector = await new Connector({ url }))
    after(async () => await Connector.remove({}))

    it ('should be a 404 with an invalid connector_id', async () => {
      const payload = { type: 'slack', isActivated: true, slug: 'slug-test' }
      try {
        await chai.request(baseUrl).post('/connectors/1234/channels').send(payload)
        should.fail()
      } catch (err) {
        const res = err.response

        assert.equal(res.status, 404)
        assert.equal(res.body.message, 'Connector not found')
      }
    })

    it('should be a 400 with a missing type', async () => {
      const payload = { isActivated: true, slug: 'slug-test' }
      try {
        await chai.request(baseUrl).post(`/connectors/${connector._id}/channels`).send(payload)
        should.fail()
      } catch (err) {
        const res = err.response

        assert.equal(res.status, 400)
        assert.equal(res.body.message, 'Parameter type is missing')
      }
    })

    it ('should be a 400 with an invalid type', async () => {
      const payload = { type: 'invalid', isActivated: true, slug: 'slug-test' }
      try {
        await chai.request(baseUrl).post(`/connectors/${connector._id}/channels`).send(payload)
        should.fail()
      } catch (err) {
        const res = err.response

        assert.equal(res.status, 400)
        assert.equal(res.body.message, 'Parameter type is invalid')
      }
    })

    it ('should be a 400 with a missing isActivated', async () => {
      const payload = { type: 'slack', slug: 'slug-test', token: 'slack-token' }
      try {
        await chai.request(baseUrl).post(`/connectors/${connector._id}/channels`).send(payload)
        should.fail()
      } catch (err) {
        const res = err.response

        assert.equal(res.status, 404)
        assert.equal(res.body.message, 'Parameter isActivated is missing')
      }
    })

    it ('should be a 400 with a missing slug', async () => {
      const payload = { type: 'slack', isActivated: true }
      try {
        await chai.request(baseUrl).post(`/connectors/${connector._id}/channels`).send(payload)
        should.fail()
      } catch (err) {
        const res = err.response

        assert.equal(res.status, 400)
        assert.equal(res.body.message, 'Parameter slug is missing')
      }
    })

  })

  describe('getChannelsByConnectorId', () => {
    it ('should be a 404 with an invalid connector_id', async () => {
      try {
        await chai.request(baseUrl).get('/connectors/1234/channels').send()
        should.fail()
      } catch (err) {
        const res = err.response

        assert.equal(res.status, 404)
        assert.equal(res.body.message, 'Connector not found')
      }
    })
  })

  describe('getChannelByConnectorId', () => {
    let connector = {}
    before(async () => connector = await new Connector({ url }).save())
    after(async () => Connector.remove({}))

    it ('should be a 404 with an invalid connector_id', async () => {
      try {
        await chai.request(baseUrl).get('/connectors/1234/channels/1234').send()
        should.fail()
      } catch (err) {
        const res = err.response

        assert.equal(res.status, 404)
        assert.equal(res.body.message, 'Channel not found')
      }
    })
  })

  describe('updateChannelByConnectorId', () => {
    let connector = {}
    let channel = {}
    before(async () => {
      connector = await new Connector({ url }).save()
      channel = await new Channel({ ...payload, connector: connector._id }).save()
    })
    after(async () => Promise.all([Connector.remove({}), Channel.remove({})]))

    it ('should be a 404 with an invalid connector_id', async () => {
      try {
        await chai.request(baseUrl).put(`/connectors/1234/channels/${channel._slug}`).send()
        should.fail()
      } catch (err) {
        const res = err.response

        assert.equal(res.status, 404)
        assert.equal(res.body.message, 'Channel not found')
      }
    })

    it ('should be a 409 with an invalid connector_id', async () => {
      try {
        await new Channel({ ...payload, slug: 'test1', connector: connector._id }).save()
        await chai.request(baseUrl).put(`/connectors/${connector._id}/channels/${channel.slug}`).send({ slug: 'test1' })
        should.fail()
      } catch (err) {
        const res = err.response

        assert.equal(res.status, 409)
        assert.equal(res.body.message, 'Channel slug already exists')
      }
    })
  })

  describe('deleteChannelConnectorById', () => {
    it ('should be a 404 with an invalid connector_id', async () => {
      try {
        await chai.request(baseUrl).del(`/connectors/1234/channels/test`).send()
        should.fail()
      } catch (err) {
        const res = err.response

        assert.equal(res.status, 404)
        assert.equal(res.body.message, 'Channel not found')
      }
    })
  })
})
