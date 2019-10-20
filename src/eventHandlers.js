const Octokit = require("@octokit/rest");

const octokit = new Octokit({
  auth: process.env.GITHUB_BOT_TOKEN,
});

const { sendSlackMessage } = require('./slack');

exports.issueCommentHandler = (event) => {
  // Only handle the created event, reject others.
  if (!event.action === 'created') {
    return;
  }

  (async () => {
    await sendSlackMessage(event.payload);
  })();
};

exports.issuesHandler = (event) => {
  if (!event.payload.action === 'opened') return;

  octokit.issues.addLabels({
    owner: event.payload.repository.owner.login,
    repo: event.payload.repository.name,
    issue_number: event.payload.issue.number,
    labels: ["bug", "enhancement"],
  });
};
