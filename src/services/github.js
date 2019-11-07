const Octokit = require('@octokit/rest');
const _ = require('lodash');
const { getLabels } = require('./ml');

const octokit = new Octokit({
  auth: process.env.GITHUB_BOT_TOKEN,
});

exports.addIssueLabel = async (payload) => {
  const labels = await getLabels(payload.issue.body, payload.issue.title);
  const labelsToApply = Object.keys(labels).sort((a, b) => labels[b] - labels[a]).slice(0, 1);
  this.addLabel(payload.repository.owner.login, payload.repository.name, payload.issue.number, labelsToApply);
  return labelsToApply;
};

exports.addLabel = async (owner, repo, issueNumber, labelsToApply) => {
  octokit.issues.addLabels({
    owner,
    repo,
    issue_number: issueNumber,
    labels: labelsToApply,
  });
};

exports.deleteComment = (payload) => {
  const obj = _.pick(payload, ['owner', 'repo', 'comment_id']);
  return octokit.issues.deleteComment({
    ...obj,
  });
};

exports.addPRLabel = async (payload) => {
  const labels = await getLabels(payload.pull_request.body, payload.pull_request.title);
  const labelsToApply = Object.keys(labels).sort((a, b) => labels[b] - labels[a]).slice(0, 1);
  octokit.issues.addLabels({
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    issue_number: payload.pull_request.number,
    labels: labelsToApply,
  });
};
