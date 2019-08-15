angular
  .module('pncApp')
  .config(Router);

Router.$inject = ['$locationProvider', '$stateProvider', '$urlRouterProvider'];
function Router($locationProvider, $stateProvider, $urlRouterProvider) {
  $locationProvider.html5Mode(true);

  $stateProvider
    .state('groupsIndex', {
      url: '/groups',
      templateUrl: 'js/views/groups/index.html',
      controller: 'GroupsIndexCtrl as groupsIndex'
    })
    .state('groupsNew', {
      url: '/groups/new',
      templateUrl: 'js/views/groups/new.html',
      controller: 'GroupsNewCtrl as groupsNew'
    })
    .state('groupsHome', {
      url: '/groups/:id',
      templateUrl: 'js/views/groups/home.html',
      controller: 'GroupsHomeCtrl as groupsHome'
    })
    // .state('groupsEdit', {
    //   url: '/groups/:id/users/:userId/edit',
    //   templateUrl: 'js/views/groups/edit.html',
    //   controller: 'GroupsEditCtrl as groupsEdit'
    // })
    .state('groupsEdit', {
      url: '/groups/:id/edit',
      templateUrl: 'js/views/groups/edit.html',
      controller: 'GroupsEditCtrl as groupsEdit'
    })
    .state('groupsPropsShow', {
      url: '/groups/:id/properties/:listing_id',
      templateUrl: 'js/views/groups/show.html',
      controller: 'GroupsPropsShowCtrl as groupsPropsShow'
    })
    .state('usersShow', {
      url: '/users/:id',
      templateUrl: 'js/views/users/show.html',
      controller: 'UsersShowCtrl as usersShow'
    })
    .state('usersEdit',{
      url: '/users/:id/edit',
      templateUrl: 'js/views/users/edit.html',
      controller: 'UsersEditCtrl as usersEdit'
    })
    .state('propsIndex', {
      url: '/properties',
      templateUrl: 'js/views/props/index.html',
      controller: 'PropsIndexCtrl as propsIndex'
    })
    // .state('propsShow', {
    //   url: '/properties/:listing_id',
    //   templateUrl: 'js/views/props/show.html',
    //   controller: 'PropsShowCtrl as propsShow'
    // })
    .state('register', {
      url: '/register',
      templateUrl: 'js/views/auth/register.html',
      controller: 'RegisterCtrl as register'
    })
    .state('login', {
      url: '/login',
      templateUrl: 'js/views/auth/login.html',
      controller: 'LoginCtrl as login'
    });

  $urlRouterProvider.otherwise('/login');

}
