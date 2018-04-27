var express = require('express')
var router = express.Router()
const fetch = require('node-fetch')

function deScript (body) {
  return body.replace(/<script[\d\D]*?<\/script>/g, '')
}

router.get('/', function (req, res, next) {
  var tmpUrl = req.url.slice(2)
  if (tmpUrl) {
    fetch(tmpUrl)
      .then((response) => response.text())
      .then((responseText) => {
        res.send(deScript(responseText))
      })
  } else {
    res.send('Provide a url')
  }
})

module.exports = router
