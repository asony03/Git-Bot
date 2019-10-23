const request = require('superagent');
const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;

// callback handler
module.exports = (app) => {
  app.get('/auth/callback', async (req, res, next) => {

    const { query } =  req;
    const { code } =  query;

    if(!code) {
      return res.send({
        success: false,
        message: 'Error: No Code'
      });
    }
    // use code to get the access token
    await getAccessToken(code).then(async (result) => {

      console.log(result); // "Stuff worked!"

      result.repos = [];
      // add/update the access token
      await addOrUpdateUserEntry(result).then(res => {
        console.log("success");
      })
      .catch(err => {
        console.log(err);
      });
      
      // fetch all repos of the user
      request
      .get(`https://api.github.com/user/repos?visibility=all`)
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
        res.render('repos.html', {data:repos, user:user_data.user});
      })
      .catch(err => {
        console.log(err);
      });
    }, function(err) {
      console.log(err); // Error: "It broke"
    });
  });
};

// update user's repositories list
var addOrUpdateUserEntry = (result) => {

  return new Promise((resolve, reject) => {

    mongoClient.connect(process.env.DATABASE_URL, function(err, db) {

      if(err) reject(err);

      db.collection('users')
      .find({user: result.user}).limit(1).next(function(err, res) {
        if(res == null) {
          db.collection('users').insert(result, function(err, res) {
            err ? reject(err) : resolve(res);
          });

        } else {

          var newValues = { $set: {access_token: result.access_token } };
          db.collection('users').updateOne({user: result.user}, newValues, function(err, res) {
            err ? reject(err) : resolve(res);
          });
        }
      });
    });    
  });
};

// 2 - way handshake -> pass code to get the access token
var getAccessToken = (code) => {

  user_data = {};
  return new Promise(function(resolve, reject) {
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
    .then(result => {
      user_data.access_token = result.body.access_token;
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
};
