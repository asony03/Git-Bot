const request = require('request');
const template = require('../templates/toxic_message');

const endpoint = 'https://slack.com/api/chat.postMessage';

exports.sendIssueToSlack = async (payload) => {
  const message = template(payload);
  const options = {
    url: endpoint,
    method: 'POST',
    json: true,
    headers: {
      Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
    },
    body: {
      channel: 'se-project',
      ...message,
    },
  };
  // console.log(options);
  return new Promise((resolve, reject) => {
    request(options, (err, res) => {
      if (err) {
        reject(err);
      }
      resolve(res);
    });
  });
};

exports.respondToDelete = async (payload) => {
  const options = {
    url: payload.response_url,
    json: true,
    method: 'POST',
    body: {
      text: `Comment deleted by <@${payload.user.id}>`,
      response_type: 'in_channel',
      replace_original: false,
    },
  };
  return new Promise((resolve, reject) => {
    request(options, (err, res) => {
      if (err) {
        reject(err);
      }
      resolve(res);
    });
  });
};
