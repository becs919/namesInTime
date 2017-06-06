const express = require('express')
const fs = require('fs')
const app = express()
const bodyParser = require('body-parser')
const Promise = require('bluebird')
const jwt = require('jsonwebtoken')
const config = require('dotenv').config().parsed

const environment = process.env.NODE_ENV || 'development'
const configuration = require('./knexfile')[environment]
const database = require('knex')(configuration)

app.set('secretKey', process.env.CLIENT_SECRET || config.CLIENT_SECRET)
const token = jwt.sign('user', app.get('secretKey'))
app.set('port', process.env.PORT || 3000)
app.locals.title = 'NamesInTime'

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static('public'))

app.get('/', (request, response) => {
  fs.readFile(`${__dirname}/index.html`, (err, file) => {
    if (err) {
      console.log(err)
    }
    response.send(file)
  })
})

const checkAuth = (request, response, next) => {
  const token = request.body.token ||
                request.params.token ||
                request.headers['authorization']

  if (token) {
    jwt.verify(token, app.get('secretKey'), (error, decoded) => {
      if (error) {
        return response.status(403).send({
          success: false,
          message: 'Invalid authorization token.',
        })
      } else {
        request.decoded = decoded
        next()
      }
    })
  } else {
    return response.status(403).send({
      success: false,
      message: 'You must be authorized to hit this endpoint',
    })
  }
}

app.get('/api/v1/names', (request, response) => {
  const year = request.query.year
  const name = request.query.name
  const gender = request.query.gender
  if (!year && !name && !gender) {
    database('names').select().limit(10)
    .then(name => response.status(200).json(name))
    .catch((error) => {
      response.status(404).send('no names', error)
    })
  } else if (year && !name && !gender) {
    database('years').where('year', year).select('id')
      .then(row => {
        return database('junction').where('year_id', row[0].id).select('count')
          .join('names', 'names.id', '=', 'junction.name_id').select('names.name', 'names.gender')
          .join('years', 'junction.year_id', '=', 'years.id').select('year')
      })
      .then(obj => response.status(200).json(obj))
      .catch(error => {
        response.status(404).json(error)
      })
  } else if (name && !year && !gender) {
    database('names').whereRaw(`lower(name) = ?`, name.toLowerCase()).select('id')
      .then(names => {
        const namesArr = names.map(name => {
          return database('junction').where('name_id', name.id).select('count')
          .join('names', 'names.id', '=', 'junction.name_id').select('names.name', 'names.gender')
          .join('years', 'junction.year_id', '=', 'years.id').select('year')
        })
        return Promise.all(namesArr)
      })
      .then(obj => {
        if (!obj[0]) {
          response.status(404).send('Error: No Matching Name')
        } else {
          response.status(200).json(obj)
        }
      })
      .catch(error => {
        response.status(404).json(error)
      })
  } else if (name && year && !gender) {
    let yearId
    database('years').where('year', year).select('id')
      .then((year) => {
        yearId = year[0].id
        return database('names').whereRaw(`lower(name) = ?`, name.toLowerCase()).select('id')
      })
      .then((names) => {
        return Promise.map(names, (name) => {
          return database('junction').where('year_id', yearId).andWhere('name_id', name.id).select('count')
          .join('names', 'names.id', '=', 'junction.name_id').select('names.name', 'names.gender')
          .join('years', 'junction.year_id', '=', 'years.id').select('year')
        })
      })
      .then(rows => {
        let filtered = rows.filter(row => {
          return row.length > 0
        })
        if (!filtered.length) {
          response.status(404).send('Error: No Matching Name')
        } else {
          response.status(200).json(filtered)
        }
      }).catch(error => {
        response.status(404).json(error)
      })
  } else if (name && year && gender) {
    let yearId
    database('years').where('year', year).select('id')
    .then((year) => {
      yearId = year[0].id
      return database('names').whereRaw(`lower(name) = ?`, name.toLowerCase()).andWhere('gender', gender).select('id')
    })
    .then((names) => {
      return Promise.map(names, (name) => {
        return database('junction').where('year_id', yearId).andWhere('name_id', name.id).select('count')
        .join('names', 'names.id', '=', 'junction.name_id').select('names.name', 'names.gender')
        .join('years', 'junction.year_id', '=', 'years.id').select('year')
      })
    })
    .then(rows => {
      let filtered = rows.filter(row => {
        return row.length > 0
      })
      if (!filtered.length) {
        return response.status(404).send('Error: No Matching Name, Year, or Gender')
      }
      return response.status(200).json(filtered)
    }).catch(error => {
      response.status(404).json(error)
    })
  } else if (name && !year && gender) {
    database('names').whereRaw(`lower(name) = ?`, name.toLowerCase()).andWhere('gender', gender).select('id')
      .then(genders => {
        const gendersArr = genders.map(gender => {
          return database('junction').where('name_id', gender.id).select('count')
          .join('names', 'names.id', '=', 'junction.name_id').select('names.name', 'names.gender')
          .join('years', 'junction.year_id', '=', 'years.id').select('year')
        })
        return Promise.all(gendersArr)
      })
      .then(obj => {
        if (!obj[0]) {
          response.status(404).send('Error: No Matching Name')
        } else {
          response.status(200).json(obj)
        }
      })
      .catch(error => {
        console.log(error)
        response.status(404).json(error)
      })
  } else if (!name && year && gender) {
    let yearId
    database('years').where('year', year).select('id')
      .then((year) => {
        yearId = year[0].id
        return database('names').where('gender', gender).select('id').limit(300)
      })
      .then((genders) => {
        return Promise.map(genders, (gender) => {
          return database('junction').where('year_id', yearId).andWhere('name_id', gender.id).select('count')
          .join('names', 'names.id', '=', 'junction.name_id').select('names.name', 'names.gender')
          .join('years', 'junction.year_id', '=', 'years.id').select('year')
        })
      })
      .then(rows => {
        let filtered = rows.filter(row => {
          return row.length > 0
        })
        if (!filtered.length) {
          return response.status(404).send('Error: No Matching Name or Year')
        }
        return response.status(200).json(filtered)
      }).catch(error => {
        response.status(404).json(error)
      })
  } else if (!name && !year && gender) {
    database('names').where('gender', gender).select('id').limit(25)
      .then(genders => {
        const gendersArr = genders.map(gender => {
          return database('junction').where('name_id', gender.id).select('count')
          .join('names', 'names.id', '=', 'junction.name_id').select('names.name', 'names.gender')
          .join('years', 'junction.year_id', '=', 'years.id').select('year')
        })
        return Promise.all(gendersArr)
      })
      .then(obj => {
        if (!obj[0]) {
          return response.status(404).send('Error: Invalid Gender')
        }
        return response.status(200).json(obj)
      })
      .catch(error => {
        response.status(404).json(error)
      })
  }
})

