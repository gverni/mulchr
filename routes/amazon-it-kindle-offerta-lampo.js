var express = require('express')
var router = express.Router()
var rssify = require('../libs/rssify')
const scraper = require('../libs/scraper')
const debug = require('debug')('service:am-it-kindle-offerta-lampo')
const fetch = require('node-fetch')
var entities = require('entities')
const MAX_RETRIES = 3

var serviceName = 'am-it-kindle-offerta-lampo'

var rssHeader = { title: 'Amazon Italia Offerta Lampo Kindle',
  description: 'Amazon Italia Offerta Lampo Kindle',
  url: 'https:/mulchr.herokuapp.com/' + serviceName }

function formatRssItem (item) {
  return '<p><img src="' + item.image + '"</p>' +
  '<p><b>Titolo</b>: ' + item.title + '</p>' +
  '<p><b>Autore</b>: ' + item.author + '</p>' +
  (item.rating ? '<p><b>Recensioni</b>: ' + item.rating + ' stelle (' + item.reviewCount + ' recensioni clienti)</p>' : '') +
  '<p><b>prezzo</b>: ' + item.price + '</p>' +
  '<p><b>Sinossi</b></p><p>' + item.description + '</p>'
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
    if ($(elem).text() === 'L\'offerta lampo di oggi') {
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
  url: { selector: '.acs_product-title a', fnExtractValue: function (elem) { return 'https://amazon.it' + elem.prop('href').split('/ref')[0] } },
  id: { selector: '.acs_product-title a', fnExtractValue: function (elem) { return 'https://amazon.it' + elem.prop('href').split('/ref')[0] } }
}

function fnCheckCondition (text) {
  return /<span id="ebooksProductTitle".*?>(.*?)<\/span>/g.exec(text) !== null
}

function fetchRecursive (url, retry) {
  retry = retry || 0
  return fetch(url)
    .then((response) => response.text())
    .then((responseText) => {
      if (fnCheckCondition(responseText)) {
        return Promise.resolve(responseText)
      } else {
        if (retry <= MAX_RETRIES) {
          debug(`Fetching ${url} - Retry ${retry}`)
          retry++
          return fetchRecursive(url, retry)
        } else {
          return Promise.reject(new Error('Max retries'))
        }
      }
    })
}

function postProcess (scrapedItems, req) {
  if (req.app.locals.cachedb.hasOwnProperty(serviceName) &&
  req.app.locals.cachedb[serviceName][0].id === scrapedItems[0].id) {
  // We compare the title, because Amazon is actually changing the url
  // for the same product
    debug('Using cache')
    return Promise.resolve(req.app.locals.cachedb[serviceName])
  } else {
    var promises = []
    scrapedItems.forEach((item) => {
      promises.push(
        fetchRecursive(item.url)
          .then(responseText => {
            /* The title cannot contains HTML entities otherwise the resultsing XML (rss)
             * will not pass validation. We use entities lib to decode it
             */
            item.title = entities.decodeHTML(/<span id="ebooksProductTitle".*?>(.*?)<\/span>/g.exec(responseText)[1])
            item.description = /<div id="bookDescription_feature_div"[\s\S]*?<noscript>[\s\S]*?<div>([\s\S]*?)<\/div>/g.exec(responseText)[1]
          })
          .catch(() => {
            item.description = 'Non disponibile'
          })
      )
    })

    return Promise.all(promises)
      .then(() => {
        debug('Updating cache')
        req.app.locals.cachedb[serviceName] = scrapedItems
        req.app.locals.updateCache()
        return Promise.resolve(scrapedItems)
      })
  }
}

/* GET home page. */
router.get('/', function (req, res, next) {
  scraper('https://www.amazon.it/Offerta-Lampo-Kindle/b/ref=amb_link_3?ie=UTF8&node=5689487031', selectCarousel, selectors)
    .then(function (response) {
      res.setHeader('Content-Type', 'application/xml')
      postProcess(response, req)
        .then((scrapedItems) => {
          debug(scrapedItems)
          res.send(rssify(rssHeader, scrapedItems, formatRssItem))
        })
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
