import chai from 'chai'
import chaiHttp from 'chai-http'
import mongoose from 'mongoose'

const assert = require('chai').assert
const expect = chai.expect
const should = chai.should()

chai.use(chaiHttp)

const baseUrl = 'http://localhost:8080'

describe('Webhook validator', () => {
  describe('forwardMessage', () => {
    it('should be a 404 with an invalid channel_id', async () => {
      try {
        await chai.request(baseUrl).post('/webhook/12345').send()
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

  describe('subscribeWebhook', () => {
    it('should be a 404 with an invalid channel_id', async () => {
      try {
        await chai.request(baseUrl).get('/webhook/12345').send()
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


