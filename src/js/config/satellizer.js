angular
  .module('groupartyApp')
  .config(Auth);
// .run(ClearLocalStorage);

Auth.$inject = ['$authProvider'];
function Auth($authProvider) {
  $authProvider.signupUrl = '/api/register';
  $authProvider.loginUrl = '/api/login';

  $authProvider.github({
    clientId: '1f8ffbfc3e534e0afb14',
    url: '/api/oauth/github'
  });
}

// ClearLocalStorage.$inject = ['$rootScope', '$http', '$location', '$localStorage'];
// function ClearLocalStorage($rootScope, $http, $location, $localStorage) {
//   // keep user logged in after page refresh
//   if ($localStorage.currentUser) $http.defaults.headers.common.Authorization = 'Bearer ' + $localStorage.currentUser.token;
//
//   // redirect to login page if not logged in and trying to access a restricted page
//   $rootScope.$on('$locationChangeStart', (event, next, current) => {
//     var publicPages = ['/login', '/register'];
//     var restrictedPage = publicPages.indexOf($location.path()) === -1;
//     if (restrictedPage && !$localStorage.currentUser) $location.path('/login');
//   });
// }
