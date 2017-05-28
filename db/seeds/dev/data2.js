const _ = require('lodash')

exports.seed = function (knex, Promise) {
  let morePromises = []
  for (let year = 1911; year <= 1920; year++) {
    let names = require(`../../../data/json/data${year}.json`)
    let p = knex('years').insert({ year }, 'id').then(function (ids) {
      const yearId = ids[0]
      let promises = names.data.map(item => {
        return knex('names')
          .insert(_.omit(item, 'year', 'count'), 'id')
          .then(ids => {
            const nameId = ids[0]
            return knex('junction').insert({
              name_id: nameId,
              year_id: yearId,
              count: item.count,
            })
          })
      })
      return Promise.all(promises)
    })
    morePromises.push(p)
  }
  return Promise.all(morePromises)
}
