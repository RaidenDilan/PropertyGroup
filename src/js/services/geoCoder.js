angular
  .module('pncApp')
  .service('GeoCoder', GeoCoder);

GeoCoder.$inject = ['$http'];
function GeoCoder($http) {
  this.getLocation = function getLocation(location) {
    return $http
      .get('/api/location', { params: { location }})
      .then((data) => {
        console.log('SERVICE', data);
        
        const latlng = data.data.results[0].geometry.location || 'United Kingdom';
        return latlng;
      });
  };

}
