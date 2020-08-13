const rp = require('request-promise');

function properties(req, res) {
  rp({
    method: 'GET',
    url: 'https://api.zoopla.co.uk/api/v1/property_listings.json',
    qs: {
      area: req.query.area,
      listing_status: 'rent', // Request a specific listing status. Either "sale" or "rent".
      keywords: 'residential', // Keywords to search for within the listing description.
      page_size: 100, // The size of each page of results, default 10, maximum 100.
      property_type: req.query.property_type, // Type of property, either "houses" or "flats".
      minimum_beds: req.query.minimum_beds, // The minimum number of bedrooms the property should have.
      maximum_beds: req.query.maximum_beds, // The maximum number of bedrooms the property should have.
      minimum_price: req.query.minimum_price, // Minimum price for the property, in GBP. When listing_status is "sale" this refers to the sale price and when listing_status is "rent" it refers to the per-week price.
      maximum_price: req.query.maximum_price, // Maximum price for the property, in GBP.
      order_by: req.query.order_by, // The value which the results should be ordered, either "price" (default) or "age" of listing.
      ordering: req.query.ordering, // Sort order for the listings returned. Either "descending" (default) or "ascending".
      api_key: process.env.ZOOPLA_API_KEY
    },
    json: true
  })
    .then(response => res.status(200).json(response))
    .catch(err => {
      if (err.statusCode === 400) return res.status(400).json({ err: err, message: 'Something went wrong searching with Zoopla API.' });
      return res.status(500).json(err);
    });
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
    .then(response => res.status(200).json(response))
    .catch(err => {
      if (err.statusCode === 403) return res.status(403).json({ err: err, message: 'Zoopla API call limit reached, come back in 1h. ✌🏼' });
      return res.status(500).json(err);
    });
}

module.exports = { properties, selectedProp };
