const fs = require('fs')
const path = require('path')
const Promise = require('bluebird') // eslint-disable-line no-unused-vars

exports.seed = function (knex, Promise) {
  return knex('junction').del()
    .then(function () {
      return knex('years').del()
    })
    .then(function () {
      return knex('names').del()
    })
    .then(function () {
      let yearsArray = []

      for (let year = 2000; year <= 2016; year++) {
        yearsArray.push(year)
      }

      let dataPath = `../../../data/data.json`
      let json = fs.readFileSync(path.resolve(__dirname, dataPath), 'utf8')
      let names = JSON.parse(json)

      return Promise.map(yearsArray, year => {
        return knex('years').insert({ year: year, id: year })
      })
      .then(() => {
        return Promise.map(Object.keys(names['F']), (name) => {
          return knex.transaction(trx => {
            return trx.insert({ name, gender: 'F' }, 'id').into('names')
              .then(ids => {
                return Promise.map(names['F'][name], entry => {
                  let year = Object.keys(entry)[0]
                  let count = entry[year]
                  return trx.insert({ name_id: ids[0], year_id: year, count }).into('junction')
                })
              })
          })
        })
      })
      .then(() => {
        return Promise.map(Object.keys(names['M']), (name) => {
          return knex.transaction(trx => {
            return trx.insert({ name, gender: 'M' }, 'id').into('names')
              .then(ids => {
                return Promise.map(names['M'][name], entry => {
                  let year = Object.keys(entry)[0]
                  let count = entry[year]
                  return trx.insert({ name_id: ids[0], year_id: year, count }).into('junction')
                })
              })
          })
        })
      })
    })
}
