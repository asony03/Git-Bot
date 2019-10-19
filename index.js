const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/payload', (req, res) => {
  const payload = JSON.parse(req.body.payload);
  console.log(payload.comment.body);
});

app.listen(port, () => console.log('Gitbot running on port 3000'));

