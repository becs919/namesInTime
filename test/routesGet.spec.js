/* eslint-env mocha */

process.env.NODE_ENV = 'test'
const chaiHttp = require('chai-http')
const server = require('../server')
const chai = require('chai')
const should = chai.should()
const configuration = require('../knexfile')['test']
const database = require('knex')(configuration)

chai.use(chaiHttp)

describe('GET /api/v1/years', () => {
  before((done) => {
    database.migrate.latest()
    .then(() => {
      return database.seed.run()
    })
    .then(() => {
      done()
    })
  })

  beforeEach((done) => {
    database.seed.run()
    .then(() => {
      done()
    })
  })

  describe('GET /api/v1/years', () => {
    it('should return all of the years', (done) => {
      chai.request(server)
      .get('/api/v1/years')
      .end((error, response) => {
        response.should.have.status(200)
        response.body.should.be.a('array')
        response.body.length.should.equal(3)
        response.body[0].should.have.property('year')
        response.body[0].should.have.property('id')
        done()
      })
    })

    it('should return 404 for a non existent route', (done) => {
      chai.request(server)
      .get('/api/v1/yers')
      .end((error, response) => {
        error.response.should.have.status(404)
        done()
      })
    })
  })

  describe('GET /api/v1/years/:id', () => {
    it('should return specific year', (done) => {
      let id
      chai.request(server)
      .get('/api/v1/years')
      .end((error, response) => {
        response.body[0].should.have.property('year')
        id = response.body[0].id
        chai.request(server)
        .get(`/api/v1/years/${id}`)
        .end((error, response) => {
          response.should.have.status(200)
          response.body.should.be.a('array')
          response.body.length.should.equal(1)
          response.body[0].should.have.property('year')
          response.body[0].should.have.property('id')
          done()
        })
      })
    })

    it('should return 404 for a non existent route', (done) => {
      chai.request(server)
      .get('/api/v1/years/49596930024556')
      .end((error, response) => {
        response.should.have.status(404)
        done()
      })
    })
  })

  describe('GET /api/v1/names', () => {
    it('should return all of the names', (done) => {
      chai.request(server)
      .get('/api/v1/names')
      .end((error, response) => {
        response.should.have.status(200)
        response.body.should.be.a('array')
        response.body.length.should.equal(10)
        response.body[0].should.have.property('name')
        response.body[0].should.have.property('id')
        response.body[0].should.have.property('gender')
        done()
      })
    })

    it('should return 404 for a non existent route', (done) => {
      chai.request(server)
      .get('/api/v1/name')
      .end((error, response) => {
        error.response.should.have.status(404)
        done()
      })
    })
  })

  describe('GET /api/v1/names/:id', () => {
    it('should return specific name', (done) => {
      let id
      chai.request(server)
      .get('/api/v1/names')
      .end((error, response) => {
        id = response.body[0].id
        chai.request(server)
        .get(`/api/v1/names/${id}`)
        .end((error, response) => {
          response.should.have.status(200)
          response.body.should.be.a('array')
          response.body.length.should.equal(1)
          response.body[0].should.have.property('name')
          response.body[0].should.have.property('gender')
          done()
        })
      })
    })

    it('should return 404 for a non existent route', (done) => {
      chai.request(server)
      .get('/api/v1/names/19867684939')
      .end((error, response) => {
        response.should.have.status(404)
        done()
      })
    })
  })
})
