# Acceptance tests:

## TA Account Details :

### GitHub:
  
  * GitHub Username : TA_CSC510
  * GitHub Password: Pa$$word@1234
  
### Slack:

  * Slack WorkSpace: csc510ncsu.slack.com
  * Slack Username : ta.csc510ncsu@gmail.com
  * Slack Password : Pa$$word@1234

## How to add your repositories to the monitoring list of GitBot?

1. Access the application using its URL. (Hosted Url : -- todo)

2. Authorize the GitBot for the given TA Github Account.

3. Select the repositories to be monitored by GitBot and submit (follow the same steps to update your list at any time later)

4. Slack Bot is already installed in the provided account. Use the given slack credentials to login to the registered workspace and monitor your repositories. 

## Git tasks:

| Test Case | Scenario |Current State<br>(Preconditions) |     Actions   | Expected Result |
| ----------| -------- | ------------------------------- | ------------- | --------------- |
| Label GitHub Issues - **Non-Buggy case** | As a user, when I create a new issue in my repo, the issue should be appropriately labelled with one of the default labels provided by GitHub | <br>**The user has already added his/her repository to the monitoring list of GitBot** <br> <br><ol> <li>Webhooks for new issues is set in the repo </li><li>The bot is added as a collaborator in the repo</li> <li> Bot is listening to incoming events from GitHub repo </li></ol>| User creates an issue without labels | The issue should be appropriately labelled by GitBot |
| Label GitHub Issues - **Buggy case** | As a repo user, when I create a new issue of type bug in my repo, the issue should be appropriately tagged with "bug" label, and the repo admin should be notified and given an option to assign a priority to that bug through slack | The admin has already added his/her repository to the monitoring list of GitBot, and has also given access to his/her slack channel | User creates an issue of type bug without assigning any labels to it | <ol><li> The Bot assigns "bug" label to the issue and notifies the repo admin about the same by posting a slack message in his/her channel and gives an option to assign a priority to that issue </li> <li> If the admin selects one option from the given list of priority labels, then the issue should be tagged with this priority </li></ol> |
| Handle comments in issues and/or pull requests - **Toxic case** |As a repo user, when I post a toxic comment on an issue and/or pull request, the repo admin should be notified and given an option to delete that comment through slack | The admin has already added his/her repository to the monitoring list of GitBot, and has also given access to his/her slack channel | Repo user posts a toxic comment on an issue and/or pull request |  <ol><li> The Bot notifies the repo admin by posting a slack message in his/her channel and gives an option to delete that comment </li> <li> If the admin selects delete comment option, then the toxic comment should be deleted from the respective issue and/or pull request </li></ol> |
| Handle comments in issues and/or pull requests - **Non-Toxic case** | As a repo user, when I post a non-toxic comment on an issue and/or pull request, it should pass bot's toxicity test and remain as it is with its issue/pull request | The admin has already added his/her repository to the monitoring list of GitBot, and has also given access to his/her slack channel | Repo user posts a non-toxic comment on an issue and/or pull request | **No Action** |
| Manage new issues and/or pull requests - **Inappropriate content** |As a repo user, when I create an issue or pull request with inappropriate/offensive content, it should be tagged as inappropriate | The admin has already added his/her repository to the monitoring list of GitBot | Repo user creates an issue and/or pull request with inappropriate content |  The issue and/or pull request should be tagged as inappropriate |
| Manage new issues and/or pull requests - **Appropriate content** | As a repo user, when I create an issue or pull request with clean content, it should not be tagged with any labels | The admin has already added his/her repository to the monitoring list of GitBot | Repo user creates an issue and/or pull request with appropriate content | **No Action** | 
