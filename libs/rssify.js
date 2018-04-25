
// var xmlDocHeader = '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" ' +
// 'xmlns:content="http://purl.org/rss/1.0/modules/content/" ' +
// 'xmlns:wfw="http://wellformedweb.org/CommentAPI/" ' +
// 'xmlns:dc="http://purl.org/dc/elements/1.1/" ' +
// 'xmlns:atom="http://www.w3.org/2005/Atom">' +
// '<channel>' +
// '<title>Amazon UK Kindle Daily deals</title>' +
// '<link>https://sakscraper.herokuapp.com</link>' +
// '<atom:link href="https://sakscraper.herokuapp.com/amddukrss" rel="self" type="application/rss+xml" />' +
// '<description>MyKidle Daily Deals</description>' +
// '<language>en</language>'
// var xmlDocFooter = '</channel></rss>'

//   <item>
// <title>A Post Title</title>
// <guid isPermaLink="true">http://www.mydomain.com/file-location/</guid>
// <link>http://www.mydomain.com/page-location/</link>
// <pubDate>Wed, 30 Apr 2009 23:00:00 +1100</pubDate>
// <description><![CDATA[ <p>This is a brief summary of the post, so tempting that no one will be able to resist clicking through.</p> ]]></description>
//   </item>
const uriEncode = require('strict-uri-encode')

const rss2DocHeader = '<?xml version="1.0" encoding="UTF-8" ?>\n<rss version="2.0">\n<channel>'
const rss2DocFooter = '\n</channel>\n</rss>'

function uriEncodeUrl (url) {
  return url.split('?')[0] + (url.split('?')[1] ? '?' + uriEncode(url.split('?')[1]) : '')
}

function rssify (channelInfo, itemsList, fnFormatDescription) {
  var rssFeed = rss2DocHeader
  // Filling up channel info
  rssFeed += '<title>' + channelInfo.title + '</title>' +
    '<description>' + channelInfo.description + '</description>' +
    '<link>' + channelInfo.url + '</link>'
  // Filling up items
  itemsList.forEach((item) => {
    let tmpFeedItem = '<item>' +
            '<title>' + item.title + '</title>' +
            '<guid isPermaLink="true">' + uriEncodeUrl(item.url) + '</guid>' + // TODO: change productUrl to product in existing scraper
            '<link>' + uriEncodeUrl(item.url) + '</link>' +
            '<description><![CDATA[' + fnFormatDescription(item) + ']]></description>' +
            '</item>'
    rssFeed += tmpFeedItem
  })
  rssFeed += rss2DocFooter

  return rssFeed
}

module.exports = rssify
