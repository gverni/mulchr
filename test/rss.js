var chai = require('chai')
var app = require('../app')
const fetch = require('node-fetch')
const sinon = require('sinon')

var expect = chai.expect

describe('Testing RSS services', function () {
  var server
  this.timeout(10000)

  before(() => {
    // Remove cache
    // Spyting the debug library
    sinon.spy(process.stderr, 'write')
    server = app.listen(3000)
  })
  after(() => {
    // Restore debug library
    process.stderr.write.restore()
    server.close()
  })

  it('Amazon Italia Kindle Offerta Lampo', function (done) {
    fetch('http://127.0.0.1:3000/am-it-kindle-offerta-lampo')
      .then(res => {
        expect(res.status).to.equal(200)
        return res.text()
      }).then(text => {
        expect(text).to.contain('<item>')
        expect(text).to.contain('</item>')
        done()
      })
      .catch((err) => { done(err) })
  })

  it('Amazon UK Kindle Daily Deal', function (done) {
    fetch('http://127.0.0.1:3000/am-uk-kindle-daily-deal')
      .then(res => {
        expect(res.status).to.equal(200)
        return res.text()
      }).then(text => {
        expect(text).to.contain('<item>')
        expect(text).to.contain('</item>')
        done()
      })
      .catch((err) => { done(err) })
  })

  it('Audible UK Daily Deal', function (done) {
    fetch('http://127.0.0.1:3000/au-uk-daily-deal')
      .then(res => {
        expect(res.status).to.equal(200)
        return res.text()
      }).then(text => {
        if (!process.env.TRAVIS) {
          // Travis run from a non-UK server, so fetching Audible UK page
          // causes too many redirect. So we skip the test on travis
          expect(text).to.contain('<item>')
          expect(text).to.contain('</item>')
        }
        done()
      })
      .catch((err) => { done(err) })
  })

  it('Check usage of cache', function (done) {
    this.timeout(30000)
    fetch('http://127.0.0.1:3000/am-it-kindle-offerta-lampo')
      .then(response => response.text())
      .then(() => fetch('http://127.0.0.1:3000/am-uk-kindle-daily-deal'))
      .then(response => response.text())
      .then(() => fetch('http://127.0.0.1:3000/au-uk-daily-deal'))
      .then(response => response.text())
      .then(() => {
        let callsNo = 0
        process.stderr.write.getCalls().forEach((spyCall) => {
          if (/.*?Using cache.*?/.test(spyCall.args[0])) { callsNo++ }
        })
        if ((process.env.TRAVIS && callsNo === 2) ||
              (!process.env.TRAVIS && callsNo === 3)) {
          done()
        } else {
          done('\'Using cache\' called ' + callsNo + ' times')
        }
      })
  })
})
