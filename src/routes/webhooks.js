const request = require('superagent');
const DBManager = require('../services/db.js');
const async = require('async');

Array.prototype.diff = function(a) {
  return this.filter((i) => { return a.indexOf(i) < 0; });
};

// creates webhooks using "user", "repo" and "access_token" values
async function createWebHook(user, repo, accessToken) {

  return new Promise((resolve, reject) => {
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
};

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
async function deleteWebHook(user, repo, accessToken) {

  return new Promise((resolve, reject) => {
    
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
};

// add bot as a collaborator
async function addCollaborator(user, repo, accessToken) {

  return new Promise((resolve, reject) => {
    request
      .put(`https://api.github.com/repos/${user}/${repo}/collaborators/Git-Bot-Luna`)
      .send({
        'permission': 'admin'
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
};

// delete bot as a collaborator
async function deleteCollaborator(user, repo, accessToken) {
  return new Promise((resolve, reject) => {
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
};

// add label to the repository
async function addLabel(user, repo, accessToken, labelName, colr, desc) {
  return new Promise((resolve, reject) => {
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
};

// delete a label from the repository
async function deleteLabel(user, repo, accessToken, name) {
  return new Promise((resolve, reject) => {
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
};

// accept collaborator invitation
async function acceptInvite(accessToken, id) {
  return new Promise((resolve, reject) => {
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
};


// helper function to fetch the access token of a user from DB
var fetchAccessToken = (usr) => new Promise((resolve, reject) => {
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
const fetchCurrentRepositories = (usr) => new Promise((resolve, reject) => {
  mongoClient.connect(process.env.DATABASE_URL, (error, db) => {
    if (error) reject(error);
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
async function updateUserRepos(usr, repositories) {
  return new Promise((resolve, reject) => {
    DBManager.getDB().then((db) => {
      const newValues = {
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
};

async function addRepository(user, reposit, accessToken) {   
  try {
    await createWebHook(user, reposit, accessToken );
    const op = await addCollaborator(user, reposit, accessToken);
    await addLabel(user, reposit, accessToken, "Priority: High", "E00201", "High Priority");
    await addLabel(user, reposit, accessToken, "Priority: Medium", "FF9933", "Medium Priority");
    await addLabel(user, reposit, accessToken, "Priority: Low", "FFFC00", "Low Priority");
    return op.id;
  } catch(err) {
    console.log("** Error occured while handling add repository for" + reposit + "**" + err + "**"); 
  };
};

async function deleteRepository(user, reposit, accessToken) {   
  try { 
    await deleteWebHook(user, reposit, accessToken);
    await deleteCollaborator(user, reposit, accessToken);
    await deleteLabel(user, reposit, accessToken, "Priority: High");
    await deleteLabel(user, reposit, accessToken, "Priority: Medium");
    await deleteLabel(user, reposit, accessToken, "Priority: Low");
  } catch (err) {
    console.log("** Error occured while handling delete repository for " + reposit + "**" + err + "**"); 
  };
};

module.exports = (app) => {
  // submit request is forwarded to this end point
  // create repo is triggered for each repository selected by the user
  app.post('/webhooks', async (req, res) => {

    const user = req.body.user;
    const repositories = [];
    
    // populate repositories list
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

    let monitoredRepositories;
    await fetchCurrentRepositories(user).then((repoList) => {
      monitoredRepositories = repoList;
    });

    const addList = repositories.diff(monitoredRepositories);
    const deleteList = monitoredRepositories.diff(repositories);    

    // create webhooks ..... etc
    const finalReposList = [];
    const invitesList = [];

    for (let i = 0; i < addList.length; i++) {
      const reposit = addList[i];
      const invId = await addRepository(user, reposit, accessToken);
      invitesList.push(invId);
      finalReposList.push(reposit);
    };

    // delete webhooks .... etc
    for (let i = 0; i < deleteList.length; i++) {
      const reposit = deleteList[i];
      await deleteRepository(user, reposit, accessToken);
    };

    // accept invites
    let tokn = process.env.GITHUB_BOT_TOKEN;
    for (let k = 0; k < invitesList.length; k++) {
      acceptInvite(tokn, invitesList[k])
        .catch((err) => {
          console.log(err);
        });
    };
   
    //update db
    updateUserRepos(user, finalReposList).then((result) => {
      console.log('User repos updated successfully');
      res.send('<!DOCTYPE html> <html><head> </head><body> <h1>Repositories successfully added to the monitoring list!</h1> </body></html>');
    });
  });
};