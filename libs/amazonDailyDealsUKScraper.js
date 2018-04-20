const fetch = require('node-fetch')
const cheerio = require('cheerio')
const dailyDealUKUrl = 'https://www.amazon.co.uk/Kindle-Daily-Deals/b/ref=sv_kinc_5?node=5400977031'
const dailyDealElementTemplate = { title: '', imageUrl: '', author: '', price: '', rating: '', reviewCount: '', productUrl: '' }

// Selectors
const titleSelector = '.acs_product-title span'
const imageUrlSelector = '.acs_product-image img'
const authorSelector = 'acs_product-metadata__contributors'
const priceSelector = 'acs_product-price__buying'
const ratingSelector = ''
const reviewCountSelector = 'acs_product-rating__review-count'
const productUrlSelector = '.acs_product-title a'

function fetchAndScrape () {
  return fetch(dailyDealUKUrl)
    .then(response => response.text())
    .then(responseHtml => {
      const $ = cheerio.load(responseHtml)
      var dailyDealCarousel
      let results = [] 
      $('.acswidget-carousel__title').each(function (i, elem) {
        if ($(elem).text() === 'Today\'s Kindle Daily Deal') {
          dailyDealCarousel = elem.parent.parent
        }
      })
      if (dailyDealCarousel) {
        console.log('Carousel found')
        $(dailyDealCarousel).find(titleSelector).each(function () {
          // console.log($(this).text())
          results.push({title: $(this).text(), content: $(this).text()})
        })
        $(dailyDealCarousel).find(imageUrlSelector).each(function (index) {
          results[index].image = $(this).prop('src')
        })
      }
      return Promise.resolve(results)
    })
}

module.exports = fetchAndScrape
