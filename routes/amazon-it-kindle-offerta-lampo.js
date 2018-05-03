var express = require('express')
var router = express.Router()
var rssify = require('../libs/rssify')
const scraper = require('../libs/scraper')

var serviceName = 'am-it-kindle-offerta-lampo'

var rssHeader = {title: 'Amazon Italia Offerta Lampo Kindle',
  description: 'Amazon Italia Offerta Lampo Kindle',
  url: 'https:/mulchr.herokuapp.com/' + serviceName}

function formatRssItem (item) {
  return '<p><img src="' + item.image + '"</p>' +
  '<p><b>Titolo</b>: ' + item.title + '</p>' +
  '<p><b>Autore</b>: ' + item.author + '</p>' +
  (item.rating ? '<p><b>Recensioni</b>: ' + item.rating + ' stelle (' + item.reviewCount + ' recensioni clienti)</p>' : '') +
  '<p><b>prezzo</b>: ' + item.price + '</p>'
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
    if ($(elem).text() === 'Oggi in offerta lampo') {
      tmpElem = elem.parent.parent
    }
  })
  return tmpElem
}

function getAuthor (elem) {
  var matches = elem.text().match(/\t+(\S| )+?\n/g)
  return matches[1].trim()
}

var selectors = {
  title: { selector: '.acs_product-title span', fnExtractValue: getText },
  image: { selector: '.acs_product-image img', fnExtractValue: function (elem) { return elem.prop('src') } },
  author: { selector: '.a-carousel-card.acswidget-carousel__card', fnExtractValue: getAuthor },
  price: { selector: '.acs_product-price__buying', fnExtractValue: getText },
  rating: { selector: '.a-icon-star-small', fnExtractValue: getRating },
  reviewCount: { selector: '.acs_product-rating__review-count', fnExtractValue: getText },
  url: { selector: '.acs_product-title a', fnExtractValue: function (elem) { return 'https://amazon.it' + elem.prop('href') } }
}

/* GET home page. */
router.get('/', function (req, res, next) {
  scraper('https://www.amazon.it/Offerta-Lampo-Kindle/b/ref=amb_link_3?ie=UTF8&node=5689487031', selectCarousel, selectors)
    .then(function (response) {
      res.setHeader('Content-Type', 'application/xml')
      if (req.app.locals.cachedb.hasOwnProperty(serviceName) &&
        req.app.locals.cachedb[serviceName][0].title === response[0].title) {
        // We compare the title, because Amazon is actually changing the url
        // for the same product
        console.log('Using Cache')
        response = req.app.locals.cachedb[serviceName]
      } else {
        console.log('Updating cache')
        req.app.locals.cachedb[serviceName] = response
        req.app.locals.updateCache()
      }
      res.send(rssify(rssHeader, response, formatRssItem))
    })
    .catch((error) => {
      let serviceName = req.baseUrl.slice(1)
      console.log(serviceName + ': ' + error)
      // Send cache (if exists)
      res.send(rssify(rssHeader,
        req.app.locals.cachedb.hasOwnProperty(serviceName)
          ? req.app.locals.cachedb[serviceName]
          : [],
        formatRssItem))
    })
})

module.exports = router
