var chai = require('chai')
var chaiHttp = require('chai-http')
var app = require('../app')

var expect = chai.expect

chai.use(chaiHttp)

describe('App', function () {
  describe('Amazon Italia Kindle Daily Deal', function () {
    this.timeout(5000)
    it('responds with status 200', function (done) {
      chai.request(app)
        .get('/am-it-kindle-offerta-lampo')
        .end(function (err, res) {
          expect(res).to.have.status(200)
          done()
        })
    })
  })
})
