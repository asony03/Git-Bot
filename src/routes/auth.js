const request = require('superagent');
const DBManager = require('../services/db.js');

// update user's repositories list
const addOrUpdateUserEntry = async (result) => {
  return new Promise((resolve, reject) => {
    DBManager.getDB().then((db) => {
      db.collection('users')
      .find({ user: result.user }).limit(1).next((err, res) => {
        if(res == null) {
          db.collection('users').insert(result, (errVal, resVal) => {
            errVal ? reject(errVal) : resolve(resVal);
          });

        } else {

          var newValues = { $set: {access_token: result.access_token } };
          db.collection('users').updateOne({ user: result.user }, newValues, (dbErr, dbRes) => {
            dbErr ? reject(dbErr) : resolve(dbRes);
          });
        }
      });
    });
  });
};

// 2 - way handshake -> pass code to get the access token
const getAccessToken = (code) => {

  var userData = {};
  return new Promise((resolve, reject) => {
    request
      .post('https://github.com/login/oauth/access_token')
      .send({ 
        client_id: process.env.GITHUB_OAUTH_CLIENT_ID, 
        client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
        code: code
      })
      .set('Cache-Control', 'no-cache')
      .set('Accept', 'application/json')
      .set('User-Agent', 'GitBot')
      .then((result) => {
        userData.access_token = result.body.access_token;
        request
          .get('https://api.github.com/user')
          .set('Authorization', 'token ' + userData.access_token)
          .set('Cache-Control', 'no-cache')
          .set('Accept', 'application/json')
          .set('User-Agent', 'GitBot')
          .then((results) => {
            userData.user = results.body.login;
            resolve(userData);
          })
          .catch((err) => {
            reject(err);
          });        
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = (app) => {

  app.get('/getClientId', (req, res) => {
    res.json({ token: process.env.GITHUB_OAUTH_CLIENT_ID });
  });

  // callback handler
  app.get('/auth/callback', async (req, res) => {

    const { query } = req;
    const { code } = query;

    if (!code) {
      return res.status(401).send({
        success: false,
        message: 'Error: No Code'
      });
    }
    // use code to get the access token
    await getAccessToken(code).then(async (reslt) => {
      // console.log(reslt); // "Stuff worked!"
      var result = reslt;
      result.repos = [];
      // add/update the access token
      await addOrUpdateUserEntry(result).then((op) => {
        console.log('success');
      })
        .catch((err) => {
          console.log(err);
        });
      // fetch all repos of the user
      request
        .get('https://api.github.com/user/repos?visibility=all')
        .set('Authorization', 'token ' + result.access_token)
        .set('Cache-Control', 'no-cache')
        .set('Accept', 'application/json')
        .set('User-Agent', 'GitBot')
        .then(results => {
          var repos = []
          for(var repo in results.body) {
            repos.push(results.body[repo].name);
          }
          
          // list all repositories for user to select
          res.render('repos.html', {data:repos, user:result.user});
        })
        .catch(err => {
          console.log(err);
        });
    }, function(err) {
      console.log(err); // Error: "It broke"
    });
  });
};