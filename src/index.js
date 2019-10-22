const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const engines = require('ejs');
const events = require('events');

// Load the Enviroment variables.
require('dotenv').config();

const { rawBodySaver, verifySignature } = require('./helpers');
const {
  issueCommentHandler,
  issuesHandler,
  deleteCommentHandler,
  prHandler,
} = require('./eventHandlers');

console.log('Environment Variables loaded :', process.env.ENV_LOADED || 'FALSE');

const app = express();
const port = 8090;
const eventEmitter = new events.EventEmitter();

app.use(bodyParser.urlencoded({
  extended: false,
  verify: rawBodySaver,
}));

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '/views')));
app.engine('html', engines.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + "/views");

// API routes
require('./routes/auth.js')(app);
require('./routes/webhooks.js')(app);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname+'/views/index.html'))
});

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
  eventEmitter.emit(event, emitData);
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
  eventEmitter.emit(event, emitData);
});

// Github Events
eventEmitter.on('issue_comment', issueCommentHandler);
eventEmitter.on('issues', issuesHandler);
eventEmitter.on('pull_request', prHandler);

// Slack Events
eventEmitter.on('delete_comment', deleteCommentHandler);

app.listen(port, () => console.log(`Gitbot running on port ${port}`));

