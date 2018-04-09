import chai from 'chai'
import fetchMethod from '../services/fetchMethod.service'

import config from '../../config/test'

import connectorController from '../../src/controllers/Connectors.controller'

describe("Routes", () => {
  it("GET /connectors/:connector_id", done => {
    chai.expect(fetchMethod('GET', '/connectors/:connector_id')).to.equal(connectorController.getConnectorById)
    done()
  })

  it("GET /connectors", done => {
    chai.expect(fetchMethod('GET', '/connectors')).to.equal(connectorController.getConnectors)
    done()
  })

  it("POST /connectors", done => {
    chai.expect(fetchMethod('POST', '/connectors')).to.equal(connectorController.createConnector)
    done()
  })

  it("PUT /connectors/:connector_id", done => {
    chai.expect(fetchMethod('PUT', '/connectors/:connector_id')).to.equal(connectorController.updateConnectorById)
    done()
  })
  it("DELETE /connectors/:connector_id", done => {
    chai.expect(fetchMethod('DELETE', '/connectors/:connector_id')).to.equal(connectorController.deleteConnectorById)
    done()
  })
})
