# Bot Milestone

## Usecase Refinement

### Changes Made:

- Instead of maintaining a database with toxic comments posted by each user, we are now alerting the repo admins about the comments in real time (as and when the comment is created). 
- Admins have the option to delete inappropriate comments directly from slack as the bot creates an **interactive message** instead of just notifying the user.
- Updated the preconditions with all the integrations we have done to implement the usecases.
- Changed priority detections use case :
  - The bot will now post a message to slack when an issue containing **bug** is detected.
  - Admins can assign a priority to such issues directly from the slack message.

### Updated usecases:
#### 1
``` 
Use case: Automaticaly label new issues with one of the default labels provided by Github
* Preconditions:
  - Webhooks for new issues should be set in the repo
  - Bot should be listening for incoming hooks
  - The bot must be a collaborator in the repository
* Main Flow:
  - An issue is raised without labels[S1]. The bot analyzes the content and labels the issue [S2]
* SubFlows:
  - [S1] An issue is raised
  - [S2] Bot calls the ML service to determine a most suited label for the issue
  - [S2] Bot applies the label the issue using github API
```
#### 2
```
Use case: Alert repo admins using slack message when a toxic comment is posted in an issue or a pull request
* Preconditions:
  - Webhooks for comments must be setup in the repository
  - Bot must be listening to the webhooks
  - Bot must have access to slack group and channel
* Main Flow:
  - Users comment on issues and/or pull requests. The bot analyzes the comments and posts message on slack if the comment is toxic
* Subflows:
  - [S1] A user comments on issues and/or pull requests
  - [S2] The bot analyzes these comments for toxicity
  - [S3] If toxicity is detected, slacks posts a message on slack channel alerting the admin with an option to delete the comment
  - [S4] Admin can delete the comment directly from the slack message
* Alternate Flows:
  - [AF1] The bot identifies the comments as non toxic
  - [AF2] The bot does nothing
```
#### 3
```
Use case: Identify inaapropriate/offensive content in pull requests and issues body/title and tag them accordingly
* Preconditions:
  - Webhooks for new issues should be set in the repo
  - Bot must be listening to the webooks
  - Bot needs to have access to the repository
* Main Flow:
  - Pull requests or issues are raised with inappropriate or offensive content in them. The bot identifies it and tags it
* Subflows:
  - [S1] A user creates a pull request or issue with inappropriate or offensive content in the body/title
  - [S2] The bot analyzes the content for toxicity
  - [S3] If the content is found to be toxic, the bot flags the pull request/issue
* Alternate Flows:
  - [AF1] Toxicity is not detected
  - [AF2] The bot does nothing
```
#### 4
```
Use case: Alert admins when a bug is detected and let them assign a priority to the issue directly from the slack message
* Preconditions:
  - Webhooks for new issues should be set in the repo
  - Bot must be listening to the webooks
  - Bot needs to have access to the repository
  - Bot must be able to communincate in slack
* Main Flow:
  - An issue will be raised [S1]. The bot uses NLP techniques and analyzes the context of the issue [S2] and if a bug is found alert the admins [S3]
* Subflows:
  - [S1] An issue will be raised
  - [S2] The bot uses NLP techniques to and analyzes the context of the issue
  - [S3] Issue is found to be a bug send a message in slack with option to assign priority
* Alternate Flows:
 - [AF1] Bug is not detected
 - [AF2] The bot does nothing
``` 
<br />
