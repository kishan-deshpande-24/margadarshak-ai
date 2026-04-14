const postgres = require('postgres')

const connectionString = process.env.DATABASE_URL
const sql = postgres(connectionString, {
  ssl: {
    rejectUnauthorized: false
  }
})

module.exports = sql
