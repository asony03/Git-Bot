const request = require('request');
const template = require('./templates/toxic_message');

const endpoint = 'https://slack.com/api/chat.postMessage';

exports.sendSlackMessage = async (payload) => {
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

  return new Promise((resolve, reject) => {
    request(options, (err, res) => {
      if (err) {
        reject(err);
      }
      resolve(res);
    });
  });
};
