var chai = require('chai')
var app = require('../app')
const fetch = require('node-fetch')

var expect = chai.expect

describe('Test Slack integration', function() {
    var server
    this.timeout(10000)
  
    before(() => {
      // Remove cache
      // Spyting the debug library
      // sinon.spy(process.stderr, 'write')
      server = app.listen(3000)
    })
    after(() => {
      // Restore debug library
      //process.stderr.write.restore()
      server.close()
    })

    it('Return 200 sending a valid request', function(done) {
        // At the moment we don't do timestamp check on the server
        // but this is a feature that will be added later
        fetch('http://127.0.0.1:3000/slack', {
            method: 'POST', 
            headers: {
                'Content-type': 'application/x-www-form-urlencoded',
                'X-Slack-Request-Timestamp': '1533402484', 
                'X-Slack-Signature': process.env.TEST_SLACK_SIGNATURE 
            },
            body: 'token=ZDkshxHjYaOtHbydpNdoH6ZX&team_id=T8MKF6L6R&team_domain=vernixyz&channel_id=D8MCZN63V&channel_name=directmessage&user_id=U8MG7AFSQ&user_name=g.verni&command=%2Fmulchr&text=&response_url=https%3A%2F%2Fhooks.slack.com%2Fcommands%2FT8MKF6L6R%2F410897822162%2F9ZhEOFu1BkxwiREndzA4turU&trigger_id=410897822178.293661224229.0fece09d8b733186368ed220a28e6bde'
        })
        .then(res => {
            expect(res.status).to.equal(200)
            done()
        })
        .catch((err) => { done(err) }) 
    })

    it ('Return 203 sending invalid slack request', function(done) {
        fetch('http://127.0.0.1:3000/slack', {
            method: 'POST', 
            headers: {
                'Content-type': 'application/x-www-form-urlencoded',
                'X-Slack-Request-Timestamp': '1533402484', 
            },
            body: 'test=true'
        })
        .then(res => {
            expect(res.status).to.equal(403)
            done()
        })
        .catch((err) => { done(err) })
    })
})