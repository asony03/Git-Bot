# CSC510-24

**Problem Statement**

Github is a wonderful piece of software and very easy to use, however there are some concerns not solved by git out of the box. We have identified and outlined the following problems and plan on solving them.

* Git doesn't know its users and there is no way to moderate the comments made by them. Often times, mainly in the case of large open source projects, there might be toxic contributors and there is no way to track them. Therefore, there is a need to identify and control toxic content.
* Labels are very useful when it comes to managing and prioritzing issues. Currently git doesn't offer a way to automatically asssign labels. In the case of large project with hundreds of issues, there would be definitely a need to identify the nature of the issues and label and categorize them accordingly.

**Bot Description**

Our bot tries to do the following to address these problems
* Listens to comments on repos in which the bot is installed. When a new user comments, the bot fetches public comments of this user and run sentiment analyser on them and then based on the results, the bot concludes whether that user is of hostile background and an issue is opened for this user in maintainers-discussion private repo so that the maintainers can review these toxic comments.
* Scans the content of pull requests and issues in a timely manner and censor/mark them appropriately.
* Use NLP techniques to label issues based on the nature of its title and body against a set of predefined labels. Based on the sentiments, it also assigns a priority level to the issue.

A bot is a good solution for this because the tasks that we deal with are repetitive and need to run constantly in the background. Our bot does these tasks by listening to respective github events. Also, this bot has the characteristics of a AI bot as this bot does automated learning and data analysis.

Tag line: "Boost up your git"

**Use Cases**

Use case: Keep track of toxic comments in issues and pull reqs and report the user whent they cross a particular threshold.
* Preconditions
  The bot needs to have access to the repository.
* Main Flow
  Users comment on issues and pull requests. The bot monitors these comments for toxicity.

Use case: Identify inaapropriate/offensive content in pull requests and issues body/title and tag them accordingly.
* Preconditions
  The bot needs to have access to the repository.
* Main Flow
  Pull requests or issues are raised with inappropriate or offensive content in them. The bot identifies it and tags it.
  
Use case: Automaticaly label unlabelled issues against a set of predefined labels, such as bug, enhancement etc as and when they are raised.
* Preconditions:
  - The bot needs to have access to the repository.
* Main Flow:
  - An issue is raised without labels[S1]. The bot labels the issue as a bug, enhancement, feature etc [S2].
* SubFlows:
  - [S1]. An issue is raised without labels. 
  - [S2]. The bot identifies the type of the issue and labels it as a bug, enhancement, feature etc.

Use case: Automatically assign a priority level to the issue, such as requires immediate attention etc.
* Preconditions:
  - The bot needs to have access to the repository.
* Main Flow:
  - An issue will be raised [S1]. The bot uses NLP techniques and analyzes the context of the issue [S2] and assigns a priority level [S3].
* Subflows:
  - [S1]. An issue will be raised. 
  - [S2]. The bot uses NLP techniques to and analyzes the context of the issue
  - [S3]. Assign a priority level

