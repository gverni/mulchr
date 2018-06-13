var express = require('express')
var router = express.Router()

router.get('/', function (req, res, next) {
  res.send('Placeholder for slack app installation')
})

router.post('/', function (req, res, next) {
  res.setHeader('Content-Type', 'application/json')
  res.send({
    'text': 'Mulchr: List of available services:',
    'attachments': [
      {
        'text': 'uk-kindle-daily-deal\nit-kindle-daily-deal\nuk-audible'
      }
    ]
  })
})

module.exports = router
