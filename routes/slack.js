var express = require('express')
var router = express.Router()

var availableServices = ['am-it-kindle-offerta-lampo', 'am-uk-kindle-daily-deal', 'au-uk-daily-deal' ]
var availableServicesTitle = ['Amazon Italia Kindle Offerta Lampo', 'Amazon UK Kindle Daily Deal', 'Audible UK Daily deal']

function slackify (service, data) {
  var tmpObj = {}
  tmpObj = {'text': availableServicesTitle[availableServices.indexOf(service)]}
  tmpObj.attachments = []
  data.forEach(element => {
    tmpObj.attachments.push({'text': element.title})
  })
  return tmpObj
}

router.get('/', function (req, res, next) {
  res.setHeader('Content-Type', 'text/plain')
  res.send('Placeholder for slack app installation\r\n' + JSON.stringify(slackify('am-it-kindle-offerta-lampo', req.app.locals.cachedb['am-it-kindle-offerta-lampo'])))
})

router.post('/', function (req, res, next) {
  var service = req.body.text
  res.setHeader('Content-Type', 'application/json')
  if (service) {
    res.send(slackify(service, req.app.locals.cachedb[service]))
  } else {
    res.send({
      'text': 'Mulchr: List of available services:',
      'attachments': [
        {
          'text': availableServices.join('\n')
        }
      ]
    })
  }
})

module.exports = router
