const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/payload', (req, res) => {
  // console.log(req);
  console.log(req.body);
});

app.listen(port, () => console.log('Gitbot running on port 3000'));

