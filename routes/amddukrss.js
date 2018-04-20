var express = require('express')
var router = express.Router()
var amazonDailyDealUKscraper = require('../libs/amazonDailyDealsUKScraper')
var rssify = require('../libs/rssify')

/* GET home page. */
router.get('/', function (req, res, next) {
  amazonDailyDealUKscraper()
    .then(function (response) {
      res.setHeader('Content-Type', 'application/xml')
      res.send(rssify(response))
    })
})

module.exports = router
