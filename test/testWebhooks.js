const chai = require('chai');
const chaiHttp = require('chai-http');
const nock = require('nock');
const app = require('../src/index.js');
const data = require('./mock.json');
const DBManager = require('../src/services/db.js');
const webhookHelper = require('../src/services/webhookHelper.js');

const { expect } = chai;
chai.use(chaiHttp);

require('../src/routes/webhooks.js')(app);

describe('Test Webhooks.js', async () => {
  nock('https://api.github.com')
    .persist()
    .post(/repos\/[\s\S]*\/[\s\S]*\/hooks/)
    .reply(201, JSON.stringify(data.create_webhooks_api_response));

  nock('https://api.github.com')
    .persist()
    .get(/repos\/[\s\S]*\/[\s\S]*\/hooks/)
    .reply(200, JSON.stringify(data.list_webhooks_api_response));

  nock('https://api.github.com')
    .persist()
    .delete(/repos\/[\s\S]*\/[\s\S]*\/hooks\/[\s\S]*/)
    .reply(204, JSON.stringify({}));

  nock('https://api.github.com')
    .persist()
    .put(/repos\/[\s\S]*\/[\s\S]*\/collaborators\/Git-Bot-Luna/)
    .reply(201, JSON.stringify(data.add_collab_api_response));

  nock('https://api.github.com')
    .persist()
    .delete(/repos\/[\s\S]*\/[\s\S]*\/collaborators\/Git-Bot-Luna/)
    .reply(204, JSON.stringify({}));

  nock('https://api.github.com')
    .persist()
    .post(/repos\/[\s\S]*\/[\s\S]*\/labels/)
    .reply(201, JSON.stringify(data.create_labels_api_response));

  nock('https://api.github.com')
    .persist()
    .delete(/repos\/[\s\S]*\/[\s\S]*\/labels\/[\s\S]*/)
    .reply(201, JSON.stringify({}));

  nock('https://api.github.com')
    .persist()
    .patch(/user\/repository_invitations\/[\s\S]*/)
    .reply(204, JSON.stringify({}));

  const insertRecord = (record) => new Promise((resolve, reject) => {
    DBManager.getDB().then((db) => {
      db.collection('users').insert(record, (err, res) => {
        if (res == null || err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  });

  describe('GET /webhooks', () => {
    before(async () => {
      await insertRecord({ user: 'testUser1', access_token: 'access_token', repos: ['testRepo1', 'testRepo2', 'testRepo3'] });
      await insertRecord({ user: 'testUser2', access_token: 'access_token', repos: ['testRepo1', 'testRepo2', 'testRepo3'] });
    });

    it('it should render an html page with success message', (done) => {
      chai.request(app)
        .post('/webhooks')
        .send({
          testRepo1: 'testRepo1', testRepo2: 'testRepo2', testRepo3: 'testRepo3', user: 'testUser1',
        })
        .end((err, res) => {
          expect(res.text).to.contain('Repositories successfully added to the monitoring list!');
          done();
        });
    });

    it('should remove and add repositories from being monitored according to user selection', (done) => {
      chai.request(app)
        .post('/webhooks')
        .send({
          testRepo2: 'testRepo2', testRepo3: 'testRepo3', testRepo4: 'testRepo4', user: 'testUser1',
        })
        .end(async (err, res) => {
          const repos = await webhookHelper.fetchCurrentRepositories('testUser1');
          expect(repos.length).to.equal(3);
          expect(repos[0]).to.equal('testRepo2');
          expect(repos[1]).to.equal('testRepo3');
          expect(repos[2]).to.equal('testRepo4');
          expect(res.text).to.contain('Repositories successfully added to the monitoring list!');
          done();
        });
    });
  });
});
