const express = require('express');
const bodyParser = require('body-parser');
const events = require('events');
const { rawBodySaver, verifySignature } = require('./helpers');
const { issueComment } = require('./eventHandlers');

require('dotenv').config();

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

eventHandler.on('issue_comment', issueComment);

app.listen(port, () => console.log('Gitbot running on port 3000'));
