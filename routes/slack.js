var express = require('express')
var router = express.Router()
const crypto = require('crypto')
const debug = require('debug')('slack')
const querystring = require('querystring')


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

function validateSlackRequest(httpReq) {
  const SlackAppSigningSecret = process.env.MLUCHR_SLACK_SIGNING_SECRET || ''
  const xSlackRequestTimeStamp = httpReq.get('X-Slack-Request-Timestamp') || ''
  const SlackSignature = httpReq.get('X-Slack-Signature') || ''
  const baseString = 'v0:' + xSlackRequestTimeStamp + ':' + (querystring.stringify(httpReq.body) || '')
  const hash = 'v0=' + crypto.createHmac('sha256', SlackAppSigningSecret)
     .update(baseString)
     .digest('hex')
  debug('Slack verifcation:\n Calculated Hash: ' + hash + '\n Slack-Signature: ' + SlackSignature)
  return (SlackSignature === hash)
}

router.get('/', function (req, res, next) {
  // Use below for debugging
  // var availableServicesMessage = {}
  // availableServicesMessage['text'] = 'Let\'s get mulching...'
  // availableServicesMessage['attachments'] = [{'text': 'Choose the service:', 'attachment_type': 'default', 'actions': []}]
  // availableServices.forEach((service, index) => {
  //   availableServicesMessage['attachments'][0]['actions'].push({'name': service, 'text': availableServicesTitle[index], 'type': 'button', 'value': service})
  // })

  // res.setHeader('Content-Type', 'text/plain')
  // // res.send('Placeholder for slack app installation\r\n' + JSON.stringify(slackify('am-it-kindle-offerta-lampo', req.app.locals.cachedb['am-it-kindle-offerta-lampo'])))
  // res.send('Placeholder for slack app installation\r\n' + JSON.stringify(availableServicesMessage))
  res.redirect('slack-install.html')
})

router.post('/', function (req, res, next) {
  if (validateSlackRequest(req)) {
    res.setHeader('Content-Type', 'application/json')
    var service = (req.body.payload) ? JSON.parse(req.body.payload).actions[0].value : req.body.text
    if (service) {
      res.send(slackify(service, req.app.locals.cachedb[service]))
    } else {
      var availableServicesMessage = {}
      availableServicesMessage['text'] = 'Let\'s get mulching...'
      availableServicesMessage['attachments'] = [{'text': 'Choose the service:', 'callback_id': 'service', 'color': '#3AA3E3', 'attachment_type': 'default', 'actions': []}]
      availableServices.forEach((service, index) => {
        availableServicesMessage['attachments'][0]['actions'].push({'name': service, 'text': availableServicesTitle[index], 'type': 'button', 'value': service})
      })
      res.send(availableServicesMessage)
    }
  } else {
    // If it's not a validated slack request we send 403 error
    res.sendStatus(403)
  }
})

module.exports = router
