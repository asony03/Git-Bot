const moment = require('moment');

module.exports = (obj) => {
  const json = {
    blocks: [{
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Toxic comment detected:\n*<${obj.comment.html_url}|${obj.comment.body}>*`,
      },
    },
    {
      type: 'section',
      fields: [{
        type: 'mrkdwn',
        text: `*Issue:*\n*<${obj.issue.url}|${obj.issue.title}>*`,
      },
      {
        type: 'mrkdwn',
        text: `*User:*\n*<${obj.comment.user.html_url}|${obj.comment.user.login}>*`,
      },
      {
        type: 'mrkdwn',
        text: `*When:*\n${moment(obj.comment.created_at).format('llll')}`,
      },
      ],
    },
    {
      type: 'actions',
      elements: [{
        type: 'button',
        text: {
          type: 'plain_text',
          emoji: true,
          text: 'Delete Comment',
        },
        style: 'danger',
        value: 'click_me_123',
      }],
    },
    ],
  };
  return json;
};
