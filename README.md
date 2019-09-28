# CSC510-24

**Problem Statement:**

Github is a wonderful piece of software and very easy to use. However, there are some concerns not solved by git out of the box. We have identified and outlined the following problems and plan on solving them as explained in the subsequent sections.

* Git doesn't know its users and there is no way to moderate the comments made by them. Often times, mainly in the case of large open source projects, incidents of comment sections being misused are increasing and there is no way to track them. Therefore, there is a pressing need to monitor and control inappropriate content posted by users.
* Labels are very useful when it comes to managing and prioritzing Git issues. Currently, git doesn't offer a way to automatically asssign labels. In the case of large projects with hundreds of issues, there would definitely be a need to identify the nature of the issues and label/categorize them accordingly. If the issues are labelled correctly, it would provide for effective prioritization, delegation and visibility.

<br />

**Bot Description:**

Our bot tries to do the following to address these problems:
* Monitors the comments on a repository: When a user comments, the bot runs sentiment analysis on the content and then based on the results, the bot decides whether that content is inappropriate or not. If it is found to be inappropriate and that user crosessed his or her threshold, an email is send to the maintainer/admin of the repository with a report of the user's comments.
* Monitors the content of Issues and Pull Requests: Scans the content of Pull requests and Issues as an when they are created and tags them appropriately.
* Automatic labelling of Issues: Uses NLP techniques to label issues based on its content against a set of predefined labels. Further, based on the sentiments, it also assigns a priority level to the issue.

A bot is a good solution for this because the tasks that we deal with are repetitive and need to run constantly in the background. Our bot does these tasks by listening to their respective github events. Also, this bot has the characteristics of an AI bot as this involves automated learning and data analysis.

  **Tag line: "Boost up your git"**

<br />

**Use Cases:**

Use case: Keep track of toxic comments in issues and pull reqs and report the user whent they cross a particular threshold.
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
 
<br />

**Design Sketches:**

1. **Storyboards:**

![Sb1](https://github.ncsu.edu/csc510-fall2019/CSC510-24/blob/master/images/Story%20Board%201.PNG)

![Sb2](https://github.ncsu.edu/csc510-fall2019/CSC510-24/blob/master/images/Story%20Board%202.PNG)

![Sb3](https://github.ncsu.edu/csc510-fall2019/CSC510-24/blob/master/images/Story%20Board%203.PNG)

![Sb4](https://github.ncsu.edu/csc510-fall2019/CSC510-24/blob/master/images/Story%20Board%204.PNG)

2. **Wireframes:** Our bot mainly works in the background and shows output on the Git UI itself. However, we are attaching two images which shows how the email would look like and a sample of how an output on the GIT UI for a inappropriate issue would look like respectively.

 - Email wireframe:

![W1](https://github.ncsu.edu/csc510-fall2019/CSC510-24/blob/master/images/email%20wireframe.png)

 - Label wireframe:

![W2](https://github.ncsu.edu/csc510-fall2019/CSC510-24/blob/master/images/label%20wireframe.PNG)

<br />

**Architecture Design and Design Patterns:**
![Arch Dagram](https://github.ncsu.edu/csc510-fall2019/CSC510-24/blob/master/images/arch_diagram.png)


This is an event-driven architecture as it consists of event producers that generate a stream of events and event consumers that listen for the events.

![event_driven](https://github.ncsu.edu/csc510-fall2019/CSC510-24/blob/master/images/Event%20driven%20architecture.PNG)

In our case, Events are triggered by Git, and the Bot gets notified. Event handlers of our bot would consume these events as they occur and trigger some actions or perform necessary activities based on the event. Producers are decoupled from consumers and would go hand-in-hand with the observer pattern.

* **Publishers + Subscribers = Observer Pattern:**

The observer pattern is a software design pattern in which an object, called the subject (git repo in our case), maintains a list of its dependents, called observers, and notifies them automatically of any state changes.

![observer pattern](https://github.ncsu.edu/csc510-fall2019/CSC510-24/blob/master/images/Observer%20pattern.png)

* **Observer pattern and Facade pattern in action:**

Facade pattern hides the complexities of the system and provides an interface to the client using which the client can access the sub systems. This pattern adds an interface to existing system to hide its complexities. It also involves a single entry point which provides simplified methods required by client and delegates calls to the respective handlers.

![facade](https://github.ncsu.edu/csc510-fall2019/CSC510-24/blob/master/images/facade%20patter.jpg)




  


