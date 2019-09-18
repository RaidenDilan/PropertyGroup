// angular
// .module('pncApp')
// .service('TokenService', TokenService);
//
// TokenService.$inject = ['$window', 'jwtHelper'];
// function TokenService($window, jwtHelper) {
//   const self = this;
//   self.setToken = (token) => {
//     return $window.localStorage.setItem('satellizer_token', token);
//   };
//   self.getToken = () => {
//     return $window.localStorage.getItem('satellizer_token');
//   };
//   self.decodeToken = () => {
//     const token = self.getToken();
//     return token ? jwtHelper.decodeToken(token) : null;
//   };
//   self.clearToken = clearToken;
//   function clearToken() {
//     $window.localStorage.removeItem('satellizer_token');
//   }
// }
