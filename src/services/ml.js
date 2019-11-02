const request = require('superagent');
const nock = require('nock');
const mockToxicityData = require('../data/mock_toxicity.json');
const mockLabelData = require('../data/mock_label.json');
const tf = require('@tensorflow/tfjs-node');
const toxicity = require('@tensorflow-models/toxicity');

const threshold = 0.9;

exports.getToxicity = (text) => new Promise((resolve, reject) => {
  toxicity.load(threshold).then(model => {
    const data = [text];

    model.classify(data).then(predictions => {
      var len = predictions.length;
      resolve(predictions[len-1].results[0].match);
    });
  });
});

exports.getLabels = async (text) => new Promise((resolve, reject) => {
  nock(process.env.ML_API_ENDPOINT)
    .post('/labels')
    .reply(200, mockLabelData);

  request
    .post(`${process.env.ML_API_ENDPOINT}/labels`)
    .send({
      payload: text,
    })
    .then((res) => {
      resolve(res.body);
    })
    .catch((err) => {
      reject(err);
    });
});
