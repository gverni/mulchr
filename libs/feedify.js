// var shortid = require('shortid')
// console.log(shortid.generate());

var jsonFeed = {
  'version': 'https://jsonfeed.org/version/1',
  'title': 'Amazon UK Kindle Daily Deals',
  'home_page_url': 'https://github.com/gverni',
  'feed_url': 'https://sakscraper.herokuapp.com/amdduk',
  'author': {
    'url': 'https://github.com/gverni',
    'name': 'Giuseppe Verni'
  },
  'icon': 'https://www.amazon.it/favicon.ico',
  'favicon': 'https://www.amazon.it/favicon.ico',
  items: []
}

function feedify (itemsList) {
  jsonFeed.items = []
  itemsList.forEach((item, index) => {
    jsonFeed.items.push({
      id: item.productUrl,
      url: item.productUrl,
      title: item.title,
      image: item.image,
      'content_html': '<p>Title: ' + item.title + '</p>' +
       '<p>Author: ' + item.author + '</p>' +
       '<p>Reviews: ' + item.rating + ' stars (' + item.reviewCount + ' reviews)</p>' +
       '<p>Deal price: ' + item.price + '</p>'
    })
  })
  return jsonFeed
}

module.exports = feedify
