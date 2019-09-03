const request = require('request-promise');

function getLocation(req, res) {
  const location = req.query.location || 'United Kingdom';
  const apiKey = 'AIzaSyCC-7h724REeedsIoCoUH9pRNcxB6qRK7A';
  const baseUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
  // const apiKey = process.env.PR3_GOOGLE_MAP_KEY || 'AIzaSyCx_35Epv3rapWbxBZHsqjPWhzGV8qHTYQ';

  request({
    method: 'GET',
    // url: baseUrl,
    url: `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${apiKey}`,
    json: true
    // qs: {
    //   lat,
    //   lng,
    //   key: 'AIzaSyCC-7h724REeedsIoCoUH9pRNcxB6qRK7A'
    // }
  })
  .then((data) => {
    console.log('data ------------------>', data);
    res.status(200).json(data);
  })
  .then((err) => res.status(500).json(err));
}

module.exports = { getLocation };
