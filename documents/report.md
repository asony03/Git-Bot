# Report


## Problem Statement:

Github is one of the most popular source control and project management website in the world. However, there are some concerns not solved by Github out of the box such as:

* There is no way to automatically moderate user comments. In case of large open source projects, incidents of comment sections being misused for other form of communications have increased, which has led to more individual time being spent in moderating such repositories.

* Labels are very useful when it comes to managing and prioritzing tasks and issues on Github. In the case of large open source projects with hundreds of new issues pouring in daily, there is a need to identify the nature/severity of the issues and label/categorize them accordingly.

## Primary features and screenshots:

Gitbot provides 4 major use cases:
* Automatically label new issues and PRs 

![](https://github.ncsu.edu/csc510-fall2019/CSC510-24/blob/master/images/question.png)
![](https://github.ncsu.edu/csc510-fall2019/CSC510-24/blob/master/images/bug.png)
![](https://github.ncsu.edu/csc510-fall2019/CSC510-24/blob/master/images/feature_request.png)
![](https://github.ncsu.edu/csc510-fall2019/CSC510-24/blob/master/images/pr_label.png)

* If a "bug" is detected, send an alert in slack channel with the option to prioritize the issue

![](https://github.ncsu.edu/csc510-fall2019/CSC510-24/blob/master/images/slack_bug.png)
![](https://github.ncsu.edu/csc510-fall2019/CSC510-24/blob/master/images/slack_bug_prio.png)

* Monitor issues and PRs for toxic content and label them "inappropriate" if anything is detected
* Monitor comments in issues and PR and send an alert when toxicity is detected with an option to delete the comment

![](https://github.ncsu.edu/csc510-fall2019/CSC510-24/blob/master/images/slack_toxic_comment.png)
![](https://github.ncsu.edu/csc510-fall2019/CSC510-24/blob/master/images/slack_toxic_delete.png)

## Reflection:

- Going through various stages of development and following multiple SE principles was really helpful and decisive in how the project turned out.
  - Design : This phase helped us coming with a well thought out architecture which was extensible in its own regard. Since we already had a design in mind before coding the application, our code ended up cleaner and modularized.
  - Bot : By using test driven design and using the mocking technique, we were able to code the core logic for our appliccation without worrying about the external dependencies and services.
  - Process :  Since the application is developed in quick short iterations, we were able to respond quickly to changes in the design and expectations, ensuring that there were no surprises in the end. Everyone in the team had well defined and independent tasks which sped up the overall development process. Also it was much easier discussing the impediments everyone was facing and share knowledge during scrum meetings.
  - Deploy : Now that we have a running application, Acceptance testing and deployment phase helped us polish our app for production. 
 
- Overall it was a good practice applying these principles in a school project and we feel it will be helpful during our jobs in the industry
 

## Limitations and Future Work

Here is the list of enchancements we can do:

- For our appliaction to run currently, A user needs to create a bot in their slack channel and point it to our server. This can be mitigated if we can publish an app in slack marketplace which can then be installed by the users in their slack channel.
- Similarly we are using a github user account to act as a bot. When a user starts monitoring his repository we add this bot account as a collaborator in his repo. This is not feasible in large scale and is also a security risk in case the bot account gets compromised. this can be avoided by publishing an app in github marketplace which can then be installed by users in their respective repositories.
- We are currently running 2 independent servers (Node.js and Python) inside our machine, which communicate with each other for issue classification task. Instead of running the 2nd Python server we can user services such as Google Auto ML or AWS Sagemaker/Lambda to host the ML model. This will help us ease out the depolyment process and remove the coupling between the 2 servers.
- There is also scope of collecting feedback from the users regarding the ML results and use them to further improve our model using reinforcement learning. This can be done by making the user assign an emoji to the comment when the bot labels an issue and storing it in a DB. Every once in a while we can use this data to re-train and deploy the model. This way our bot will improve as more and more users are using it.