app.get('/api/v1/names/:id', (request, response) => {
  database('names').where('id', request.params.id).select()
    .then(name => response.status(200).json(name))
    .catch((error) => {
      response.sendStatus(404)
    })
})

app.get('/api/v1/years/', (request, response) => {
  database('years').select().limit(10)
    .then(name => response.status(200).json(name))
    .catch((error) => {
      response.status(404).send('no names', error)
    })
})

app.get('/api/v1/years/:id', (request, response) => {
  database('years').where('id', request.params.id).select()
    .then(year => response.status(200).json(year))
    .catch((error) => {
      response.sendStatus(404)
    })
})

app.post('/api/v1/names', checkAuth, (request, response) => {
  let nameId
  const {name, gender, count, year} = request.body
  if (!name || !gender || !count || !year) {
    response.sendStatus(404)
  } else {
    database.transaction(trx => {
      return trx('names').insert({name, gender}, 'id')
      .then((ids) => {
        nameId = ids[0]
        return trx('years').where('year', year).select('id')
      })
      .then((years) => {
        if (!years.length) {
          return trx('years').insert({year}, 'id')
        } else {
          return Promise.resolve([years[0].id])
        }
      })
      .then((ids) => {
        return trx('junction').insert({'year_id': ids[0], 'name_id': nameId, count})
      })
    })
    .then(() => {
      response.status(201).json(nameId)
    })
    .catch(error => {
      response.status(404).json(error)
    })
  }
})

app.patch('/api/v1/names/:id', checkAuth, (request, response) => {
  const count = request.body.count
  const year = request.body.year

  database('years').where('year', year).select('id')
  .then(yearId => {
    return database('junction').where('name_id', request.params.id).andWhere('year_id', yearId[0].id).update({ count })
  })
  .then(update => {
    response.status(201).send('updated')
  })
  .catch(() => {
    response.status(422).send('not updated')
  })
})

app.delete('/api/v1/names/:id', checkAuth, (request, response) => {
  const year = request.body.year

  database('years').where('year', year).select('id')
  .then(yearId => {
    return database('junction').where('name_id', request.params.id).andWhere('year_id', yearId[0].id).delete()
  })
  .then(() => {
    response.status(204).send('deleted')
  })
  .catch(() => {
    response.status(404).send('nothing deleted')
  })
})

if (!module.parent) {
  app.listen(app.get('port'), () => {
    console.log(`${app.locals.title} is running on ${app.get('port')}.`)
  })
}

module.exports = app
