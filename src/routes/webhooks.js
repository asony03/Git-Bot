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
    let invitation_id;
    await fetchAccessToken(user).then((token) => {
      accessToken = token;
    });

    // create webhooks
    const finalReposList = [];
    for (var i = 0; i < repositories.length; i++) {
      let reposit = repositories[i];
      createWebHook(user, reposit, accessToken)
      .then(output => addCollaborator(user, reposit, accessToken))
      .then(output => { 
        invitation_id = output.id;
        addLabel(user, reposit, accessToken, "Priority: High", "E00201", "High Priority") 
      })
      .then(output => addLabel(user, reposit, accessToken, "Priority: Medium", "FF9933", "Medium Priority"))
      .then(output => addLabel(user, reposit, accessToken, "Priority: Low", "FFFC00", "Low Priority"))
      .then(output => {
        finalReposList.push(reposit);
        // update DB
        updateUserRepos(user, finalReposList).then((result) => {
        console.log('User repos updated successfully');
        res.send('<!DOCTYPE html> <html><head> </head><body> <h1>Repositories successfully added to the monitoring list!</h1> </body></html>');
        });
        let tokn = process.env.GITHUB_ACCOUNT_BOT_TOKEN;
        acceptInvite("Git-Bot-Luna", tokn, invitation_id).then(res => {
          console.log(res);
        })
        .catch(err => {
          console.log(err);
        });

      })
      .catch(err => {
        console.log(err);
        console.log(`Process failed: need to try setting up the repositories again`);
      });
    };
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
        url: `http://localhost:8090/webhook`,
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


// add bot as collaborator
const addCollaborator = (user, repo, access_token) => new Promise((resolve, reject) => {
  request
    .put(`https://api.github.com/repos/${user}/${repo}/collaborators/Git-Bot-Luna`)
    .send({
      'permission': 'admin'
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

// add label to the repository
const addLabel = (user, repo, access_token, name, color, description) => new Promise((resolve, reject) => {
  request
    .post(`https://api.github.com/repos/${user}/${repo}/labels`)
    .send({
      "name": name,
      "description": description,
      "color": color
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

// accept collaborator invitation
const acceptInvite = (user, access_token, id) => new Promise((resolve, reject) => {
  request
    .patch(`https://api.github.com/${user}/repository_invitations/${id}`)
    .set('Authorization', `token ${access_token}`)
    .set('Cache-Control', 'no-cache')
    .set('Accept', 'application/json')
    .set('User-Agent', 'GitBot')
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
