const rp = require('request-promise');

function properties(req, res){
  rp({
    method: 'GET',
    url: 'https://api.zoopla.co.uk/api/v1/property_listings.json',
    qs: {
      area: req.query.area,
      listing_status: 'rent',
      keywords: 'residential',
      page_size: 100,
      minimum_beds: req.query.minimum_beds,
      maximum_beds: req.query.maximum_beds,
      api_key: process.env.ZOOPLA_API_KEY
    },
    json: true
  })
  .then((response) => res.status(200).json(response))
  .catch((err) => res.status(500).json(err));
}

function selectedProp(req, res) {
  rp({
    method: 'GET',
    url: 'https://api.zoopla.co.uk/api/v1/property_listings.json',
    qs: {
      listing_id: req.query.listingId.split(','),
      api_key: process.env.ZOOPLA_API_KEY
    },
    qsStringifyOptions: { arrayFormat: 'repeat' }, // talk about this in your presentation! :D
    json: true
  })
  .then((response) => res.status(200).json(response))
  .catch((err) => res.status(500).json(err));
}

module.exports = { properties, selectedProp };
