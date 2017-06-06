/* eslint-env mocha */

process.env.NODE_ENV = 'test'
const chaiHttp = require('chai-http')
const server = require('../server')
const chai = require('chai')
const should = chai.should()
const configuration = require('../knexfile')['test']
const database = require('knex')(configuration)

chai.use(chaiHttp)

describe('POST /api/v1/names', () => {
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

  describe('Post Routes happy path', () => {
    it('should post a new name', (done) => {
      chai.request(server)
      .post('/api/v1/names')
      .send(
        {
          name: 'RobbieCool',
          gender: 'M',
          count: 1,
          year: 1880,
        })
        .set('Authorization', process.env.TOKEN)
        .end((error, response) => {
          response.should.have.status(201)
          chai.request(server)
          .get('/api/v1/names?name=RobbieCool')
          .end((err, res) => {
            res.status.should.equal(200)
            res.body[0][0].should.have.property('count')
            res.body[0][0].should.have.property('name')
            res.body[0][0].should.have.property('year')
            res.body[0][0].should.have.property('gender')
            res.body[0][0].count.should.equal(1)
            res.body[0][0].name.should.equal('RobbieCool')
            res.body[0][0].gender.should.equal('M')
            res.body[0][0].year.should.equal(1880)
            done()
          })
        })
    })
  })

  describe('Post Routes sad paths', () => {
    it('should not post a new name if missing year', (done) => {
      chai.request(server)
      .post('/api/v1/names')
      .send(
        {
          name: 'RobbieCool',
          gender: 'M',
          count: 1,
        })
        .set('Authorization', process.env.TOKEN)
        .end((error, response) => {
          response.should.have.status(404)
          done()
        })
    })

    it('should not post a new name if missing count', (done) => {
      chai.request(server)
      .post('/api/v1/names')
      .send(
        {
          name: 'RobbieCool',
          gender: 'M',
          year: 1880,
        })
        .set('Authorization', process.env.TOKEN)
        .end((error, response) => {
          response.should.have.status(404)
          done()
        })
    })

    it('should not post a new name if missing gender', (done) => {
      chai.request(server)
      .post('/api/v1/names')
      .send(
        {
          name: 'RobbieCool',
          count: 1,
          year: 1880,
        })
        .set('Authorization', process.env.TOKEN)
        .end((error, response) => {
          response.should.have.status(404)
          done()
        })
    })

    it('should not post a new name if missing name', (done) => {
      chai.request(server)
      .post('/api/v1/names')
      .send(
        {
          gender: 'M',
          count: 1,
          year: 1880,
        })
        .set('Authorization', process.env.TOKEN)
        .end((error, response) => {
          response.should.have.status(404)
          done()
        })
    })

    it('should not post a new name not depending on data type', (done) => {
      chai.request(server)
      .post('/api/v1/names')
      .send(
        {
          gender: 'M',
          count: '1',
          year: '1880',
        })
        .set('Authorization', process.env.TOKEN)
        .end((error, response) => {
          response.should.have.status(404)
          done()
        })
    })

    it('should return 404 for a non existent route', (done) => {
      chai.request(server)
      .post('/api/v1/naem')
      .set('Authorization', process.env.TOKEN)
      .end((error, response) => {
        error.response.should.have.status(404)
        done()
      })
    })

    it('should return 404 if nothing send', (done) => {
      chai.request(server)
      .post('/api/v1/name')
      .send({})
      .end((error, response) => {
        error.response.should.have.status(404)
        done()
      })
    })

    it('should not create if unauthorized', (done) => {
      chai.request(server)
      .post('/api/v1/names')
      .send({})
      .end((err, response) => {
        response.should.have.status(403)
        done()
      })
    })
  })
})
