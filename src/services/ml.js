const request = require('superagent');
const nock = require('nock');
const toxicity = require('@tensorflow-models/toxicity');
const mockLabelData = require('../data/mock_label.json');

const threshold = 0.9;

exports.getToxicity = (text) => new Promise((resolve, reject) => {
  toxicity.load(threshold).then((model) => {
    const data = [text];

    model.classify(data).then((predictions) => {
      const len = predictions.length;
      resolve(predictions[len - 1].results[0].match);
    });
  });
});

exports.getLabels = async (body, title) => new Promise((resolve, reject) => {
  if (process.env.NODE_ENV === 'test') {
    nock(process.env.ML_API_ENDPOINT)
      .post('/labels')
      .reply(200, mockLabelData);
  }

  request
    .post(`${process.env.ML_API_ENDPOINT}/labels`)
    .send({
      body,
      title,
    })
    .then((res) => {
      console.log(res.body);
      resolve(res.body);
    })
    .catch((err) => {
      reject(err);
    });
});
