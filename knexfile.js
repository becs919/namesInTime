// Update with your config settings.

module.exports = {

  development: {
    client: 'pg',
    connection: 'postgres://localhost/names',
    migrations: {
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds/dev'
    },
    useNullAsDefault: true,
    pool: { min: 0, max: 10 }
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL + `?ssl=true`,
    migrations: {
      directory: './db/migrations'
    },
    useNullAsDefault: true
  },
  test: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgres://localhost/testnames',
    migrations: {
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds/test'
    },
    useNullAsDefault: true
  },
  staging: {
    client: 'pg',
    connection: process.env.DATABASE_URL + `?ssl=true`,
    migrations: {
      directory: './db/migrations'
    },
    useNullAsDefault: true
  }
}
