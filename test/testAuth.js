const chai = require('chai');
const chaiHttp = require('chai-http');
const nock = require('nock');
const app = require('../src/index.js');
const data = require('./mock.json');
const mongodb = require('mongodb');

const expect = chai.expect;
chai.use(chaiHttp);

require('../src/routes/auth.js')(app);

describe('Test Auth.js', async () => {

    var mockService1 = nock("https://github.com")
    .persist()
    .post("/login/oauth/access_token")
    .reply(200, JSON.stringify(data.oauth_login_res) );

    var mockService2 = nock("https://api.github.com")
    .persist()
    .get("/user")
    .reply(200, JSON.stringify(data.user) );

    var mockService3 = nock("https://api.github.com")
    .persist()
    .get("/user/repos?visibility=all")
    .reply(200, JSON.stringify(data.get_repos) );
    
    describe('GET /auth/callback', () => {

        it('it should return 401 if the code param is missing', (done) => {
            chai.request(app)
                .get('/auth/callback')
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    done();
                });
        });

        it('it should return 200 on a proper payload', (done) => {
          chai.request(app)
              .get('/auth/callback')
              .query({code: "0ff692028acba146a57e"})
              .end((err, res) => {
                expect(res).to.have.status(200);
                done();
              });
        });
    });
})