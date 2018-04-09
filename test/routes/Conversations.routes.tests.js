import config from '../../config'
import ConversationController from '../../src/controllers/Conversations.controller'
import fetchMethod from '../services/fetchMethod.service'
const chai = require('chai')
const chaiHttp = require('chai-http')

const expect = chai.expect
chai.use(chaiHttp)

const Connector = require('../../src/models/Connector.model.js')

describe('Conversation Routes', () => {

  it('Should call function getConversationsByConnectorId: GET /connectors/:connector_id/conversations', (done) => {
    chai.expect(fetchMethod('GET', '/connectors/:connector_id/conversations')).to.equal(ConversationController.getConversationsByConnectorId)
    done()
  })

  it('Should call function getConversationByConnectorId: GET /connectors/:connector_id/conversations/conversation_id', (done) => {
    chai.expect(fetchMethod('GET', '/connectors/:connector_id/conversations/:conversation_id')).to.equal(ConversationController.getConversationByConnectorId)
    done()
  })

  it('Should call function deleteConversationByConnectorId: DELETE /connectors/:connector_id/conversations/:conversation_id', (done) => {
    chai.expect(fetchMethod('DELETE', '/connectors/:connector_id/conversations/:conversation_id')).to.equal(ConversationController.deleteConversationByConnectorId)
    done()
  })
})
