angular
  .module('pncApp')
  .service('GeoCoder', GeoCoder);

GeoCoder.$inject = ['$http'];
function GeoCoder($http) {
  this.getLocation = function getLocation(lat, lng) {
    return $http
      .get('/api/location', { params: { lat, lng }})
      .then((response) => {
        console.log('<---*** response ***--->', response);
        // const latLon = response.data.results[0].geometry.latLng;
        return response.data;
      });
  };
}
