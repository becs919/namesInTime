process.env.NODE_ENV = 'test'
const chaiHttp = require('chai-http')
const server = require('../server')
const chai = require('chai')

const should = chai.should()

const configuration = require('../knexfile')['test']
const database = require('knex')(configuration)

chai.use(chaiHttp)

describe('Everything', () => {
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

  describe('API Route', () => {
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
          response.should.have.status(404)
          done()
        })
      })
    })

    describe('GET /api/v1/years/:id', () => {
      // need to get year id! change every seeding
      it.skip('should return specific year', (done) => {
        chai.request(server)
        // see below, fix those ???
        .get('/api/v1/years/??????')
        .end((error, response) => {
          response.should.have.status(200)
          response.body.should.be.a('array')
          response.body.length.should.equal(1)
          response.body[0].should.have.property('year')
          response.body[0].should.have.property('id')
          done()
        })
      })

      it('should return 404 for a non existent route', (done) => {
        chai.request(server)
        .get('/api/v1/yers/607')
        .end((error, response) => {
          response.should.have.status(404)
          done()
        })
      })
    })


  })
})
