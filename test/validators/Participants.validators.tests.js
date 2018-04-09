import chai from 'chai'
import chaiHttp from 'chai-http'
import mongoose from 'mongoose'

import Connector from '../../src/models/Connector.model'

const assert = require('chai').assert
const expect = chai.expect
const should = chai.should()

chai.use(chaiHttp)

const url = 'https://bonjour.com'
const baseUrl = 'http://localhost:8080'

describe('Participant validator', () => {
  describe('getParticipantsByConnectorId', () => {
    it('should be a 400 with an invalid connector_id', async () => {
      try {
        await chai.request(baseUrl).get('/connectors/12345/participants').send()
        should.fail()
      } catch (err) {
        const res = err.response
        const { message, results } = res.body

        assert.equal(res.status, 400)
        assert.equal(results, null)
        assert.equal(message, 'Parameter connector_id is invalid')
      }
    })
  })

  describe('getParticipantByConnectorId', () => {
    let connector = {}
    before(async () => connector = await new Connector({ url }).save())
    after(async () => Connector.remove({}))

    it('should be a 400 with an invalid connector_id', async () => {
      try {
        await chai.request(baseUrl).get('/connectors/1234/participants/test').send()
        should.fail()
      } catch (err) {
        const res = err.response
        const { message, results } = res.body

        assert.equal(res.status, 400)
        assert.equal(results, null)
        assert.equal(message, 'Parameter connector_id is invalid')
      }
    })

    it('should be a 400 with an invalid participant_id', async () => {
      try {
        await chai.request(baseUrl).get(`/connectors/${connector._id}/participants/test`).send()
        should.fail()
      } catch (err) {
        const res = err.response
        const { message, results } = res.body

        assert.equal(res.status, 400)
        assert.equal(results, null)
        assert.equal(message, 'Parameter participant_id is invalid')
      }
    })
  })
})


