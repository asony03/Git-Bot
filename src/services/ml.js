const request = require('superagent');
const nock = require('nock');
const mockToxicityData = require('../data/mock_toxicity.json');
const mockLabelData = require('../data/mock_label.json');

exports.getToxicity = async (text) => new Promise((resolve, reject) => {
  nock(process.env.ML_API_ENDPOINT)
    .post('/toxicity')
    .reply(200, mockToxicityData);

  request
    .post(`${process.env.ML_API_ENDPOINT}/toxicity`)
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
