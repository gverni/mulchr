
var xmlDocHeader = '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" ' +
'xmlns:content="http://purl.org/rss/1.0/modules/content/" ' +
'xmlns:wfw="http://wellformedweb.org/CommentAPI/" ' +
'xmlns:dc="http://purl.org/dc/elements/1.1/" ' +
'xmlns:atom="http://www.w3.org/2005/Atom">' +
'<channel>' +
'<title>Amazon UK Kindle Daily deals</title>' +
'<link>https://sakscraper.herokuapp.com</link>' +
'<atom:link href="https://sakscraper.herokuapp.com/amddukrss" rel="self" type="application/rss+xml" />' +
'<description>MyKidle Daily Deals</description>' +
'<language>en</language>'

var xmlDocFooter = '</channel></rss>'
//   <item>
// <title>A Post Title</title>
// <guid isPermaLink="true">http://www.mydomain.com/file-location/</guid>
// <link>http://www.mydomain.com/page-location/</link>
// <pubDate>Wed, 30 Apr 2009 23:00:00 +1100</pubDate>
// <description><![CDATA[ <p>This is a brief summary of the post, so tempting that no one will be able to resist clicking through.</p> ]]></description>
//   </item>

function rssify (itemList) {
  var rssFeed = xmlDocHeader
  itemList.forEach((item) => {
    let tmpFeedItem = '<item><title>' + item.title + '</title>' +
            '<guid isPermaLink="true">' + item.image + '</guid>' +
            '<link>' + item.image + '</link>' +
            '<pubDate>' + 'Fri, 20 Apr 2018 00:00:00 GMT' + '</pubDate>' +
            '<description><![CDATA[ <img src="' + item.image + '"</p><p>' + item.title + '</p> ]]></description>' +
            '</item>'
    rssFeed += tmpFeedItem
  })
  rssFeed += xmlDocFooter

  return rssFeed
}

module.exports = rssify