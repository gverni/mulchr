var express = require('express')
var router = express.Router()
var pgfs = require('../libs/pg-mini-fs')

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.setHeader('Content-type', 'text/plain')
  if (req.query.action === 'reset') {
    pgfs.resetFs()
      .then(() => {
        res.send('DB reset')
      })
  } else {
    var testResult = ''
    pgfs.readFile('foo.txt')
      .then((content) => {
        testResult += ('Content of file\n\n' + content + '\n')
      })
      .catch((error) => {
        testResult += error + '\nCreating File...\n'
        return pgfs.writeFile('foo.txt', 'test')
          .then(() => pgfs.readFile('foo.txt'))
          .then((content) => {
            testResult += ('Content of file\n\n' + content + '\n')
            return Promise.resolve()
          })
          .catch((error) => {
            testResult += 'Error creating file ' + error
          })
      })
      .then((content) => {
        res.send(testResult)
      })
  }
})

module.exports = router
