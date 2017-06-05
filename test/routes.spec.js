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

      it('should return 404 for a non existent route for gender', (done) => {
        chai.request(server)
        .get('/api/v1/names?gender=female')
        .end((error, response) => {
          error.response.should.have.status(404)
          error.response.text.should.equal('Error: Invalid Gender')
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

      it('should return 404 for a non existent route with incorrect gender', (done) => {
        chai.request(server)
        .get('/api/v1/names?gender=Female&year=1880&name=Erica')
        .end((error, response) => {
          error.response.should.have.status(404)
          error.response.text.should.equal('Error: No Matching Name, Year, or Gender')
          done()
        })
      })

      it('should return 404 for a non existent route with incorrect name', (done) => {
        chai.request(server)
        .get('/api/v1/names?gender=F&year=1880&name=Ericaaa')
        .end((error, response) => {
          error.response.should.have.status(404)
          error.response.text.should.equal('Error: No Matching Name, Year, or Gender')
          done()
        })
      })

      it('should return 404 for a non existent route with incorrect name, gender and year', (done) => {
        chai.request(server)
        .get('/api/v1/names?gender=F&year=1880&name=Ericaaa&year=756')
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

      it('should return 404 for a non existent route for incorrect gender', (done) => {
        chai.request(server)
        .get('/api/v1/names?gender=Female&name=Erica')
        .end((error, response) => {
          error.response.should.have.status(404)
          done()
        })
      })

      it('should return 404 for a non existent route with incorrect name', (done) => {
        chai.request(server)
        .get('/api/v1/names?gender=F&name=Ericssssa')
        .end((error, response) => {
          error.response.should.have.status(404)
          error.response.text.should.equal('Error: No Matching Name')
          done()
        })
      })

      it('should return 404 for a non existent route with incorrect name and gender', (done) => {
        chai.request(server)
        .get('/api/v1/names?gender=Female&name=Ericssssa')
        .end((error, response) => {
          error.response.should.have.status(404)
          error.response.text.should.equal('Error: No Matching Name')
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

      it('should return gender and year', (done) => {
        chai.request(server)
        .get('/api/v1/names?gender=M&year=1880')
        .end((error, response) => {
          response.should.have.status(200)
          response.body.should.be.a('array')
          response.body[0][0].should.have.property('gender')
          response.body[0][0].gender.should.equal('M')
          response.body[0][0].should.have.property('count')
          response.body[0][0].should.have.property('name')
          response.body[0][0].should.have.property('year')
          response.body[0][0].year.should.equal(1880)
          done()
        })
      })

      it('should return 404 for a non existent route for incorrect gender', (done) => {
        chai.request(server)
        .get('/api/v1/names?gender=Male&year=1880')
        .end((error, response) => {
          error.response.should.have.status(404)
          error.response.text.should.equal('Error: No Matching Name or Year')
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

      it('should return 404 for a non existent route with incorrect year and gender', (done) => {
        chai.request(server)
        .get('/api/v1/names?year=9385764&gender=Male')
        .end((error, response) => {
          error.response.should.have.status(404)
          done()
        })
      })
    })
  })

  describe('POST /api/v1/names', () => {
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

  describe('PATCH /api/v1/names/:id', () => {
    it.skip('should patch count for record', (done) => {
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
          let id = response.body
          chai.request(server)
          .patch(`/api/v1/names/${id}`)
          .set('Authorization', process.env.TOKEN)
          .send({
            count: 10,
            year: 1880
          })
          .end((err, res) => {
            res.status.should.equal(201)
            chai.request(server)
            .get('/api/v1/names?name=RobbieCool&gender=M&year=1880')
            .end((error, response) => {
              console.log(response)
              response.status.should.equal(200)
              response.body[0].count.should.equal(10)
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
