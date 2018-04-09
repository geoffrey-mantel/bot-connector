import chai from 'chai'
import chaiHttp from 'chai-http'
import mongoose from 'mongoose'

import Connector from '../../src/models/Connector.model'

const assert = require('chai').assert
const expect = chai.expect

chai.use(chaiHttp)

const fakeConnector = { url: 'https://recast.ai' }
const fakeId = '57fe26383750e0379bee8aca'

function clearDB () {
  for (const i in mongoose.connection.collections) {
    if (mongoose.connection.collections.hasOwnProperty(i)) {
      mongoose.connection.collections[i].remove()
    }
  }
}

describe('Connector Model', () => {
  describe('Create connector', () => {
    describe('Create a connector when db is empty:', () => {
      after(async () => clearDB())

      it('can create connector when no one exists', async () => {
        const connector = await new Connector({ url: fakeConnector.url }).save()
        assert.equal(connector.url, fakeConnector.url)
      })
    })

    describe('Create a connector when db have a connector', () => {
      before(async () => new Connector({ url: fakeConnector.url }).save())
      after(async () => clearDB())

      it('can create connector when one exists', async () => {
        const connector = await new Connector({ url: fakeConnector.url }).save()
        assert.equal(connector.url, fakeConnector.url)
      })
    })
  })

  describe('List connector', () => {
    describe('List connector when no one exist', () => {
      after(async () => clearDB())

      it('can list connector when no one exists', async () => {
        const connectors = await Connector.find({}).exec()
        expect(connectors).to.have.length(0)
      })
    })

    describe('List connectors when two exist', () => {
      before(async () => Promise.all([
        new Connector({ url: 'https://hello.com' }).save(),
        new Connector({ url: 'https://bye.com' }).save(),
      ]))
      after(async () => clearDB())

      it('can list connectors when two exists', async () => {
        const connectors = await Connector.find({})
        expect(connectors).to.have.length(2)
      })
    })
  })

  describe('Update connector', () => {
    describe('can update connector when one connector exist', () => {
      let connector = {}
      before(async () => connector = await new Connector({ url: fakeConnector.url }).save())
      after(async () => clearDB())

      it('can updated connectors when one connector exists', async () => {
        const updatedConnector = await Connector.findOneAndUpdate({ _id: connector._id }, { $set: { url: 'https://updated.com' } }, { new: true }).exec()
        assert.equal(updatedConnector.url, 'https://updated.com')
      })
    })
  })

  describe('Delete connector', () => {
    describe('can delete connector when no connector exist', () => {
      after(async () => clearDB())

      it('can delete connector when id not found', async () => {
        const deletedConnectors = await Connector.remove({ _id: fakeId })
        assert.equal(deletedConnectors.result.n, 0)
      })
    })

    describe('can delete connector when one connector exist', () => {
      let connector = {}
      before(async () => connector = await new Connector({ url: fakeConnector.url }).save())
      after(async () => clearDB())

      it('can delete connector when one exists', async () => {
        const deletedConnectors = await Connector.remove({ _id: connector._id })
        assert.equal(deletedConnectors.result.n, 1)
      })
    })
  })

})
