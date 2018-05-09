var express = require('express')
var router = express.Router()
var rssify = require('../libs/rssify')
const scraper = require('../libs/scraper')
const debug = require('debug')('service:am-uk-kindle-daily-deal')

var serviceName = 'am-uk-kindle-daily-deal'

var rssHeader = {title: 'Amazon UK Kindle Daily Deals',
  description: 'Amazon UK Kindle Daily Deals',
  url: 'https:/mulchr.herokuapp.com/' + serviceName}

function formatRssItem (item) {
  return '<p><img src="' + item.image + '"</p>' +
    '<p><b>Title</b>: ' + item.title + '</p>' +
    '<p><b>Author</b>: ' + item.author + '</p>' +
    (item.rating ? '<p><b>Reviews</b>: ' + item.rating + ' stars (' + item.reviewCount + ' reviews)</p>' : '') +
    '<p><b>Deal price</b>: ' + item.price + '</p>'
}

function getText (elem) { return elem.text() }
function getRating (elem) {
  let res = /\sa-star-small-(.*?)\s/g.exec(elem.attr('class'))
  if (res.length > 0) {
    return res[1].replace('-', '.')
  }
}

function selectCarousel ($) {
  var tmpElem
  $('.acswidget-carousel__title').each(function (i, elem) {
    if ($(elem).text() === 'Today\'s Kindle Daily Deal') {
      tmpElem = elem.parent.parent
    }
  })
  return tmpElem
}

var selectors = {
  title: { selector: '.acs_product-title span', fnExtractValue: getText },
  image: { selector: '.acs_product-image img', fnExtractValue: function (elem) { return elem.prop('src') } },
  author: { selector: '.acs_product-metadata__contributors', fnExtractValue: getText },
  price: { selector: '.acs_product-price__buying', fnExtractValue: getText },
  rating: { selector: '.a-icon-star-small', fnExtractValue: getRating },
  reviewCount: { selector: '.acs_product-rating__review-count', fnExtractValue: getText },
  url: { selector: '.acs_product-title a', fnExtractValue: function (elem) { return 'https://amazon.co.uk' + elem.prop('href').split('/ref')[0] } },
  id: { selector: '.acs_product-title a', fnExtractValue: function (elem) { return 'https://amazon.co.uk' + elem.prop('href').split('/ref')[0] } }
}

/* GET home page. */
router.get('/', function (req, res, next) {
  scraper('https://www.amazon.co.uk/Kindle-Daily-Deals/b/ref=sv_kinc_5?node=5400977031', selectCarousel, selectors)
    .then(function (response) {
      res.setHeader('Content-Type', 'application/xml')
      if (req.app.locals.cachedb.hasOwnProperty(serviceName) &&
      req.app.locals.cachedb[serviceName][0].id === response[0].id) {
        debug('Using Cache')
        response = req.app.locals.cachedb[serviceName]
      } else {
        debug('Updating cache')
        req.app.locals.cachedb[serviceName] = response
        req.app.locals.updateCache()
      }
      res.send(rssify(rssHeader, response, formatRssItem))
    })
    .catch((error) => {
      debug(error + '\n Using cache')
      // Send cache (if exists)
      res.send(rssify(rssHeader,
        req.app.locals.cachedb.hasOwnProperty(serviceName)
          ? req.app.locals.cachedb[serviceName]
          : [],
        formatRssItem))
    })
})

module.exports = router
