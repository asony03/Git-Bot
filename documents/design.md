## Problem Statement:

Github is one of the most popular source control and project management website in the world. However, there are some concerns not solved by Github out of the box. We have identified and outlined such problems and plan on solving them as explained in the subsequent sections.

* Currently there is no way to automatically moderate user comments. In case of large open source projects, incidents of comment sections being misused for other form of communications have increased, which has led to more individual time being spent in moderating such repositories. There is a pressing need to monitor and control inappropriate content posted by users.

* Labels are very useful when it comes to managing and prioritzing Github issues. In the case of large open source projects with hundreds of new issues pouring in daily, there is a need to identify the nature/severity of the issues and label/categorize them accordingly. This will provide for effective prioritization, delegation and visibility.

<br />

## Bot Description:

Our bot tackles these problems in following ways:

* Monitors the incoming comments on a repository: When a user writes a comment, the bot runs sentiment analysis on it and decides whether that comment is toxic or inappropriate. If it is found to be inappropriate and that user crosses his/her threshold, an email is sent to the admin of the repo with a report of the user's comments.

* Monitors the content of Issues and PRs: Scans the content of Pull requests and Issues as an when they are created and tags them appropriately.

* Automatic labelling of Issues: Uses ML to best classify/label issues based on their content against a set of predefined labels. Further, based on the keywords, it tries to assigns a best suited priority level to the issue.

A bot reduces human intervention in these cases and avoids repetitive work needed by the repo admin. Our bot performs these tasks by listening to respective github events. Also, this bot has the characteristics of an AI bot as this involves automated learning and data analysis.

  **Tag line: "Boost up your git"**

<br />

## Use Cases:

```
Use case: Keep track of toxic comments in issues and PRs and report the user when they cross a particular threshold.
* Preconditions:
  - The bot needs to have access to the repository.
* Main Flow:
  - Users comment on issues and pull requests. The bot monitors these comments for toxicity.
* Subflows:
  - [S1]. A user comments on issues and/or pull requests.
  - [S2]. The bot analyzes these comments for toxicity.
  - [S3]. If the comments are found to be toxic, the bot checks whether the user has crossed the threshold for toxicity.
  - [S4]. If the user has crossed the threshold, the bot reports the user (along with the comments) via email.
* Alternate Flows:
  - [AF1]. The bot identifies the comments as non toxic. 
  - [AF2]. The bot does nothing.
```
```
Use case: Identify inaapropriate/offensive content in pull requests and issues body/title and tag them accordingly.
* Preconditions:
  - The bot needs to have access to the repository.
* Main Flow:
  - Pull requests or issues are raised with inappropriate or offensive content in them. The bot identifies it and tags it.
* Subflows:
  - [S1]. A user creates a pull request or issue with inappropriate or offensive content in the body/title.
  - [S2]. The bot analyzes the content for toxicity.
  - [S3]. If the content is found to be toxic, the bot flags the pull request/issue.
* Alternate Flows:
  - [AF1]. The content is not found to be inappropriate.
  - [AF2]. The bot does nothing.
```
``` 
Use case: Automaticaly label unlabelled issues against a set of predefined labels, such as bug, enhancement etc as and when they are raised.
* Preconditions:
  - The bot needs to have access to the repository.
* Main Flow:
  - An issue is raised without labels[S1]. The bot labels the issue as a bug, enhancement, feature etc [S2].
* SubFlows:
  - [S1]. An issue is raised without labels. 
  - [S2]. The bot identifies the type of the issue and labels it as a bug, enhancement, feature etc.
```
```
Use case: Automatically assign a priority level to the issue, such as requires immediate attention etc.
* Preconditions:
  - The bot needs to have access to the repository.
* Main Flow:
  - An issue will be raised [S1]. The bot uses NLP techniques and analyzes the context of the issue [S2] and assigns a priority level [S3].
* Subflows:
  - [S1]. An issue will be raised. 
  - [S2]. The bot uses NLP techniques to and analyzes the context of the issue
  - [S3]. Assign a priority level
``` 
<br />

## Design Sketches:

### 1. Storyboards

![Sb1](https://github.ncsu.edu/csc510-fall2019/CSC510-24/blob/master/images/Story%20Board%201.PNG)

![Sb2](https://github.ncsu.edu/csc510-fall2019/CSC510-24/blob/master/images/Story%20Board%202.PNG)

![Sb3](https://github.ncsu.edu/csc510-fall2019/CSC510-24/blob/master/images/Story%20Board%203.PNG)

![Sb4](https://github.ncsu.edu/csc510-fall2019/CSC510-24/blob/master/images/Story%20Board%204.PNG)

### 2. Wireframes 

Our bot works in the background and creates labels/comments in github. Bot also sends email to the maintainers and both of these scenarios are presented below.

 #### Email wireframe:

![W1](https://github.ncsu.edu/csc510-fall2019/CSC510-24/blob/master/images/email%20wireframe.png)

 #### Label wireframe:

![W2](https://github.ncsu.edu/csc510-fall2019/CSC510-24/blob/master/images/label%20wireframe.PNG)

<br />

## Architecture Design and Design Patterns

![Arch Dagram](https://github.ncsu.edu/csc510-fall2019/CSC510-24/blob/master/images/arch_diagram.png)

### Components

- **Github** : We are using Github's platform to integrate our bot with. Bot will read the data using Github API's for issues and comments and process the data accordingly. It will assign labels for issues and pull requests and notifies admin about the  toxic behavior of users.

- **Server** : This is a Node.js server which will listen to the incoming events and perform actions. It will communicate with AWS services which will provide the ML functonalities.

- **Database** : This is a Mongo database hosted in AWS, used to store users and their repositories monitored by out Bot.

- **ML Services** : We are planning to have 1 service with 2 ML APIs. One for toxicity detection, and another to generate labels (issue type and priority level).

- **Slack** : We integrate with Slack and use it to notify repo admins about different GitHub events, and also trigger admin actions on GitHub repositories through Slack messaging.


This is an event-driven architecture as it consists of event producers that generate a stream of events and event consumers that listen for the events.

<p align="center">
<img alt="logo" src="https://github.ncsu.edu/csc510-fall2019/CSC510-24/blob/master/images/Event%20driven%20architecture.PNG">
</p>

In our case, Events are triggered by Github, and the bot gets notified. Event handlers of our bot would consume these events as they occur and trigger some actions or perform necessary activities based on the event. Producers are decoupled from consumers and would go hand-in-hand with the observer pattern.

### Publishers + Subscribers = Observer Pattern:

The observer pattern is a software design pattern in which an object, called the subject (git repo in our case), maintains a list of its dependents, called observers (listeners for issues, PRs and comments in our case), and notifies them automatically of any state changes.

<p align="center">
<img alt="logo" src="https://github.ncsu.edu/csc510-fall2019/CSC510-24/blob/master/images/Observer%20pattern.png">
</p>

### Observer pattern and Facade pattern in action:

Facade pattern hides the complexities of the system and provides an interface to the client using which the client can access the sub systems. In our system, thie dispatcher adds an interface to existing system to hide the complexities of its sub systems. Dispatcher is responsible for providing a single entry point with simplified methods required by clients, and delegates these calls to the respective handlers.

<p align="center">
<img alt="logo" src="https://github.ncsu.edu/csc510-fall2019/CSC510-24/blob/master/images/facade%20patter.jpg">
</p>
