var express = require('express')
var router = express.Router()
var amazonDailyDealUKscraper = require('../libs/amazonUkKindleDailyDealsScraper')
var feedify = require('../libs/feedify')

/* GET home page. */
router.get('/', function (req, res, next) {
  amazonDailyDealUKscraper()
    .then(function (response) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.send(JSON.stringify(feedify(response)))
    })
})

module.exports = router
