import chai from 'chai'
import chaiHttp from 'chai-http'
import mongoose from 'mongoose'
import Connector from '../../src/models/Connector.model'
import Conversation from '../../src/models/Conversation.model'
import Channel from '../../src/models/Channel.model'

import ConnectorsController from '../../src/controllers/Connectors.controller'

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

describe('Connector controller', () => {
  describe('POST: create a connector', () => {
    after(async () => clearDB())
    it ('should be a 201', async () => {
      const res = await chai.request(baseUrl)
        .post('/connectors').send({ url })
      const { message, results } = res.body

      assert.equal(res.status, 201)
      assert.equal(results.url, url)
      assert.equal(message, 'Connector successfully created')
    })
  })

  describe('GET: get connectors', async () => {
    after(async () => clearDB())
    afterEach(async () => clearDB())

    it ('should be a 200 with connectors', async () => {
      await Promise.all([
        new Connector({ url }).save(),
        new Connector({ url }).save(),
      ])
      const res = await chai.request(baseUrl).get('/connectors').send()
      const { message, results } = res.body

      assert.equal(res.status, 200)
      assert.equal(results.length, 2)
      assert.equal(message, 'Connectors successfully found')
    })

    it ('should be a 200 with no connectors', async () => {
      const res = await chai.request(baseUrl).get('/connectors').send()
      const { message, results } = res.body

      assert.equal(res.status, 200)
      assert.equal(results.length, 0)
      assert.equal(message, 'No Connectors')
    })
  })

  describe('GET: get connector by id', () => {
    after(async () => clearDB())

    it ('should be a 200 with connectors', async () => {
      const connector = await new Connector({ url }).save()
      const res = await chai.request(baseUrl).get(`/connectors/${connector._id}`).send()
      const { message, results } = res.body

      assert.equal(res.status, 200)
      assert.equal(results.id, connector._id)
      assert.equal(results.url, connector.url)
      assert.equal(message, 'Connector successfully found')
    })

    it ('should be a 404 with no connectors', async () => {
      try {
        await chai.request(baseUrl).get('/connectors/582a4ced73b15653c074606b').send()
        should.fail()
      } catch (err) {
        const res = err.response
        const { message, results } = res.body

        assert.equal(res.status, 404)
        assert.equal(results, null)
        assert.equal(message, 'Connector not found')
      }
    })
  })

  describe('PUT: update a connector', () => {
    let connector = {}
    before(async () => connector = await new Connectors({ url }).save())
    after(async () => clearDB())

    it ('should be a 200', async () => {
      const res = await chai.request(baseUrl).put(`/connectors/${connector._id}`)
        .send({ url: updatedUrl })
      const { message, results } = res.body

      assert.equal(res.status, 200)
      assert.equal(results.url, updatedUrl)
      assert.equal(message, 'Connector successfully updated')
    })

    it ('should be a 404 with no connectors', async () => {
      try {
        await chai.request(baseUrl).put('/connectors/582a4ced73b15653c074606b').send({ url })
        should.fail()
      } catch (err) {
        const res = err.response
        const { message, results } = res.body

        assert.equal(res.status, 404)
        assert.equal(results, null)
        assert.equal(message, 'Connector not found')
      }
    })
  })

  describe('DELETE: delete a connector', () => {
    it ('should be a 200', async () => {
      const connector = await new Connector({ url }).save()
      const res = await chai.request(baseUrl).del(`/connectors/${connector._id}`).send()
      const { message, results } = res.body

      assert.equal(res.status, 200)
      assert.equal(results, null)
      assert.equal(message, 'Connector successfully deleted')
    })

    it ('should be a 404 with no connectors', async () => {
      try {
        await chai.request(baseUrl).del('/connectors/582a4ced73b15653c074606b').send({ url })
        should.fail()
      } catch (err) {
        const res = err.response
        const { message, results } = res.body

        assert.equal(res.status, 404)
        assert.equal(results, null)
        assert.equal(message, 'Connector not found')
      }
    })
  })
})
