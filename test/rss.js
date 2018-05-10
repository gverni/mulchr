var chai = require('chai')
var app = require('../app')
const fetch = require('node-fetch')

var expect = chai.expect

describe('RSS', function () {
  var server
  this.timeout(5000)

  before(() => {
    server = app.listen(3000)
  })
  after(() => server.close())

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
        expect(text).to.contain('<item>')
        expect(text).to.contain('</item>')
        done()
      })
      .catch((err) => { done(err) })
  })

})
