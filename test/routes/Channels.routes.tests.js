import chai from 'chai'
import fetchMethod from '../services/fetchMethod.service'
import config from '../../config/test'
import channelController from '../../src/controllers/Channels.controller'

describe("Routes", () => {
  it("POST /connectors/:connector_id/channels", done => {
    chai.expect(fetchMethod('POST', '/connectors/:connector_id/channels')).to.equal(channelController.createChannelByConnectorId)
    done()
  })
  it("GET /connectors/:connector_id/channels", done => {
    chai.expect(fetchMethod('GET', '/connectors/:connector_id/channels')).to.equal(channelController.getChannelsByConnectorId)
    done()
  })
  it("GET /connectors/:connector_id/channels/:channel_slug", done => {
    chai.expect(fetchMethod('GET', '/connectors/:connector_id/channels/:channel_slug')).to.equal(channelController.getChannelByConnectorId)
    done()
  })
  it("PUT /connectors/:connector_id/channels/:channel_slug", done => {
    chai.expect(fetchMethod('PUT', '/connectors/:connector_id/channels/:channel_slug')).to.equal(channelController.updateChannelByConnectorId)
    done()
  })
  it("DELETE /connectors/:connector_id/channels/:channel_slug", done => {
    chai.expect(fetchMethod('DELETE', '/connectors/:connector_id/channels/:channel_slug')).to.equal(channelController.deleteChannelByConnectorId)
    done()
  })
})
