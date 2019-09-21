# CSC510-24

**Problem Statement**

Github is a wonderful piece of software and very easy to use, but, there are still a lot of administrative tasks that users do repeatedly. For example deleting a branch once it is merged, closing state branches etc. As the repositoy gets bigger and complex, leaving these tasks to the repo users affects their productivity or risk the case of nobody taking the responsibilty. Thus there would be a need for a dedicated person to perform all these administrative tasks, leading to increased cost. We intend to make the git experience much more simpler to the users and reduce cost by automating these redundant tasks.

**Bot Description**

Our bot tries to automate the following tasks on github:
* Deleting a branch once it is merged
* Create new branches from issues
* Run tests when commits are pushed to feature branches and send notification on the slack channel
* Deploy application when commits happen on the master branch
* Close stale branches and pull requests based on a message from the slack channel
* Weekly automated summary of activity on the repository
* Assign reviewers to pull requests based on history

A bot is a good solution for this because the tasks that we deal with are repetitive, which makes it an ideal candidate for automation. Our bot does some of these tasks when prompted by an user by sending messages to the bot, and other tasks are triggerred by their respective github events. Also, this bot has the characteristics of a focus bot as this bot tries to increase developer's productivity.

Tag line: "Boost up your git"
