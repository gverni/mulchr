var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var jsonfile = require('jsonfile')
const { Client } = require('pg')

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
// var amazonUkKindleDailyDeal = require('./routes/amdduk')
var fetcher = require('./routes/fetcher')
var amazonUkKindleDailyDeal = require('./routes/amazon-uk-kindle-daily-deal')
var amazonItKindleOffertaLampo = require('./routes/amazon-it-kindle-offerta-lampo')

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
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
    console.log('PG: update cache')
    client.connect()
    console.log('PG: Emptying table')
    client.query('DELETE FROM saks')
      .then(() => {
        let sql = 'INSERT INTO saks (cachedb) VALUES (\'' + JSON.stringify(app.locals.cachedb).replace(/'/g, "''") + '\')'
        console.log(sql)
        return client.query(sql)
      })
      .then(() => { client.end() })
      .catch((error) => {
        console.log('PG: Error updating cache: ' + error)
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
      console.log('PG: returned rows from saks')
      if (res.rows.length === 0) {
        // Table empty
        console.log('PG: Empty table')
        app.locals.cachedb = {}
      } else {
        for (let row of res.rows) {
          console.log(JSON.stringify(row))
          app.locals.cachedb = row.cachedb
        }
      }
      client.end()
    })
    .catch((error) => {
      console.log('PG: error reading DB ' + error)
      if (error.toString() === 'error: relation "saks" does not exist') {
        client.query('CREATE TABLE saks (cachedb json);')
          .then(() => {
            console.log('PG: created table saks')
            return client.query('INSERT INTO saks (cachedb) VALUES (\'{}\');')
          })
          .then(() => {
            console.log('PG: added empty row for cache')
            app.locals.cachedb = {}
            client.end()
          })
          .catch((error) => {
            console.log('PG: Error in creating TABLE: ' + error)
            client.end()
          })
      }
    })
} else {
  // local json file
  app.locals.updateCache = function () {
    console.log('Saving cache')
    try {
      jsonfile.writeFileSync('cachedb.json', app.locals.cachedb)
    } catch (error) {
      console.log('Error writing file ' + error)
    }
  }
  try {
    app.locals.cachedb = jsonfile.readFileSync('cachedb.json')
  } catch (error) {
    console.log('Error opening cachedb: ' + error)
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
