var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var jsonfile = require('jsonfile')
var fs = require('fs')
const debug = require('debug')('app')
const { Client } = require('pg')
var bodyParser = require("body-parser")

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
// var amazonUkKindleDailyDeal = require('./routes/amdduk')
var fetcher = require('./routes/fetcher')
var amazonUkKindleDailyDeal = require('./routes/amazon-uk-kindle-daily-deal')
var amazonItKindleOffertaLampo = require('./routes/amazon-it-kindle-offerta-lampo')
var audibleUkDailyDeal = require('./routes/audible-uk-daily-deal')
var slack = require('./routes/slack')

var app = express()

// Applying body-parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

if (process.env.NODE_ENV === 'test') {
  if (fs.existsSync('./cachedb.json')) {
    fs.unlinkSync('./cachedb.json')
  }
} else {
  app.use(logger('dev'))
}
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

if (process.env.DATABASE_URL) {
  // using postrgres database (heroku)
  app.locals.updateCache = function () {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: true
    })
    debug('PG: update cache')
    client.connect()
    debug('PG: Emptying table')
    client.query('DELETE FROM saks')
      .then(() => {
        let sql = 'INSERT INTO saks (cachedb) VALUES (\'' + JSON.stringify(app.locals.cachedb).replace(/'/g, "''") + '\')'
        debug(sql)
        return client.query(sql)
      })
      .then(() => { client.end() })
      .catch((error) => {
        debug('PG: Error updating cache: ' + error)
        client.end()
      })
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true
  })

  client.connect()
  client.query('SELECT * FROM saks;')
    .then((res) => {
      debug('PG: returned rows from saks')
      if (res.rows.length === 0) {
        // Table empty
        debug('PG: Empty table')
        app.locals.cachedb = {}
      } else {
        for (let row of res.rows) {
          debug(JSON.stringify(row))
          app.locals.cachedb = row.cachedb
        }
      }
      client.end()
    })
    .catch((error) => {
      debug('PG: error reading DB ' + error)
      if (error.toString() === 'error: relation "saks" does not exist') {
        client.query('CREATE TABLE saks (cachedb json);')
          .then(() => {
            debug('PG: created table saks')
            return client.query('INSERT INTO saks (cachedb) VALUES (\'{}\');')
          })
          .then(() => {
            debug('PG: added empty row for cache')
            app.locals.cachedb = {}
            client.end()
          })
          .catch((error) => {
            debug('PG: Error in creating TABLE: ' + error)
            client.end()
          })
      }
    })
} else {
  // local json file
  app.locals.updateCache = function () {
    debug('Saving cache')
    try {
      jsonfile.writeFileSync('cachedb.json', app.locals.cachedb)
    } catch (error) {
      debug('Error writing file ' + error)
    }
  }
  try {
    app.locals.cachedb = jsonfile.readFileSync('cachedb.json')
  } catch (error) {
    debug('Error opening cachedb: ' + error)
    app.locals.cachedb = {}
    app.locals.updateCache()
  }
}

// app.use('/', indexRouter)
// app.use('/users', usersRouter)
// app.use('/amdduk-dontuse', amazonUkKindleDailyDeal)
app.use('/fetcher', fetcher)
app.use('/am-uk-kindle-daily-deal', amazonUkKindleDailyDeal)
app.use('/am-it-kindle-offerta-lampo', amazonItKindleOffertaLampo)
app.use('/au-uk-daily-deal', audibleUkDailyDeal)
app.use('/slack', slack)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
