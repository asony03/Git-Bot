const request = require('superagent');
const mongodb = require('mongodb');
const database = require('../configs/db'); 
const session = require('express-session');
var mongoClient = mongodb.MongoClient;

module.exports = (app) => {
  app.get('/auth/callback', (req, res, next) => {

    const { query } =  req;
    const { code } =  query;

    if(!code) {
      return res.send({
        success: false,
        message: 'Error: No Code'
      });
    }

    //console.log('Code', code);

    user_data = {};
    var promise_obj = new Promise(function(resolve, reject) {
      request
      .post('https://github.com/login/oauth/access_token')
      .send({ 
        client_id: 'fc317ee363fc30b698d9', 
        client_secret: '8d491b3a5e304b94f66e5f31a9a78b0add58d7ab',
        code: code
      })
      .set('Cache-Control', 'no-cache')
      .set('Accept', 'application/json')
      .set('User-Agent', 'GitBot')
      .then(result => {
        //console.log(result.body.access_token);
        user_data.access_token = result.body.access_token;
        console.log(result.body.access_token);
        request
        .get('https://api.github.com/user')
        .set('Authorization', 'token ' + user_data.access_token)
        .set('Cache-Control', 'no-cache')
        .set('Accept', 'application/json')
        .set('User-Agent', 'GitBot')
        .then(results => {
          user_data.user = results.body.login;
          resolve(user_data);
        })
        .catch(err => {
          reject(err);
        });        
      })
      .catch(err => {
        reject(err);
      });
    });

    promise_obj.then(function(result) {

      console.log(result); // "Stuff worked!"

      mongoClient.connect(database.localUrl, function(err, db) {
        if(err) {
          console.log('unable to connect to the db server', err);
        } else {
          db.collection('users').insert(result, function(err, res) {
            if(err) {
              console.log(err);
            } 
          });
        }
      });

      request
      .get(`https://api.github.com/user/repos?visibility=all`)
      .set('Authorization', 'token ' + result.access_token)
      .set('Cache-Control', 'no-cache')
      .set('Accept', 'application/json')
      .set('User-Agent', 'GitBot')
      .then(results => {
        res.send(results.body);
      })
      .catch(err => {
        console.log(err);
      });
    }, function(err) {
      console.log(err); // Error: "It broke"
    });
  });

  app.get('/user', (req, res, next) => {

    const access_token = '393d06e72272835a5ead3ad1f0ddd79e57952a70';

    request
    .get('https://api.github.com/user')
    .set('Authorization', 'token ' + access_token)
    .set('Cache-Control', 'no-cache')
    .set('Accept', 'application/json')
    .set('User-Agent', 'GitBot')
    .then(results => {
      res.send(results.body);
    })
    .catch(err => {
      console.log("---error occured---");
      console.log(err.message);
    });
  });

};
