const Octokit = require('@octokit/rest');
const _ = require('lodash');
const { getLabels } = require('./ml');

const octokit = new Octokit({
  auth: process.env.GITHUB_BOT_TOKEN,
});

exports.addIssueLabel = async (payload) => {
  const labels = await getLabels(payload.issue.body);
  const labelsToApply = Object.keys(labels).sort((a, b) => labels[b] - labels[a]).slice(0, 2);
  octokit.issues.addLabels({
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    issue_number: payload.issue.number,
    labels: labelsToApply,
  });
  return labelsToApply;
};

exports.deleteComment = (payload) => {
  const obj = _.pick(payload, ['owner', 'repo', 'comment_id']);
  return octokit.issues.deleteComment({
    ...obj,
  });
};

exports.addPRLabel = async (payload) => {
  const labels = await getLabels(payload.pull_request.body);
  const labelsToApply = Object.keys(labels).sort((a, b) => labels[b] - labels[a]).slice(0, 2);
  octokit.issues.addLabels({
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    issue_number: payload.pull_request.number,
    labels: labelsToApply,
  });
};
