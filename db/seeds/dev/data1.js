const _ = require('lodash')

exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex('junction').del()
    .then(function () {
      return knex('years').del()
    })
    .then(function () {
      return knex('names').del()
    })
    .then(function () {
      let morePromises = []
      for (let year = 1880; year <= 1910; year++) {
        let names = require(`../../../data/json/data${year}.json`)
        let p = knex('years').insert({ year }, 'id')
          .then(function (ids) {
            const yearId = ids[0]
            let promises = names.data.map(item => {
              return knex('names').insert(_.omit(item, 'year', 'count'), 'id')
              .then((ids) => {
                const nameId = ids[0]
                return knex('junction').insert({ name_id: nameId, year_id: yearId, count: item.count })
              })
            })
            return Promise.all(promises)
          })
        morePromises.push(p)
      }
      return Promise.all(morePromises)
    })
}
