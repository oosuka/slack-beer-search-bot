var config = {
  urlPrefix: '',
  listeningPort: 3000,
  api: 'breweryDb',
  breweryDb: {
    key: process.env.UJ_BREWERYDB_KEY,
    urlPrefix: 'https://api.brewerydb.com/v2/',
    beerLinkPrefix: 'http://www.brewerydb.com/beer/'
  },
  untappd: {
    clientId: process.env.UJ_UNTAPPD_ID,
    clientSecret: process.env.UJ_UNTAPPD_SECRET,
    urlPrefix: 'https://api.untappd.com/v4/',
    beerLinkPrefix: 'https://untappd.com/beer/'
  },
  slackToken: process.env.UJ_SLACK_TOKEN,
  slackPostMessage: 'https://slack.com/api/chat.postMessage',
  searchLimit: 5
}
module.exports = config;
