const request = require('superagent');
const mongodb = require('mongodb');
const database = require('../configs/db'); 
const mongoClient = mongodb.MongoClient;

module.exports = (app) => {
  // submit request is forwarded to this end point
  // create repo is triggered for each repository selected by the user
  app.post('/webhooks', async (req, res, next) => {
    var user = req.body.user;
    var repositories = [];
    var rep = undefined;
    for(var repo in req.body) {
      if(req.body[repo] == repo){
        repositories.push(repo);
      };
    };

    // get user's access token
    var accessToken = undefined;
    await fetchAccessToken(user).then(token => {
      accessToken = token;
    });

    // create webhooks
    var finalReposList = [];
    for (var i = 0; i < repositories.length; i++) {
      await createWebHook(user, repositories[i], accessToken).then(output => {
        finalReposList.push(repositories[i]);
      })
      .catch(err => {
        console.log("webhook creation for " + repositories[i] + " failed");
      });
    };

    // update DB
    await updateUserRepos(user, finalReposList).then(result => {
      console.log("User repos updated successfully");
      res.send( '<!DOCTYPE html> <html><head> </head><body> <h1>Repositories successfully added to the monitoring list!</h1> </body></html>');
    });
       
  });


  // test end point
  app.get('/web', (req, res, next) => {

    const access_token = '42b36a51c370ed4abba906a741e1a6c9f51aeab2';

    request
    .get('https://api.github.com/repos/MJSiddu/Algorithms/hooks')
    .set('Authorization', 'token ' + access_token)
    .set('Cache-Control', 'no-cache')
    .set('Accept', 'application/json')
    .set('User-Agent', 'GitBot')
    .set('content-type', 'application/json')
    .then(result => {
      console.log(result.body);
    })
    .catch(err => {
      console.log("---error occured---");
      console.log(err.message);
    });
       
  });

};

// creates webhooks using "user", "repo" and "access_token" values
var createWebHook = (user, repo, access_token) => {

  return new Promise((resolve, reject) => {

    request
    .post(`https://api.github.com/repos/${user}/${repo}/hooks`)
    .send({
      "name": "web",
      "active": true,
      "events": [
        "issues",
        "pull_request",
        "issue_comment",
        "pull_request_review",
        "pull_request_review_comment"
      ],
      "config": {
        "url": "http://localhost:8090/gateway",
        "content_type": "json",
        "insecure_ssl": "0"
      }
    })
    .set('Authorization', 'token ' + access_token)
    .set('Cache-Control', 'no-cache')
    .set('Accept', 'application/json')
    .set('User-Agent', 'GitBot')
    .set('content-type', 'application/json')
    .then(result => {
      resolve(result.body);
    })
    .catch(err => {
      reject(err);
    });
    
  });
};

// helper function to fetch the access token of a user from DB
var fetchAccessToken = (usr) => {

  return new Promise((resolve, reject) => {

    mongoClient.connect(database.localUrl, function(err, db) {

      if(err) reject(err);

      db.collection('users')
      .find({user: usr}).limit(1).next(function(err, res) {
        if(res == null || (err)) {
          reject("token entry not found for " + usr);

        } else {
          resolve(res.access_token);

        }
      });
    });    
  });
};

// update user's repositories list 
var updateUserRepos = (usr, repositories) => {

  return new Promise((resolve, reject) => {

    mongoClient.connect(database.localUrl, function(err, db) {

      if(err) reject(err);

      var newValues = { $set: {repos: repositories} };
      db.collection('users').updateOne({user: usr}, newValues, function(err, res) {
        err ? reject(err) : resolve(res);
      });
    });    
  });
};
