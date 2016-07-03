var config = require('./config');
var requestJson = require('request-json');

var client = requestJson.createClient(config.untappd.urlPrefix);

module.exports = {
  search: function(searchTerm, callback) {
    search(searchTerm, callback);
  },

  brewerysearch: function(searchTerm, callback) {
    brewerysearch(searchTerm, callback);
  },

  beer: function(beerId, callback) {
    // Feeling lucky
    if (isNaN(beerId)) {
      search(beerId, function(beers) {
        if(typeof beers !== 'undefined') {
          beerById(beers[0].id, callback);
        } else {
          callback(undefined);
        }
      });
    } else {
      beerById(beerId, callback);
    }
  },

  brewery: function(breweryId, callback) {
    // Feeling lucky
    if (isNaN(breweryId)) {
      brewerysearch(breweryId, function(breweries) {
        if(typeof breweries !== 'undefined') {
          breweryById(breweries[0].id, callback);
        } else {
          callback(undefined);
        }
      });
    } else {
      breweryById(breweryId, callback);
    }
  }
};

var apiParameters = function() {
  return 'client_id=' + config.untappd.clientId + '&client_secret=' + config.untappd.clientSecret;
}

var search = function(searchTerm, callback) {
  client.get('search/beer?q=' + searchTerm + '&' + apiParameters(),
    function(err, brewRes, body) {
      var beers = undefined;
      if (typeof(body.response) !== 'undefined' && typeof(body.response.beers) !== 'undefined' && body.response.beers.count > 0) {
        var beersJson = body.response.beers.items;
        beers = new Array(beersJson.length);
        for(var i = 0;i < beersJson.length;i++) {
          var beerData = beersJson[i];
          beers[i] = {
            name: beerData.beer.beer_name + ' - ' + beerData.brewery.brewery_name,
            id: beerData.beer.bid
          };
        }
      }
      callback(beers);
    }
  );
}

var brewerysearch = function(searchTerm, callback) {
  client.get('search/brewery?q=' + searchTerm + '&' + apiParameters(),
    function(err, brewRes, body) {
      var breweries = undefined;
      if (typeof(body.response) !== 'undefined' && typeof(body.response.brewery) !== 'undefined' && body.response.brewery.count > 0) {
        var breweryJson = body.response.brewery.items;
        breweries = new Array(breweryJson.length);
        for(var i = 0;i < breweryJson.length;i++) {
          var breweryData = breweryJson[i];
          breweries[i] = {
            name: breweryData.brewery.brewery_name,
            id: breweryData.brewery.brewery_id
          };
        }
      }
      callback(breweries);
    }
  );
}

var beerById = function(beerId, callback) {
  client.get('beer/info/' + beerId + '?' + apiParameters(),
    function(err, brewRes, body) {
      var beer = undefined;
      if (typeof(body.response) !== 'undefined' && typeof(body.response.beer) !== 'undefined') {
        var beerData = body.response.beer;
        var production = (beerData.is_in_production === 0) ? '`Out of Production`\n' : '';
        var style = 'Style: ' + beerData.beer_style;
        var abv = 'ABV: ' + beerData.beer_abv + '%';
        var ibu = 'IBU: ' + beerData.beer_ibu;
        var score = '★' + floatFormat(beerData.rating_score, 2);
        var count = 'Ratings: ' + beerData.rating_count.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,');
        var description = beerData.beer_description;
        beer = {
          name: beerData.beer_name + ' - ' + beerData.brewery.brewery_name,
          link: config.untappd.beerLinkPrefix + beerData.bid,
          description: production + style + '\n' + abv + ' ' + ibu + ' ' + score + ' ' + count + '\n' + description,
          imageUrl: beerData.beer_label
        };
      }
      callback(beer);
    }
  );
}

var breweryById = function(breweryId, callback) {
  client.get('brewery/info/' + breweryId + '?' + apiParameters(),
    function(err, brewRes, body) {
      var brewery = undefined;
      if (typeof(body.response) !== 'undefined' && typeof(body.response.brewery) !== 'undefined') {
        var breweryData = body.response.brewery;
        var production = (breweryData.brewery_in_production === 1) ? '`Out of Business`\n' : '';
        var location = breweryData.location.brewery_city + ', ' + breweryData.location.brewery_state + ' ' + breweryData.country_name;
        var type = breweryData.brewery_type;
        var rating = '★' + floatFormat(breweryData.rating.rating_score, 2);
        var count = 'Ratings: ' + breweryData.rating.count.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,');
        var beers = 'Beers: ' + breweryData.beer_count;
        var description = breweryData.brewery_description;
        brewery = {
          name: breweryData.brewery_name,
          link: config.untappd.breweryLinkPrefix + breweryData.brewery_id,
          description: production + location + '\n' + type + '\n' + rating + ' ' + count + ' ' + beers + '\n' + description,
          imageUrl: breweryData.brewery_label
        };
      }
      callback(brewery);
    }
  );
}

var floatFormat = function(number, n) {
    var _pow = Math.pow(10, n);
    return Math.round(number * _pow) / _pow;
}
