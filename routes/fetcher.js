var express = require('express')
var router = express.Router()
const fetch = require('node-fetch')

function deScript (body) {
  return body.replace(/<script[\d\D]*?<\/script>/g, '')
}

router.get('/', function (req, res, next) {
  var tmpUrl = req.url.slice(2)
  if (tmpUrl) {
    fetch(tmpUrl, {
      headers: {
        'user-agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
      }
    })
      .then((response) => response.text())
      .then((responseText) => {
        res.send(deScript(responseText))
      })
  } else {
    res.send('Provide a url')
  }
})

module.exports = router
