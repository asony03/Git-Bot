const request = require('superagent');
const async = require('async');

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
        url: 'http://localhost:8090/webhook',
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
    .put(`https://api.github.com/repos/${user}/${repo}/collaborators/Git-Bot-Luna`)
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
    .del(`https://api.github.com/repos/${user}/${repo}/collaborators/Git-Bot-Luna`)
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
