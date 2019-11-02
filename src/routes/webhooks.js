const DBManager = require('../services/db.js');
const { createWebHook, deleteWebHook, addCollaborator, deleteCollaborator, addLabel, deleteLabel, acceptInvite } = require('../services/helper.js');

Array.prototype.diff = function(a) {
  return this.filter((i) => { return a.indexOf(i) < 0; });
};

// helper function to fetch the access token of a user from DB
async function fetchAccessToken(usr) {
  return new Promise((resolve, reject) => {
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
};

// helper function to fetch the current list of monitred repositories of a user from DB
async function fetchCurrentRepositories(usr) {
  return new Promise((resolve, reject) => {
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
};

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
      }, newValues, (err, res) => {
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
  } catch (err) {
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
    const tokn = process.env.GITHUB_BOT_TOKEN;
    for (let k = 0; k < invitesList.length; k++) {
      acceptInvite(tokn, invitesList[k])
        .catch((err) => {
          console.log(err);
        });
    };
   
    // update db
    updateUserRepos(user, finalReposList).then((result) => {
      console.log('User repos updated successfully');
      res.send('<!DOCTYPE html> <html><head> </head><body> <h1>Repositories successfully added to the monitoring list!</h1> </body></html>');
    });
  });
};