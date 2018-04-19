var express = require('express')
var router = express.Router()
var amazonDailyDealUKscraper = require('../libs/amazonDailyDealsUKScraper')
var feedify = require('../libs/feedify')

/* GET home page. */
router.get('/', function (req, res, next) {
  amazonDailyDealUKscraper()
    .then(function (response) {
      res.send(feedify(response))
    })
})

module.exports = router
