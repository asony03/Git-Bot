const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
var engines = require('ejs');

const app = express();
const port = 8090;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// API routes
require('./routes/auth.js')(app);
require('./routes/webhooks.js')(app);

app.use(express.static(path.join(__dirname, '/views')));
app.engine('html', engines.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + "/views");

app.post('/payload', (req, res) => {
  console.log(req.body);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname+'/views/index.html'))
});

app.listen(port, () => console.log('Gitbot running on port 8090'));

