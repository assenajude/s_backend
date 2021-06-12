require('dotenv').config()

require('dotenv').config()
module.exports = {
  development: {
    host: process.env.DB_HOST,
    username:process.env.DB_USERNAME,
    password:process.env.DB_PASS,
    database: process.env.DB_NAME,
    dialect: process.env.DB_DIALECT,
    dialectOptions: {
      decimalNumbers: true
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    dialectOptions: {
      bigNumberStrings: true,
      ssl: {
        "rejectUnauthorized": false
      }
    }
  }
}