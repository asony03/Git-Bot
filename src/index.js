const express = require('express');
const bodyParser = require('body-parser');
const events = require('events');

// Load the Enviroment variables.
require('dotenv').config();

const { rawBodySaver, verifySignature } = require('./helpers');
const { issueCommentHandler, issuesHandler, deleteCommentHandler } = require('./eventHandlers');

console.log('Environment Variables loaded :', process.env.ENV_LOADED || 'FALSE');

const app = express();
const port = 3000;

const eventHandler = new events.EventEmitter();

app.use(bodyParser.urlencoded({
  extended: false,
  verify: rawBodySaver,
}));

app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
  if (!verifySignature(req)) {
    res.status(401).send('Invalid X-hub Signature');
    return;
  }
  const event = req.headers['x-github-event'];
  const emitData = {
    event,
    payload: JSON.parse(req.body.payload),
    protocol: req.protocol,
    host: req.headers.host,
    url: req.url,
  };
  eventHandler.emit(event, emitData);
  res.status(200).send();
});

app.post('/slack', (req, res) => {
  res.status(200).send();
  const payload = JSON.parse(req.body.payload);
  const val = JSON.parse(payload.actions[0].value);
  const { event } = val;
  const emitData = {
    event,
    payload: val,
    user: payload.user,
    channel: payload.channel,
    response_url: payload.response_url,
  };
  eventHandler.emit(event, emitData);
});

eventHandler.on('issue_comment', issueCommentHandler);
eventHandler.on('issues', issuesHandler);
eventHandler.on('delete_comment', deleteCommentHandler);
// eventHandler.on('issues', issuesHandler);

app.listen(port, () => console.log('Gitbot running on port 3000'));
