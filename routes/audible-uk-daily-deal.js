var express = require('express')
var router = express.Router()
var rssify = require('../libs/rssify')
const scraper = require('../libs/scraper')
const debug = require('debug')('service:au-uk-daily-deal')

var serviceName = 'au-uk-daily-deal'

var rssHeader = {title: 'Audible UK Daily Deal',
  description: 'Audible UK Daily Deal',
  url: 'https:/mulchr.herokuapp.com/' + serviceName}

function formatRssItem (item) {
  return '<p><img src="' + item.image + '"</p>' +
    '<p><b>Title</b>: ' + item.title + '</p>' +
    '<p><b>Author</b>: ' + item.author + '</p>' +
    (item.rating ? '<p><b>Reviews</b>: ' + item.rating + '  ' + item.reviewCount + '</p>' : '') +
    '<p><b>Deal price</b>: ' + item.price + ' (regular price: ' + item.regularPrice + ')</p>'
}

function getText (elem) { return elem.text().trim() }

function selectCenterSlot ($) {
  return $('#center-1')
}

var selectors = {
  title: { selector: '.bc-heading', fnExtractValue: getText },
  image: { selector: 'img.bc-pub-block.bc-image-inset-border', fnExtractValue: function (elem) { return elem.prop('src') } },
  author: { selector: '.bc-list-item.authorLabel a', fnExtractValue: getText },
  regularPrice: {selector: '#adbl-buy-box-price .bc-text-strike', fnExtractValue: getText},
  price: { selector: '#adbl-buy-box-price .bc-color-price', fnExtractValue: getText },
  rating: { selector: '.ratingsLabel span:nth-of-type(2)', fnExtractValue: getText },
  reviewCount: { selector: '.ratingsLabel a', fnExtractValue: getText },
  url: {selector: '.bc-heading', fnExtractValue: function () { return 'https://www.audible.co.uk/DailyDeal' }}
}

/* GET home page. */
router.get('/', function (req, res, next) {
  scraper('https://www.audible.co.uk/DailyDeal', selectCenterSlot, selectors)
    .then(function (response) {
      // Post-processing response (basic)
      response.forEach((result) => {
        // Assigning an id before generating the rss
        result.id = result.title
      })
      res.setHeader('Content-Type', 'application/xml')
      if (req.app.locals.cachedb.hasOwnProperty(serviceName) &&
      req.app.locals.cachedb[serviceName][0].id === response[0].id) {
        debug('Using cache')
        response = req.app.locals.cachedb[serviceName]
      } else {
        debug('Updating cache')
        req.app.locals.cachedb[serviceName] = response
        req.app.locals.updateCache()
      }
      res.send(rssify(rssHeader, response, formatRssItem))
    })
    .catch((error) => {
      debug(serviceName + ': ' + error)
      // Send cache (if exists)
      res.send(rssify(rssHeader,
        req.app.locals.cachedb.hasOwnProperty(serviceName)
          ? req.app.locals.cachedb[serviceName]
          : [],
        formatRssItem))
    })
})

module.exports = router
