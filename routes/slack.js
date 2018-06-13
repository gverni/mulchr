var express = require('express')
var router = express.Router()

function slackify (title, data) {
  var tmpObj = {}
  tmpObj = {'text': title}
  tmpObj.attachments = []
  data.forEach(element => {
    tmpObj.attachments.push({'text': element.title})
  })
  return tmpObj
}

router.get('/', function (req, res, next) {
  res.send('Placeholder for slack app installation')
})

router.post('/', function (req, res, next) {
  var service = req.body.text
  res.setHeader('Content-Type', 'application/json')
  if (service) {
    res.send(slackify(service, req.app.locals.cachedb['am-it-kindle-offerta-lampo']))
  } else {
    res.send({
      'text': 'Mulchr: List of available services:',
      'attachments': [
        {
          'text': 'uk-kindle-daily-deal\nit-kindle-daily-deal\nuk-audible'
        }
      ]
    })
  }
})

module.exports = router
