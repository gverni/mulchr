var express = require('express')
var router = express.Router()
var amazonDailyDealUKscraper = require('../libs/amazonUkKindleDailyDealsScraper')
var rssify = require('../libs/rssify')

/* GET home page. */
router.get('/', function (req, res, next) {
  amazonDailyDealUKscraper()
    .then(function (response) {
      res.setHeader('Content-Type', 'application/xml')
      res.send(rssify({title: 'Amazon UK Kindle Daily Deals',
        description: 'Amazon UK Kindle Daily Deals',
        url: 'https://sakscraper.herokuapp.com/amUKKiDaDeRSS'},
      response,
      function (item) {
        return '<p><img src="' + item.image + '"</p>' +
          '<p>Title: ' + item.title + '</p>' +
          '<p>Author: ' + item.author + '</p>' +
          '<p>Reviews: ' + item.rating + ' stars (' + item.reviewCount + ' reviews)</p>' +
          '<p>Deal price: ' + item.price + '</p>'
      }
      ))
    })
})

module.exports = router
