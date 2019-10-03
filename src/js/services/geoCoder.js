// angular
//   .module('pncApp')
//   .service('GeoCoder', GeoCoder);
//
// GeoCoder.$inject = ['$http'];
// function GeoCoder($http) {
//   this.getLocation = function getLocation(location) {
//     return $http
//       .get('/api/location', { params: { location }})
//       .then((response) => {
//         // const latlng = response.data[0].geometry.location || 'United Kingdom';
//         const latlng = response.data[0];
//         console.log('GeoCoder Service : latlng', latlng);
//         return latlng;
//       });
//   };
// }
