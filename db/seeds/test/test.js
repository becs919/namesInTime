const _ = require('lodash')
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
      let morePromises = []
      for (let year = 1880; year <= 1882; year++) {
        let namesPath = `../../../data/test/data${year}.json`
        let json = fs.readFileSync(path.resolve(__dirname, namesPath), 'utf8')
        let names = JSON.parse(json)
        let p = knex('years').insert({ year }, 'id')
          .then(function (ids) {
            const yearId = ids[0]
            return Promise.map(names.data, (item) => {
              return knex('names').insert(_.omit(item, 'year', 'count'), 'id')
              .then((ids) => {
                const nameId = ids[0]
                return knex('junction').insert({ name_id: nameId, year_id: yearId, count: item.count })
              })
            }, {concurrency: 3})
          })
        morePromises.push(p)
      }
      return Promise.all(morePromises)
    })
}
