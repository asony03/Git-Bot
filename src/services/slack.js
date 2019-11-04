const request = require('request');
const template = require('../templates/toxic_message');
const template_Labels = require('../templates/label_priority');
const template_toxic_updated = require('../templates/toxic_message_updated');
const template_Label_updated = require('../templates/label_priority_updated');

const endpoint = 'https://slack.com/api/chat.postMessage';

exports.sendIssueToSlack = async (payload) => {
  const message = template(payload);
  return this.sendMessageToSlack(payload,message);
};

exports.sendLabelsToSlack = async (payload) => {
  const message = template_Labels(payload);
  return this.sendMessageToSlack(payload,message);
};

exports.sendMessageToSlack = async (payload , message) => {
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

exports.respondToDelete = async (payload) => {
  const message = template_toxic_updated(payload);
  return this.updateSlackMessage(payload,message);
};

exports.respondToAddPriority = async (payload , label) => {
  const message = template_Label_updated(payload,label);
  return this.updateSlackMessage(payload,message);
};

exports.updateSlackMessage = async (payload,message) => {
  const options = {
    url: payload.response_url,
    json: true,
    method: 'POST',
    body: {
      response_type: 'in_channel',
      replace_original: true,
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


