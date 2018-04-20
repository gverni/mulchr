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
  items: []
}

function feedify (itemsList) {
  jsonFeed.items = []
  itemsList.forEach((item, index) => {
    jsonFeed.items.push({
      id: item.image,
      "date_published" : "2018-04-19T00:00:15Z",
      "date_modified" : "2018-04-19T00:00:16Z",
      title: item.title,
      image: item.image,
      "content_text": item.content
    })
  })
  return jsonFeed
}

module.exports = feedify
