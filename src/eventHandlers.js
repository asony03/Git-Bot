const { sendIssueToSlack, respondToDelete } = require('./services/slack');
const { addIssueLabel, deleteComment } = require('./services/github');

exports.issueCommentHandler = (event) => {
  // Only handle the created event, reject others.
  if (event.payload.action !== 'created') return;

  (async () => {
    await sendIssueToSlack(event.payload);
  })();
};

exports.issuesHandler = (event) => {
  if (event.payload.action !== 'opened') return;

  (async () => {
    await addIssueLabel(event.payload);
  })();
};

exports.deleteCommentHandler = (event) => {
  (async () => {
    await deleteComment(event.payload);
    await respondToDelete(event);
  })();
};
