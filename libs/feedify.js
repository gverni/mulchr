// var shortid = require('shortid')
// console.log(shortid.generate());

var jsonFeed = {
  'version': 'https://jsonfeed.org/version/1',
  'title': 'Amazon Daily Deal',
  'home_page_url': 'https://gverni.github.com/',
  'feed_url': 'https://gverni.github.com/',
  'author': {
    'url': 'https://gvernigithub.com/',
    'name': 'Giuseppe Verni'
  },
  'icon': 'https://www.amazon.it/favicon.ico',
  'favicon': 'https://www.amazon.it/favicon.ico',
  item: []
}

function feedify (itemsList) {
  jsonFeed.item = []
  itemsList.forEach((item, index) => {
    jsonFeed.item.push({
      id: index,
      title: item.title,
      image: item.image
    })
  })
  return jsonFeed
}

module.exports = feedify
