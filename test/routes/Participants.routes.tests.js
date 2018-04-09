import chai from 'chai'
import fetchMethod from '../services/fetchMethod.service'

import ParticipantsController from '../../src/controllers/Participants.controller'

describe("Routes", () => {
  it("GET /connectors/:connector_id/participants", done => {
    chai.expect(fetchMethod('GET', '/connectors/:connector_id/participants')).to.equal(ParticipantsController.getParticipantsByConnectorId)
    done()
  })

  it("GET /connectors/:connector_id/participants/:participant_id", done => {
    chai.expect(fetchMethod('GET', '/connectors/:connector_id/participants/:participant_id')).to.equal(ParticipantsController.getParticipantByConnectorId)
    done()
  })
})
