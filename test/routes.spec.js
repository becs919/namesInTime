/* eslint-env mocha */

process.env.NODE_ENV = 'test'
const chaiHttp = require('chai-http')
const server = require('../server')
const chai = require('chai')
const should = chai.should()
const expect = chai.expect
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

    describe('GET /api/v1/names/ QUERY PARAMS', () => {
      it('should return specific name', (done) => {
        chai.request(server)
        .get('/api/v1/names?name=Mary')
        .end((error, response) => {
          response.should.have.status(200)
          response.body.should.be.a('array')
          response.body.length.should.equal(2)
          response.body[0][0].should.have.property('name')
          response.body[0][0].name.should.equal('Mary')
          response.body[0][0].should.have.property('gender')
          response.body[0][0].should.have.property('count')
          done()
        })
      })

      it('should return 404 for a non existent route', (done) => {
        chai.request(server)
        .get('/api/v1/names?name=Maryy')
        .end((error, response) => {
          error.response.should.have.status(404)
          done()
        })
      })

      it('should return specific year', (done) => {
        chai.request(server)
        .get('/api/v1/names?year=1880')
        .end((error, response) => {
          response.should.have.status(200)
          response.body.should.be.a('array')
          response.body.length.should.equal(15)
          response.body[0].should.have.property('name')
          response.body[0].should.have.property('gender')
          response.body[0].should.have.property('count')
          response.body[0].should.have.property('year')
          response.body[0].year.should.equal(1880)
          done()
        })
      })

      it('should return 404 for a non existent route', (done) => {
        chai.request(server)
        .get('/api/v1/names?year=57693')
        .end((error, response) => {
          error.response.should.have.status(404)
          done()
        })
      })

      it('should return specific gender', (done) => {
        chai.request(server)
        .get('/api/v1/names?gender=M')
        .end((error, response) => {
          response.should.have.status(200)
          response.body.should.be.a('array')
          response.body.length.should.equal(25)
          response.body[0][0].should.have.property('name')
          response.body[0][0].should.have.property('gender')
          response.body[0][0].gender.should.equal('M')
          response.body[0][0].should.have.property('count')
          response.body[0][0].should.have.property('year')
          done()
        })
      })

      it.skip('should return 404 for a non existent route', (done) => {
        chai.request(server)
        .get('/api/v1/names?gender=female')
        .end((error, response) => {
          error.response.should.have.status(404)
          done()
        })
      })

      it('should return gender, name, and year', (done) => {
        chai.request(server)
        .get('/api/v1/names?gender=F&year=1880&name=Emma')
        .end((error, response) => {
          response.should.have.status(200)
          response.body.should.be.a('array')
          response.body.length.should.equal(1)
          response.body[0][0].should.have.property('name')
          response.body[0][0].name.should.equal('Emma')
          response.body[0][0].should.have.property('gender')
          response.body[0][0].gender.should.equal('F')
          response.body[0][0].should.have.property('count')
          response.body[0][0].should.have.property('year')
          response.body[0][0].year.should.equal(1880)
          done()
        })
      })

      it('should return 404 for a non existent route for incorrect year', (done) => {
        chai.request(server)
        .get('/api/v1/names?gender=F&year=180&name=Erica')
        .end((error, response) => {
          error.response.should.have.status(404)
          done()
        })
      })

      it.skip('should return 404 for a non existent route with incorrect gender', (done) => {
        chai.request(server)
        .get('/api/v1/names?gender=Female&year=1880&name=Erica')
        .end((error, response) => {
          error.response.should.have.status(404)
          done()
        })
      })

      it.skip('should return 404 for a non existent route with incorrect name', (done) => {
        chai.request(server)
        .get('/api/v1/names?gender=F&year=1880&name=Ericaaa')
        .end((error, response) => {
          error.response.should.have.status(404)
          done()
        })
      })

      it('should return gender and name', (done) => {
        chai.request(server)
        .get('/api/v1/names?gender=F&name=Emma')
        .end((error, response) => {
          response.should.have.status(200)
          response.body.should.be.a('array')
          response.body.length.should.equal(2)
          response.body[0][0].should.have.property('name')
          response.body[0][0].name.should.equal('Emma')
          response.body[0][0].should.have.property('gender')
          response.body[0][0].gender.should.equal('F')
          response.body[0][0].should.have.property('count')
          response.body[0][0].should.have.property('year')
          done()
        })
      })

      it.skip('should return 404 for a non existent route for incorrect gender', (done) => {
        chai.request(server)
        .get('/api/v1/names?gender=Female&name=Erica')
        .end((error, response) => {
          error.response.should.have.status(404)
          done()
        })
      })

      it.skip('should return 404 for a non existent route with incorrect name', (done) => {
        chai.request(server)
        .get('/api/v1/names?gender=F&name=Ericssssa')
        .end((error, response) => {
          error.response.should.have.status(404)
          done()
        })
      })

      it('should return name and year', (done) => {
        chai.request(server)
        .get('/api/v1/names?name=Emma&year=1880')
        .end((error, response) => {
          response.should.have.status(200)
          response.body.should.be.a('array')
          response.body.length.should.equal(1)
          response.body[0][0].should.have.property('name')
          response.body[0][0].name.should.equal('Emma')
          response.body[0][0].should.have.property('gender')
          response.body[0][0].gender.should.equal('F')
          response.body[0][0].should.have.property('count')
          response.body[0][0].should.have.property('year')
          response.body[0][0].year.should.equal(1880)
          done()
        })
      })

      it('should return 404 for a non existent route for incorrect name', (done) => {
        chai.request(server)
        .get('/api/v1/names?name=Ericaaaa&year=1880')
        .end((error, response) => {
          error.response.should.have.status(404)
          done()
        })
      })

      it('should return 404 for a non existent route for incorrect name and year', (done) => {
        chai.request(server)
        .get('/api/v1/names?name=Ericaaaa&year=18')
        .end((error, response) => {
          error.response.should.have.status(404)
          done()
        })
      })

      it('should return 404 for a non existent route with incorrect year', (done) => {
        chai.request(server)
        .get('/api/v1/names?year=9385764&name=Emma')
        .end((error, response) => {
          error.response.should.have.status(404)
          done()
        })
      })

      it.skip('should return gender and year', (done) => {
        chai.request(server)
        .get('/api/v1/names?gender=M&year=1880')
        .end((error, response) => {
          response.should.have.status(200)
          response.body.should.be.a('array')
          // COMING UP WITH DIFFERENT ARRAY LENGTHS EACH TIME RUN
          response.body.length.should.equal(5)
          response.body[0][0].should.have.property('gender')
          response.body[0][0].gender.should.equal('M')
          response.body[0][0].should.have.property('count')
          response.body[0][0].should.have.property('name')
          response.body[0][0].should.have.property('year')
          response.body[0][0].year.should.equal(1880)
          done()
        })
      })

      it.skip('should return 404 for a non existent route for incorrect gender', (done) => {
        chai.request(server)
        .get('/api/v1/names?gender=Male&year=1880')
        .end((error, response) => {
          error.response.should.have.status(404)
          done()
        })
      })

      it('should return 404 for a non existent route with incorrect year', (done) => {
        chai.request(server)
        .get('/api/v1/names?year=9385764&gender=M')
        .end((error, response) => {
          error.response.should.have.status(404)
          done()
        })
      })

    })
  })
})
