const { sendIssueToSlack, respondToDelete , sendLabelsToSlack } = require('./services/slack');
const { addIssueLabel, deleteComment, addPRLabel } = require('./services/github');
const { getToxicity } = require('./services/ml');

exports.issuesAndReviewsCommentHandler = (event) => {
  // Only handle the created event, reject others.
  //below line for windows - temporary
  // event.payload = JSON.parse(event.payload.payload)
  if (event.payload.action !== 'created') return;
  (async () => {
    const is_toxic = await getToxicity(event.payload.comment.body);
    if (is_toxic) {
      //console.log("-----------------------------------------Toxic Comment Detected-----------------------------------------")
      await sendIssueToSlack(event.payload);
    }
  })();
};

exports.issuesHandler = (event) => {
  //below line for windows - temporary
  // event.payload = JSON.parse(event.payload.payload)
  if (event.payload.action !== 'opened') return;

  (async () => {
    const labels = await addIssueLabel(event.payload);
    if(labels.includes("bug")){
      // console.log('bug detected');
      await sendLabelsToSlack(event.payload);
    }
  })();
};

exports.deleteCommentHandler = (event) => {
  (async () => {
    await deleteComment(event.payload);
    await respondToDelete(event);
  })();
};

exports.prHandler = (event) => {
  (async () => {
    await addPRLabel(event.payload);
  })();
};


