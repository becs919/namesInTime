const express = require('express')
const fs = require('fs')
const app = express()
const bodyParser = require('body-parser')
const Promise = require('bluebird')

const environment = process.env.NODE_ENV || 'development'
const configuration = require('./knexfile')[environment]
const database = require('knex')(configuration)

app.set('port', process.env.PORT || 3000)
app.locals.title = 'NamesInTime'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static('public'))

app.get('/', (request, response) => {
  fs.readFile(`${__dirname}/index.html`, (err, file) => {
    if (err) {
      console.log(err)
    }
    response.send(file)
  })
})

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
        console.log(error)
        response.status(404).json(error)
      })
  } else if (name && !year && !gender) {
    database('names').where('name', name).select('id')
      .then(names => {
        const namesArr = names.map(name => {
          return database('junction').where('name_id', name.id).select('count').limit(10)
          .join('names', 'names.id', '=', 'junction.name_id').select('names.name', 'names.gender')
          .join('years', 'junction.year_id', '=', 'years.id').select('year')
        })
        return Promise.all(namesArr)
      })
      .then(obj => response.status(200).json(obj))
      .catch(error => {
        console.log(error)
        response.status(404).json(error)
      })
  } else if (name && year && !gender) {
    // let subquery = database('years').where('year', year).select('id', 'year');
    // console.log(subquery);
    // let subquery2 = database('names').where('name', name).select('id', 'name', 'gender');
    // console.log('subquery2',subquery2);
    // database('junction').where('year_id', 'in', subquery).andWhere('name_id', 'in', subquery2).select('count', 'name_id', 'year_id')
    //
    //   .join('names', 'names.id', '=', subquery2).select('names.name', 'names.gender')
    //   .join('years', 'junction.year_id', '=', subquery).select('year')
    //   .then(rows => {
    //     console.log(rows);
    //   }).catch((err) => console.log(err))

    let yearId
    database('years').where('year', year).select('id')
      .then((year) => {
        yearId = year[0].id
        return database('names').where('name', name).select('id')
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
        response.status(200).json(filtered)
      }).catch(error => {
        response.status(500).json(error)
      })
  } else if (name && year && gender) {
    let yearId
    database('years').where('year', year).select('id')
    .then((year) => {
      yearId = year[0].id
      return database('names').where('name', name).andWhere('gender', gender).select('id')
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
      response.status(200).json(filtered)
    }).catch(error => {
      response.status(500).json(error)
    })
  } else if (name && !year && gender) {
    database('names').where('name', name).andWhere('gender', gender).select('id')
      .then(genders => {
        const gendersArr = genders.map(gender => {
          return database('junction').where('name_id', gender.id).select('count').limit(10)
          .join('names', 'names.id', '=', 'junction.name_id').select('names.name', 'names.gender')
          .join('years', 'junction.year_id', '=', 'years.id').select('year')
        })
        return Promise.all(gendersArr)
      })
      .then(obj => response.status(200).json(obj))
      .catch(error => {
        console.log(error)
        response.status(404).json(error)
      })
  } else if (!name && year && gender) {
    let yearId
    database('years').where('year', year).select('id')
      .then((year) => {
        yearId = year[0].id
        return database('names').where('gender', gender).select('id').limit(25)
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
        response.status(200).json(filtered)
      }).catch(error => {
        response.status(500).json(error)
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
      .then(obj => response.status(200).json(obj))
      .catch(error => {
        // GETTING 200 NEED TO FIGURE OUT
        response.sendStatus(404)
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

app.post('/api/v1/names', (request, response) => {
  let nameId
  const {name, gender, count, year} = request.body
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
        return Promise.resolve([years.id])
      }
    })
    .then((ids) => {
      return trx('junction').insert({'year_id': ids[0], 'name_id': nameId, count})
    })
  })
  .then(() => {
    response.status(200).json('successful')
  })
  .catch(error => {
    response.status(404).json(error)
  })
})

if (!module.parent) {
  app.listen(app.get('port'), () => {
    console.log(`${app.locals.title} is running on ${app.get('port')}.`)
  })
}

module.exports = app
