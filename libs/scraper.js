const fetch = require('node-fetch')
const cheerio = require('cheerio')
const debug = require('debug')('scraper')

function scrape (url, fnSectionSelector, itemsSelectors) {
  return fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
    }
  })
    .then(response => response.text())
    .then(responseHtml => {
      const $ = cheerio.load(responseHtml)
      var section = (fnSectionSelector) ? fnSectionSelector($) : null // TODO: handle error in finding section
      let results = []
      if (section === undefined) {
        return Promise.reject(new Error(`Section not found`))
      } else {
        for (let key in itemsSelectors) {
          try {
            if (results.length === 0) {
              $(itemsSelectors[key].selector, section).each(function (index) {
                let tmpObj = {}
                tmpObj[key] = itemsSelectors[key].fnExtractValue($(this), $)
                results.push(tmpObj)
              })
            } else {
              let elements = $(itemsSelectors[key].selector, section)
              if (elements.length !== results.length) {
                throw new Error('Number of ' + key + ' elements found (' + elements.length +
                ') + different from number of elements in array (' + results.length + ')')
              }
              elements.each(function (index) {
                results[index][key] = itemsSelectors[key].fnExtractValue($(this))
              })
            }
          } catch (error) {
            debug('scrape: ' + error)
          }
        }
        debug(results)
        return Promise.resolve(results)
      }
    })
}

// Stand-alone test function

// function selectCarousel ($) {
//   var tmpElem
//   $('.acswidget-carousel__title').each(function (i, elem) {
//     if ($(elem).text() === 'Today\'s Kindle Daily Deal') {
//       tmpElem = elem.parent.parent
//     }
//   })
//   return tmpElem
// }

// var scraperSelectors = {
//   title: {selector: '.acs_product-title span', fnExtractValue: function (elem) { return elem.text() }},
//   image: {selector: '.acs_product-image img', fnExtractValue: function (elem) { return elem.prop('src') }}
// }

// scrape('https://www.amazon.co.uk/Kindle-Daily-Deals/b/ref=sv_kinc_5?node=5400977031', selectCarousel, scraperSelectors)
//   .then(results => { console.log(results) })
//   .catch(err => { console.log(err) })

module.exports = scrape
