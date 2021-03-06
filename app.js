var config = require('./config');
var beerRoute = require('./beerRoute');
var breweryRoute = require('./breweryRoute');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var port = process.env.PORT || config.listeningPort;

// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// route
app.post(config.urlPrefix + '/beer', beerRoute);
app.post(config.urlPrefix + '/brewery', breweryRoute);

// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(400).send(err.message);
});

app.listen(port, function () {
  console.log('Slack bot listening on port ' + port);
});
