# CSC510-24

**Problem Statement**

Though github is a wonderful piece of software and very easy to use, there are a lot of tasks that users do repeatedly. For exmaple deleting a branch once it is merged. We want to make it much more simpler to the users by automating these redundant tasks.

**Bot Description**

Our bot tries to automate the following tasks on github:
* Deleting a branch once it is merged
* Create new branches from issues
* Run tests when commits are pushed to feature branches and send notification on the slack channel
* Deploy application when commits happen on the master branch
* Close stale branches and pull requests based on a message from the slack channel
* Weekly automated summary of activity on the repository
* Assign reviewers to pull requests based on history
