const request = require('superagent');
const async = require('async');
const DBManager = require('./db.js');

// creates webhooks using "user", "repo" and "access_token" values
exports.createWebHook = async (user, repo, accessToken) => new Promise((resolve, reject) => {
  request
    .post(`https://api.github.com/repos/${user}/${repo}/hooks`)
    .send({
      name: 'web',
      active: true,
      events: [
        'issues',
        'pull_request',
        'issue_comment',
        'pull_request_review',
        'pull_request_review_comment',
      ],
      config: {
	url: process.env.CREATE_WEBHOOK_URL,
	secret: process.env.GITHUB_WEBHOOK_SECRET,
        content_type: 'json',
        insecure_ssl: '0',
      },
    })
    .set('Authorization', `token ${accessToken}`)
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

// creates webhooks using "user", "repo" and "access_token" values
const listWebHooks = (user, repo, accessToken) => new Promise((resolve, reject) => {
  request
    .get(`https://api.github.com/repos/${user}/${repo}/hooks`)
    .set('Authorization', `token ${accessToken}`)
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

// creates webhooks using "user", "repo" and "access_token" values
exports.deleteWebHook = (user, repo, accessToken) => new Promise((resolve, reject) => {
  async.waterfall([
    (callback) => {
      listWebHooks(user, repo, accessToken)
        .then((res) => {
          for (const hook in res) {
            if (res[hook].name == 'web') {
              callback(null, res[hook].id);
            }
          }
        });
    },
    (hookId, callback) => {
      request
        .del(`https://api.github.com/repos/${user}/${repo}/hooks/${hookId}`)
        .set('Authorization', `token ${accessToken}`)
        .set('Cache-Control', 'no-cache')
        .set('Accept', 'application/json')
        .set('User-Agent', 'GitBot')
        .then((result) => {
          callback(null, result);
        });
    }
  ], (err, _) => {
    if (err) {
      console.log('error in deleting webhook');
      reject();
    } else {
      resolve();
    }
  });
});

// add bot as a collaborator
exports.addCollaborator = async (user, repo, accessToken) => new Promise((resolve, reject) => {
  request
    .put(`https://api.github.com/repos/${user}/${repo}/collaborators/luna-gitbot`)
    .send({
      permission: 'admin'
    })
    .set('Authorization', `token ${accessToken}`)
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

// delete bot as a collaborator
exports.deleteCollaborator = async (user, repo, accessToken) => new Promise((resolve, reject) => {
  request
    .del(`https://api.github.com/repos/${user}/${repo}/collaborators/luna-gitbot`)
    .set('Authorization', `token ${accessToken}`)
    .set('Cache-Control', 'no-cache')
    .set('Accept', 'application/json')
    .set('User-Agent', 'GitBot')
    .then((result) => {
      resolve(result.body);
    })
    .catch((err) => {
      reject(err);
      console.log(err);
    });
});

// add label to the repository
exports.addLabel = async (user, repo, accessToken, labelName, colr, desc) => new Promise((resolve, reject) => {
  request
    .post(`https://api.github.com/repos/${user}/${repo}/labels`)
    .send({
      name: labelName,
      description: desc,
      color: colr
    })
    .set('Authorization', `token ${accessToken}`)
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

// delete a label from the repository
exports.deleteLabel = async (user, repo, accessToken, name) => new Promise((resolve, reject) => {
  request
    .del(`https://api.github.com/repos/${user}/${repo}/labels/${name}`)
    .set('Authorization', `token ${accessToken}`)
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

// accept collaborator invitation
exports.acceptInvite = async (accessToken, id) => new Promise((resolve, reject) => {
  request
    .patch(`https://api.github.com/user/repository_invitations/${id}`)
    .set('Authorization', `token ${accessToken}`)
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
exports.fetchAccessToken = async (usr) => new Promise((resolve, reject) => {
  DBManager.getDB().then((db) => {
    db.collection('users')
      .find({
        user: usr
      }).limit(1).next((error, res) => {
        if (res == null || (error)) {
          reject("token entry not found for " + usr);
        } else {
          resolve(res.access_token);
        }
      });
  });
});

// helper function to fetch the current list of monitred repositories of a user from DB
exports.fetchCurrentRepositories = async (usr) => new Promise((resolve, reject) => {
  DBManager.getDB().then((db) => {
    db.collection('users')
      .find({
        user: usr
      }).limit(1).next((err, res) => {
        if (res == null || (err)) {
          reject('User found: ' + usr);
        } else {
          resolve(res.repos);
        }
      });
  });
});

// update user's repositories list
exports.updateUserRepos = async (usr, repositories) => new Promise((resolve, reject) => {
  DBManager.getDB().then((db) => {
    const newValues = {
      $set: {
        repos: repositories
      }
    };
    db.collection('users').updateOne({
      user: usr
    }, newValues, (err, res) => {
      err ? reject(err) : resolve(res);
    });
  });
});