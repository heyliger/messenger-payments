'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const bot = require('./bot');
const app = express();

app.set('port', (process.env.PORT || 5858));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// Process application/json
app.use(bodyParser.json());

// Serve static files from ./public
app.use(express.static('public'));

// Handle authentication
app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === 'MY_VERIFY_TOKEN') {
    res.send(req.query['hub.challenge']);
  }
});

app.use('/webhook/', bot);

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('Running on port: ', app.get('port'));
});
