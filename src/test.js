import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import _ from 'lodash'

/* Test Framework */
import Mocha from 'mocha'

import istanbul from 'istanbul'

import configs from '../config'
import { Logger } from './utils'

import path from 'path'
import recursive from 'recursive-readdir'

import _models from './models'
import _controllers from './controllers'
import _services from './services'

const app = express()

global.models = _models
global.controllers = _controllers
global.services = {}

_.forOwn(_services, (service, serviceName) => {
  services[serviceName.toLowerCase()] = service
})

const createRouter = require('./routes').createRouter

// Load the configuration
global.config = configs

// Enable Cross Origin Resource Sharing
app.use(cors())

// Enable auto parsing of json content
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Use native promise API with mongoose
mongoose.Promise = global.Promise

// Mongoose connection
/* eslint-disable no-console */
/* eslint-disable max-nested-callbacks */
mongoose.connect(`mongodb://${config.db.host}:${config.db.port}/${config.db.dbName}`)
const db = mongoose.connection
db.on('error', err => {
  Logger.error('FAILED TO CONNECT', err)
  process.exit(1)
})

// Launch the application
db.once('open', () => {
  createRouter(app)
  global.app = app
  const port = config.server.port
  app.listen(port, () => {
    app.emit('ready')
    Logger.success(`Test app listening on port ${port} !`)
    Logger.info('[TEST] Launching test runner...')

    const mocha = new Mocha({
      reporter: 'dot',
      timeout: '2000',
    })
    const collector = new istanbul.Collector()
    const reporter = new istanbul.Reporter()
    const testsDirectory = './test'

    recursive(testsDirectory, (err, files) => {
      if (err) {
        process.exit(2)
      }
      // Files is an array of filename
      Logger.info('[TEST] Listing test files...')
      files.filter(file => {
        return file.substr(-9) === '.tests.js'
      }).forEach(file => {
        mocha.addFile(
          path.join('./', file)
        )
      })

      process.env.ROUTETEST = `http://localhost:${config.server.port}`

      mocha.run(errCount => {
        mongoose.connection.db.dropDatabase()

        collector.add(global.__coverage__)
        reporter.addAll(['text-summary', 'html'])
        reporter.write(collector, true, () => {
          Logger.info('\nCoverage report saved to coverage/index.html')
        })

        if (errCount > 0) {
          Logger.info(`Total error${(errCount > 1 ? 's' : '')}: ${errCount}`)
          process.exit(1)
        }
        process.exit(0)
      })
    })
  })
})
/* eslint-enable max-nested-callbacks */
/* eslint-enable no-console */
/* eslint-enable max-nested-callbacks*/
