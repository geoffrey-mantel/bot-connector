import mongoose from 'mongoose'
import chai from 'chai'
import chaiHttp from 'chai-http'

import Connector from '../../src/models/Connector.model.js'
import Channel from '../../src/models/Channel.model.js'
import Conversation from '../../src/models/Conversation.model.js'
import Participant from '../../src/models/Participant.model.js'

chai.use(chaiHttp)

const expect = chai.expect

let connector = null
let channel = null
let conversation1 = null
let conversation2 = null
let participant1 = null
let participant2 = null
let participant3 = null
let participant4 = null

function clearDB () {
  for (const i in mongoose.connection.collections) {
    if (mongoose.connection.collections.hasOwnProperty(i)) {
      mongoose.connection.collections[i].remove()
    }
  }
}

describe('Participant controller', () => {
  describe('should list connector participants', () => {
    describe('with no participant', () => {
      before(done => {
        connector = new Connector()
        channel = new Channel()
        conversation1 = new Conversation()

        connector.url = 'http://fallback.fr'

        channel.connector = connector._id
        channel.slug = 'kik-1'
        channel.type = 'kik'
        channel.isActivated = true

        connector.channels.push(channel._id)

        conversation1.channel = channel._id
        conversation1.connector = connector._id
        conversation1.isActive = true
        conversation1.chatId = 'myChatId'

        connector.conversations.push(conversation1._id)

        conversation1.save(() => {
          channel.save(() => {
            connector.save(() => {
              done()
            })
          })
        })
      })

      after(done => {
        connector = null
        channel = null
        conversation1 = null
        clearDB()
        done()
      })

      it('should be a 404 with a not valid connector_id', done => {
        chai.request('http://localhost:8080')
        .get(`/connectors/1/participants`)
        .send()
        .end((err, res) => {
          chai.should(err).exist
          chai.expect(res.status).to.equal(404)
          chai.expect(res.body.results).to.equal(null)
          chai.expect(res.body.message).to.equal('Connector not found')
          done()
        })
      })

      it('should be a 200', done => {
        chai.request('http://localhost:8080')
        .get(`/connectors/${connector._id}/participants`)
        .send()
        .end((err, res) => {
          chai.should(err).not.exist
          chai.expect(res.status).to.equal(200)
          chai.expect(res.body.results).to.be.an('array')
          chai.expect(res.body.results.length).to.equal(0)
          chai.expect(res.body.message).to.equal('No participants')
          done()
        })
      })
    })

    describe('with many conversations and many participants', () => {
      before(done => {
        connector = new Connector()
        channel = new Channel()
        conversation1 = new Conversation()
        conversation2 = new Conversation()
        participant1 = new Participant()
        participant2 = new Participant()
        participant3 = new Participant()
        participant4 = new Participant()

        connector.url = 'http://fallback.fr'

        channel.connector = connector._id
        channel.slug = 'kik-1'
        channel.type = 'kik'
        channel.isActivated = true

        connector.channels.push(channel._id)

        conversation1.channel = channel._id
        conversation1.connector = connector._id
        conversation1.isActive = true
        conversation1.chatId = 'myChatId'

        connector.conversations.push(conversation1._id)

        conversation2.channel = channel._id
        conversation2.connector = connector._id
        conversation2.isActive = true
        conversation2.chatId = 'myChatId2'

        connector.conversations.push(conversation2._id)

        participant1.isBot = true

        conversation1.participants.push(participant1._id)

        participant2.isBot = false


        conversation1.participants.push(participant2._id)

        participant3.isBot = true

        conversation2.participants.push(participant3._id)

        participant4.isBot = false


        conversation2.participants.push(participant4._id)

        participant1.save(() => {
          participant2.save(() => {
            participant3.save(() => {
              participant4.save(() => {
                conversation1.save(() => {
                  conversation2.save(() => {
                    channel.save(() => {
                      connector.save(() => {
                        done()
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })

      after(done => {
        connector = null
        channel = null
        conversation1 = null
        conversation2 = null
        participant1 = null
        participant2 = null
        participant3 = null
        participant4 = null
        clearDB()
        done()
      })

      it('should be a 404 with a not valid connector_id', done => {
        chai.request('http://localhost:8080')
        .get(`/connectors/1/participants`)
        .send()
        .end((err, res) => {
          chai.should(err).exist
          chai.expect(res.status).to.equal(404)
          chai.expect(res.body.results).to.equal(null)
          chai.expect(res.body.message).to.equal('Connector not found')
          done()
        })
      })

      it('should be a 200', done => {
        chai.request('http://localhost:8080')
        .get(`/connectors/${connector._id}/participants`)
        .send()
        .end((err, res) => {
          chai.should(err).not.exist
          chai.expect(res.status).to.equal(200)
          chai.expect(res.body.results).to.be.an('array')
          chai.expect(res.body.results.length).to.equal(4)
          chai.expect(res.body.results[0]).to.be.an('object')
          chai.expect(res.body.results[0].id.toString()).to.equal(participant1._id.toString())
          chai.expect(res.body.results[0].isBot).to.equal(participant1.isBot)
          chai.expect(res.body.results[1]).to.be.an('object')
          chai.expect(res.body.results[1].id.toString()).to.equal(participant2._id.toString())
          chai.expect(res.body.results[1].isBot).to.equal(participant2.isBot)
          chai.expect(res.body.results[2]).to.be.an('object')
          chai.expect(res.body.results[2].id.toString()).to.equal(participant3._id.toString())
          chai.expect(res.body.results[2].isBot).to.equal(participant3.isBot)
          chai.expect(res.body.results[3]).to.be.an('object')
          chai.expect(res.body.results[3].id.toString()).to.equal(participant4._id.toString())
          chai.expect(res.body.results[3].isBot).to.equal(participant4.isBot)
          chai.expect(res.body.message).to.equal('Participants successfully rendered')
          done()
        })
      })
    })
  })

  describe('should index connector participants', () => {
    describe('with no participant', () => {
      before(done => {
        connector = new Connector()
        channel = new Channel()
        conversation1 = new Conversation()

        connector.url = 'http://fallback.fr'

        channel.connector = connector._id
        channel.slug = 'kik-1'
        channel.type = 'kik'
        channel.isActivated = true

        connector.channels.push(channel._id)

        conversation1.channel = channel._id
        conversation1.connector = connector._id
        conversation1.isActive = true
        conversation1.chatId = 'myChatId'

        connector.conversations.push(conversation1._id)

        conversation1.save(() => {
          channel.save(() => {
            connector.save(() => {
              done()
            })
          })
        })
      })

      after(done => {
        connector = null
        channel = null
        conversation1 = null
        clearDB()
        done()
      })

      it('should be a 404 with a not valid connector_id', done => {
        chai.request('http://localhost:8080')
        .get(`/connectors/1/participants/1`)
        .send()
        .end((err, res) => {
          chai.should(err).exist
          chai.expect(res.status).to.equal(404)
          chai.expect(res.body.results).to.equal(null)
          chai.expect(res.body.message).to.equal('Participant not found')
          done()
        })
      })

      it('should be a 404 with a not valid participant_id', done => {
        chai.request('http://localhost:8080')
        .get(`/connectors/${connector._id}/participants/1`)
        .send()
        .end((err, res) => {
          chai.should(err).exist
          chai.expect(res.status).to.equal(404)
          chai.expect(res.body.results).to.equal(null)
          chai.expect(res.body.message).to.equal('Participant not found')
          done()
        })
      })

      it('should be a 404 with a not valid participant_id', done => {
        chai.request('http://localhost:8080')
        .get(`/connectors/${connector._id}/participants/507f1f77bcf86cd799439011`)
        .send()
        .end((err, res) => {
          chai.should(err).exist
          chai.expect(res.status).to.equal(404)
          chai.expect(res.body.results).to.equal(null)
          chai.expect(res.body.message).to.equal('Participant not found')
          done()
        })
      })
    })

    describe('with many conversations and many participants', () => {
      before(done => {
        connector = new Connector()
        channel = new Channel()
        conversation1 = new Conversation()
        conversation2 = new Conversation()
        participant1 = new Participant()
        participant2 = new Participant()
        participant3 = new Participant()
        participant4 = new Participant()

        connector.url = 'http://fallback.fr'

        channel.connector = connector._id
        channel.slug = 'kik-1'
        channel.type = 'kik'
        channel.isActivated = true

        connector.channels.push(channel._id)

        conversation1.channel = channel._id
        conversation1.connector = connector._id
        conversation1.isActive = true
        conversation1.chatId = 'myChatId'

        connector.conversations.push(conversation1._id)

        conversation2.channel = channel._id
        conversation2.connector = connector._id
        conversation2.isActive = true
        conversation2.chatId = 'myChatId2'

        connector.conversations.push(conversation2._id)

        participant1.isBot = true

        conversation1.participants.push(participant1._id)

        participant2.isBot = false


        conversation1.participants.push(participant2._id)

        participant3.isBot = true

        conversation2.participants.push(participant3._id)

        participant4.isBot = false


        conversation2.participants.push(participant4._id)

        participant1.save(() => {
          participant2.save(() => {
            participant3.save(() => {
              participant4.save(() => {
                conversation1.save(() => {
                  conversation2.save(() => {
                    channel.save(() => {
                      connector.save(() => {
                        done()
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })

      after(done => {
        connector = null
        channel = null
        conversation1 = null
        conversation2 = null
        participant1 = null
        participant2 = null
        participant3 = null
        participant4 = null
        clearDB()
        done()
      })

      it('should be a 404 with a not found participant_id', done => {
        chai.request('http://localhost:8080')
        .get(`/connectors/${connector._id}/participants/507f191e810c19729de860ea`)
        .send()
        .end((err, res) => {
          chai.should(err).exist
          chai.expect(res.status).to.equal(404)
          chai.expect(res.body.results).to.equal(null)
          chai.expect(res.body.message).to.equal('Participant not found')
          done()
        })
      })

      it('should be a 200', done => {
        chai.request('http://localhost:8080')
        .get(`/connectors/${connector._id}/participants/${participant1._id}`)
        .send()
        .end((err, res) => {
          chai.should(err).not.exist
          chai.expect(res.status).to.equal(200)
          chai.expect(res.body.results).to.be.an('object')
          chai.expect(res.body.results.id.toString()).to.equal(participant1._id.toString())
          chai.expect(res.body.results.isBot).to.equal(participant1.isBot)
          chai.expect(res.body.message).to.equal('Participant successfully rendered')
          done()
        })
      })

      it('should be a 200', done => {
        chai.request('http://localhost:8080')
        .get(`/connectors/${connector._id}/participants/${participant2._id}`)
        .send()
        .end((err, res) => {
          chai.should(err).not.exist
          chai.expect(res.status).to.equal(200)
          chai.expect(res.body.results).to.be.an('object')
          chai.expect(res.body.results.id.toString()).to.equal(participant2._id.toString())
          chai.expect(res.body.results.isBot).to.equal(participant2.isBot)
          chai.expect(res.body.message).to.equal('Participant successfully rendered')
          done()
        })
      })

      it('should be a 200', done => {
        chai.request('http://localhost:8080')
        .get(`/connectors/${connector._id}/participants/${participant3._id}`)
        .send()
        .end((err, res) => {
          chai.should(err).not.exist
          chai.expect(res.status).to.equal(200)
          chai.expect(res.body.results).to.be.an('object')
          chai.expect(res.body.results.id.toString()).to.equal(participant3._id.toString())
          chai.expect(res.body.results.isBot).to.equal(participant3.isBot)
          chai.expect(res.body.message).to.equal('Participant successfully rendered')
          done()
        })
      })

      it('should be a 200', done => {
        chai.request('http://localhost:8080')
        .get(`/connectors/${connector._id}/participants/${participant4._id}`)
        .send()
        .end((err, res) => {
          chai.should(err).not.exist
          chai.expect(res.status).to.equal(200)
          chai.expect(res.body.results).to.be.an('object')
          chai.expect(res.body.results.id.toString()).to.equal(participant4._id.toString())
          chai.expect(res.body.results.isBot).to.equal(participant4.isBot)
          chai.expect(res.body.message).to.equal('Participant successfully rendered')
          done()
        })
      })
    })
  })
})
