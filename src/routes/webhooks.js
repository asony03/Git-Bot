const request = require('superagent');
const mongodb = require('mongodb');

const mongoClient = mongodb.MongoClient;

module.exports = (app) => {
  // submit request is forwarded to this end point
  // create repo is triggered for each repository selected by the user
  app.post('/webhooks', async (req, res) => {
    const user = req.body.user;
    const repositories = [];
    
    for (const repo in req.body) {
      if (req.body[repo] == repo) {
        repositories.push(repo);
      }
    }

    // get user's access token
    let accessToken;
    await fetchAccessToken(user).then((token) => {
      accessToken = token;
    });

    // create webhooks
    const finalReposList = [];
    for (var i = 0; i < repositories.length; i++) {
      await createWebHook(user, repositories[i], accessToken).then((output) => {
        finalReposList.push(repositories[i]);
      }).catch((err) => {
        console.log(`webhook creation for ${  repositories[i]  } failed`);
      });
    }

    // update DB
    await updateUserRepos(user, finalReposList).then((result) => {
      console.log('User repos updated successfully');
      res.send('<!DOCTYPE html> <html><head> </head><body> <h1>Repositories successfully added to the monitoring list!</h1> </body></html>');
    });
  });
};

// creates webhooks using "user", "repo" and "access_token" values
const createWebHook = (user, repo, access_token) => new Promise((resolve, reject) => {
  request
    .post(`https://api.github.com/repos/${user}/${repo}/hooks`)
    .send({
      name: 'web',
      'active': true,
      'events': [
        'issues',
        'pull_request',
        'issue_comment',
        'pull_request_review',
        'pull_request_review_comment',
      ],
      config: {
        url: `${process.env.NGROK_URL}/webhook`,
        'content_type': 'json',
        'insecure_ssl': '0',
      },
    })
    .set('Authorization', `token ${access_token}`)
    .set('Cache-Control', 'no-cache')
    .set('Accept', 'application/json')
    .set('User-Agent', 'GitBot')
    .set('content-type', 'application/json')
    .then((result) => {
      resolve(result.body);
    })
    .catch((err) => {
      reject(err);
    });
});

// helper function to fetch the access token of a user from DB
var fetchAccessToken = (usr) => new Promise((resolve, reject) => {
  mongoClient.connect(process.env.DATABASE_URL, (err, db) => {

    if (err) reject(err);

    db.collection('users')
      .find({
        user: usr
      }).limit(1).next(function (err, res) {
        if (res == null || (err)) {
          reject("token entry not found for " + usr);

        } else {
          resolve(res.access_token);

        }
      });
  });
});

// update user's repositories list
var updateUserRepos = (usr, repositories) => new Promise((resolve, reject) => {
  mongoClient.connect(process.env.DATABASE_URL, (err, db) => {

    if (err) reject(err);

    var newValues = {
      $set: {
        repos: repositories
      }
    };
    db.collection('users').updateOne({
      user: usr
    }, newValues, function (err, res) {
      err ? reject(err) : resolve(res);
    });
  });
});
