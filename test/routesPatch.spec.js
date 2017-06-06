/* eslint-env mocha */

process.env.NODE_ENV = 'test'
const chaiHttp = require('chai-http')
const server = require('../server')
const chai = require('chai')
const should = chai.should()
const configuration = require('../knexfile')['test']
const database = require('knex')(configuration)

chai.use(chaiHttp)

describe('PATCH /api/v1/names/:id', () => {
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

  describe('Patch /api/v1/names/:id', () => {
    it('should patch count for record', (done) => {
      chai.request(server)
      .post('/api/v1/names')
      .set('Authorization', process.env.TOKEN)
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
          let id = response.body
          chai.request(server)
          .patch(`/api/v1/names/${id}`)
          .set('Authorization', process.env.TOKEN)
          .send({
            count: 10,
            year: 1880,
          })
          .end((err, res) => {
            res.status.should.equal(201)
            chai.request(server)
            .get('/api/v1/names?name=RobbieCool&gender=M&year=1880')
            .end((error, response) => {
              response.status.should.equal(200)
              response.body[0][0].should.have.property('count')
              response.body[0][0].count.should.equal(10)
              done()
            })
          })
        })
    })

    it('should not patch a record with missing data', (done) => {
      chai.request(server)
      .patch('/api/v1/names/94586')
      .set('Authorization', process.env.TOKEN)
      .send({})
      .end((error, response) => {
        response.should.have.status(422)
        done()
      })
    })

    it('should not let you patch if not authorized', (done) => {
      chai.request(server)
      .patch('/api/v1/names/94586')
      .send({
        count: 6,
        year: 1880,
      })
      .end((error, response) => {
        response.should.have.status(403)
        done()
      })
    })
  })
})
