const chai = require("chai");
const chaiHttp = require('chai-http');
const nock = require("nock");
const mocha = require("mocha");
const expect = chai.expect;
const should = chai.should();
const app = require("../src/index.js");
const data = require("./mock.json");
chai.use(chaiHttp);
const helper = require('../src/helpers');
const sinon = require('sinon');
const crypto = require('crypto');

describe('Test Index.js', () => {

    describe('GET /', () => {
        it('it should render the index.html page', (done) => {
          chai.request(app)
              .get('/') 
              .end((err, res) => {
                  expect(res.text).to.contain("SE Git Bot");
                  done();
              });
        });
    });

    describe('POST /webhook', () => {
        it('it should return 401 on invalid signature', (done) => {
          chai.request(app)
              .post('/webhook')
              .send(data.issues_event_payload)
              .end((err, res) => {
                  expect(res).to.have.status(401);
                  done();
              });
        });

        it('it should return 200 on valid signature', (done) => {
            const hmac = crypto.createHmac('sha1', process.env.GITHUB_WEBHOOK_SECRET);
            hmac.update("This is sample text", 'utf-8');
            var sha1 = `sha1=${hmac.digest('hex')}`;
            chai.request(app)
                .post('/webhook')
                .set('x-hub-signature',sha1)
                .send(data.issues_event_payload)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    done();
                });
          });
    });

    describe('POST /slack', () => {
        it('it should return 200 on valid request', (done) => {
            chai.request(app)
                .post('/slack')
                .send(data.issues_event_payload)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    done();
                });
          });
    })
})


