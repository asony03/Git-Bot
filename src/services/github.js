const Octokit = require('@octokit/rest');
const _ = require('lodash');

const octokit = new Octokit({
  auth: process.env.GITHUB_BOT_TOKEN,
});

exports.addIssueLabel = (payload) => octokit.issues.addLabels({
  owner: payload.repository.owner.login,
  repo: payload.repository.name,
  issue_number: payload.issue.number,
  labels: ['bug', 'enhancement'],
});

exports.deleteComment = (payload) => {
  const obj = _.pick(payload, ['owner', 'repo', 'comment_id']);
  return octokit.issues.deleteComment({
    ...obj,
  });
};
