var config = require('./config');
var beerApi = require('./' + config.api);
var slack = require('./slack');

module.exports = function(req, res, next) {
  var userEntry = req.body.text.trim();
  if(userEntry.length < 1) {
    res.status(200).send('Invalid command please try again\n\n' + help());
    return;
  }

  var command = userEntry;
  var search;
  if(userEntry.indexOf(" ") > 0) {
    var splitIndex = userEntry.indexOf(" ");
    command = userEntry.substr(0, splitIndex);
    search = userEntry.substr(userEntry.indexOf(" ") + 1);
  }

  switch(command) {
    case 'help':
      res.status(200).send(help());
      break;
    case 'search':
    case 's':
      if(typeof search !== 'undefined') {
        beerApi.brewerysearch(search, function(breweries) {
          var brewsText = "Were you searching for a Sake Brewery? Try again...";
          if(typeof breweries !== 'undefined') {
            brewsText = '';
            var max = breweries.length > config.searchLimit ? config.searchLimit : breweries.length;
            for (var i = 0;i < max;i++) {
              brewsText += '*' + breweries[i].name + '* id: *' + breweries[i].id + '*\n';
            }
          }
          res.status(200).send(brewsText);
        });
        break;
      }
    case 'display':
    case 'd':
      if(typeof search !== 'undefined') {
        beerApi.brewery(search, function(brewery) {
          if(typeof brewery === 'undefined') {
            res.status(200).send("Sorry we can't find Brewery. Try again...");
          } else {
            var attachments = [slack.createAttachment(brewery)];
            slack.displayToChat(req.body.channel_id, attachments);
            res.status(200).send();
          }
        });
        break;
      }
    default:
      res.status(200).send('Invalid command please try again\n\n' + help());
      break;
  }
}

var help = function() {
  return 'Help:\n/brewery (search|s) Yokohama\n/brewery (display|d) 12559\n/brewery (display|d) Ise Kadoya\n/brewery help';
}
