const request = require('request-promise');
const Promise = require('bluebird');

function getLocation(req, res, next) {
  const baseUrl  = 'https://maps.googleapis.com/maps/api/geocode/json';

  // const lat      = req.query.lat;
  // const lng      = req.query.lng;
  // const latLon   = `${req.query.lat},${req.query.lng}`;
  // const latLong  = req.query.latLon;
  // const location = req.query.location || 'United Kingdom';

  const params = {
    method: 'GET',
    url: baseUrl,
    json: true,
    qs: {
      key: process.env.PR3_GOOGLE_MAP_KEY
    }
  };

  function getAllResults(lat, lng) {
    params.qs.latlng = `${lat},${lng}`;
    let allResults = [];

    return new Promise((resolve, reject) => {
      function makeRequest() {
        request(params)
          .then((response) => {
            // console.log('getAllResults() --->>>', response);
            if(response.status === 'INVALID_REQUEST') return makeRequest();
            if(response.status !== 'OK') reject(new Error(response.status));

            allResults = allResults.concat(response.results);

            if(response.next_page_token) {
              params.qs.pagetoken = response.next_page_token;
              return makeRequest();
            }

            return resolve(allResults);
          });
      }
      makeRequest();
    });
  }

  Promise
    .props({ latlng: getAllResults(req.query.lat, req.query.lng) })
    .then((response) => {
      // console.log('getAllResults() --->>>', response);
      const resultSet = response.latlng;
      return res.json(resultSet);
    })
    .catch(next);
}

module.exports = { getLocation };
