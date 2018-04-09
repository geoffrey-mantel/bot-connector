import chai from 'chai'
import chaiHttp from 'chai-http'
import mongoose from 'mongoose'

import Connector from '../../src/models/Connector.model'

const assert = require('chai').assert
const expect = chai.expect
const should = chai.should()

chai.use(chaiHttp)

const baseUrl = 'http://localhost:8080'

describe('Connector validator', () => {
  describe('createConnector', () => {
    it('should be a 400 with an invalid url', async () => {
      try {
        await chai.request(baseUrl).post('/connectors').send()
        should.fail()
      } catch (err) {
        const res = err.response

        assert.equal(res.status, 400)
        assert.equal(res.body.message, 'Parameter url is missing')
      }
    })
  })

  describe('getConnectorById', () => {
    it('should be a 404 with an invalid connector_id', async () => {
      try {
        await chai.request(baseUrl).get('/connectors/12345').send()
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

  describe('updateConnectorById', () => {
    let connector = {}
    before(async () => connector = await new Connector({ url: 'https://test.com' }))

    it('should be a 404 with an invalid connector_id', async () => {
      try {
        await chai.request(baseUrl).put('/connectors/12345').send()
        should.fail()
      } catch (err) {
        const res = err.response
        const { message, results } = res.body

        assert.equal(res.status, 404)
        assert.equal(results, null)
        assert.equal(message, 'Connector not found')
      }
    })

    it('should be a 400 with an invalid url', async () => {
      try {
        const res = await chai.request(baseUrl).put(`/connectors/${connector._id}`).send({ url: 'invalid' })
        should.fail()
      } catch (err) {
        const res = err.response
        const { message, results } = res.body

        assert.equal(res.status, 400)
        assert.equal(results, null)
        assert.equal(message, 'Parameter url is invalid')
      }
    })
  })

  describe('deleteConnectorById', () => {
    it('should be a 404 with an invalid connector_id', async () => {
      try {
        await chai.request(baseUrl).del('/connectors/12345').send()
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

