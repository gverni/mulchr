var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var jsonfile = require('jsonfile')

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
var amazonUkKindleDailyDeal = require('./routes/amdduk')
var amazonUKKindleDailyDealRSS = require('./routes/amazonUKKindleDailyDealRSS')

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

try {
  app.locals.cachedb = jsonfile.readFileSync('cachedb.json')
} catch (error) {
  console.log('Error opening cachedb: ' + error)
  jsonfile.writeFileSync('cachedb.json', {})
  app.locals.cachedb = {}
}
app.locals.updateCache = function () { jsonfile.writeFileSync('cachedb.json', app.locals.cachedb) }

// app.use('/', indexRouter)
// app.use('/users', usersRouter)
app.use('/amdduk', amazonUkKindleDailyDeal)
app.use('/amUKKiDaDeRSS', amazonUKKindleDailyDealRSS)

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
