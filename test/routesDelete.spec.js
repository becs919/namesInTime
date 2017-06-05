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

describe('DELETE /api/v1/names/:id', () => {
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

  it('should delete name and junction record', (done) => {
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
        .delete(`/api/v1/names/${id}`)
        .set('Authorization', process.env.TOKEN)
        .send({
          year: 1880
        })
        .end((err, res) => {
          res.status.should.equal(204)
          chai.request(server)
          .get(`/api/v1/names?name=RobbieCool&gender=M&year=1880`)
          .end((error, response) => {
            response.status.should.equal(404)
            done()
          })
        })
      })
  })

  it('should not delete a record with missing data', (done) => {
    chai.request(server)
    .delete('/api/v1/names/94586')
    .set('Authorization', process.env.TOKEN)
    .send({})
    .end((error, response) => {
      response.should.have.status(404)
      done()
    })
  })

  it('should not let you delete if not authorized', (done) => {
    chai.request(server)
    .delete('/api/v1/names/94586')
    .send({
      gender: 'M',
      year: 1880
    })
    .end((error, response) => {
      response.should.have.status(403)
      done()
    })
  })
})
