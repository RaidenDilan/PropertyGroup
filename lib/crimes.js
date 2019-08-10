const rp = require('request-promise');

function getCrimes(req, res) {
  rp({
    method: 'GET',
    url: 'https://data.police.uk/api/crimes-street/all-crime',
    qs: {
      lat: req.query.lat,
      lng: req.query.lon,
      date: '2017-01'
    },
    json: 'true'
  })
  .then((response) => res.status(200).json(response))
  .catch((err) => res.status(500).json(err));
}

module.exports = { getCrimes };
