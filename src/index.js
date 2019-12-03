const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const engines = require('ejs');
const events = require('events');

// Load the Enviroment variables.
require('dotenv').config();

const { rawBodySaver, verifySignature } = require('./helpers');
const {
  issuesAndReviewsCommentHandler,
  issuesHandler,
  deleteCommentHandler,
  prHandler,
  addIssueLabelFromSlack,
} = require('./eventHandlers');

console.log('Environment Variables loaded :', process.env.ENV_LOADED || 'FALSE');

const app = express();
const port = 8090;
const eventEmitter = new events.EventEmitter();

app.use(bodyParser.json({ verify: rawBodySaver }));
app.use(bodyParser.urlencoded({ extended: false, verify: rawBodySaver }));
app.use(bodyParser.raw({ verify: rawBodySaver, type: function () { return true } }));

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
  if (process.env.NODE_ENV !== 'test') {
    if (!verifySignature(req)) {
      res.status(401).send('Invalid X-hub Signature');
      return;
    }
  }
  const event = req.headers['x-github-event'];
  // console.log(req.body);
  const emitData = {
    event,
    payload: req.body,
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
  // body parser will json parse ad populate the req.body
  // below line for windows - temporary
  // payload = JSON.parse(payload.payload)
  // console.log(payload )
  const actionType = payload.actions[0].type;
  let val;
  let selectedOption;
  if (actionType === 'button') {
    val = JSON.parse(payload.actions[0].value);
  } else if (actionType === 'static_select') {
    val = JSON.parse(payload.actions[0].action_id);
    selectedOption = payload.actions[0].selected_option;
  }
  const { event } = val;
  const emitData = {
    event,
    payload: val,
    user: payload.user,
    channel: payload.channel,
    response_url: payload.response_url,
    message: payload.message,
    selectedOption,
  };
  eventEmitter.emit(event, emitData);
});

// Github Events
eventEmitter.on('issue_comment', issuesAndReviewsCommentHandler);
eventEmitter.on('issues', issuesHandler);
eventEmitter.on('pull_request', prHandler);
eventEmitter.on('pull_request_review_comment',issuesAndReviewsCommentHandler );

// Slack Events
eventEmitter.on('delete_comment', deleteCommentHandler);
eventEmitter.on('add_priority_to_issue', addIssueLabelFromSlack);

app.listen(port, () => console.log(`Gitbot running on port ${port}`));

module.exports = app;