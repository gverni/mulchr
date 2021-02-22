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
  let res = /a-star-(.*)\s?/g.exec(elem.attr('class'))
  if (res && res.length > 0) {
    return res[1].replace('-', '.')
  } else {
    return 'N/A'
  }
}
function getPrice (elem) {
  var price = elem.find('.s-price')
  // Since i don't have access to $(), extract the text from
  // the object returned from find. You can inspect the object
  // with utils.inspect
  return price[price.length - 1].children[0].data
}

// function selectCarousel ($) {
//   var tmpElem
//   $('.acswidget-carousel__title').each(function (i, elem) {
//     if ($(elem).text() === 'Today\'s Kindle Daily Deal') {
//       tmpElem = elem.parent.parent
//     }
//   })
//   return tmpElem
// }

// var selectors = {
//   title: { selector: '.acs_product-title span', fnExtractValue: getText },
//   image: { selector: '.acs_product-image img', fnExtractValue: function (elem) { return elem.prop('src') } },
//   author: { selector: '.acs_product-metadata__contributors', fnExtractValue: getText },
//   price: { selector: '.acs_product-price__buying', fnExtractValue: getText },
//   rating: { selector: '.a-icon-star-small', fnExtractValue: getRating },
//   reviewCount: { selector: '.acs_product-rating__review-count', fnExtractValue: getText },
//   url: { selector: '.acs_product-title a', fnExtractValue: function (elem) { return 'https://amazon.co.uk' + elem.prop('href').split('/ref')[0] } },
//   id: { selector: '.acs_product-title a', fnExtractValue: function (elem) { return 'https://amazon.co.uk' + elem.prop('href').split('/ref')[0] } }
// }

// function selectResults ($) {
//   return $('#s-results-list-atf')
// }

// var selectors = {
//   title: { selector: 'h2.s-access-title', fnExtractValue: getText },
//   image: { selector: 'img.s-access-image', fnExtractValue: function (elem) { return elem.prop('src') } },
//   author: { selector: 'div.a-fixed-left-grid-col.a-col-right > div.a-row.a-spacing-small > div:nth-child(2) > span:nth-child(2)', fnExtractValue: getText },
//   price: { selector: '.a-span7', fnExtractValue: getPrice },
//   rating: { selector: '.a-icon-star', fnExtractValue: getRating },
//   reviewCount: { selector: '.s-result-item .a-span-last > div > a', fnExtractValue: getText },
//   url: { selector: '.s-access-detail-page', fnExtractValue: function (elem) { return elem.prop('href') } },
//   id: { selector: '.s-result-item.celwidget', fnExtractValue: function (elem) { return 'https://amazon.co.uk/' + elem.prop('data-asin') } }
// }

var selectors = {
  title: { selector: '.apb-browse-searchresults-product h2', fnExtractValue: getText },
  image: { selector: '.apb-browse-searchresults-product .a-image-container img', fnExtractValue: function (elem) { return elem.prop('src') } },
  author: { selector: '.apb-browse-searchresults-product .a-size-mini', fnExtractValue: getText },
  price: { selector: '.apb-browse-searchresults-product .a-price:nth-child(1) .a-offscreen', fnExtractValue: getPrice },
  rating: { selector: '.apb-browse-searchresults-product .a-icon-star-small', fnExtractValue: getRating },
  reviewCount: { selector: '.apb-browse-searchresults-product .a-spacing-top-micro .a-size-small', fnExtractValue: getText },
  url: { selector: '.apb-browse-searchresults-product >a', fnExtractValue: function (elem) { return 'https://amazon.co.uk/' + elem.prop('href') } },
  id: { selector: '.apb-browse-searchresults-product >a', fnExtractValue: function (elem) { return elem.prop('href') } }
}

//
// Kindle deals page url: https://www.amazon.co.uk/Kindle-Daily-Deals/b/ref=sv_kinc_5?node=5400977031
// Kindle daily deals page url: https://www.amazon.co.uk/s/ref=s9_acsd_hps_bw_clnk_r?node=341677031,!425595031,!425597031,5400977031,341689031&bbn=5400977031
// The above doesn;t work anymore from heroku servers
/* GET home page. */

router.get('/', function (req, res, next) {
  scraper('https://amazon.co.uk/Kindle-Daily-Deals/b/?ie=UTF8&node=5400977031', null, selectors)
    .then(function (response) {
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
