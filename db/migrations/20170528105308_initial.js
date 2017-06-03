exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('names', function (table) {
      table.increments('id').primary()
      table.string('name')
      table.enu('gender', ['M', 'F'])
      table.timestamps(true, true)
    }),
    knex.schema.createTable('years', function (table) {
      table.increments('id').primary()
      table.integer('year')
      table.timestamps(true, true)
    }),
    knex.schema.createTable('junction', function (table) {
      table.integer('name_id').unsigned()
      table.foreign('name_id').references('names.id')
      table.integer('year_id').unsigned()
      table.foreign('year_id').references('years.id')
      table.integer('count').unsigned()
      table.timestamps(true, true)
    }),
  ])
}

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('junction'),
    knex.schema.dropTable('years'),
    knex.schema.dropTable('names'),
  ])
}
