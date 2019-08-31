angular
  .module('pncApp')
  .controller('MainCtrl', MainCtrl);

MainCtrl.$inject = ['$rootScope', '$timeout', '$state', '$auth', 'User', '$window', '$mdSidenav', '$log'];
function MainCtrl($rootScope, $timeout, $state, $auth, User, $window, $mdSidenav, $log) {
  const vm = this;
  const protectedStates = [
    'groupsIndex',
    'groupsNew',
    'groupsHome',
    'groupsEdit',
    'groupsEdit',
    'groupsPropsShow',
    'usersShow',
    'usersEdit',
    'propsIndex'
  ];

  vm.isAuthenticated = $auth.isAuthenticated;

  vm.toggleLeft = buildToggler('left');

  vm.menu = [
    { 'name': 'Search Properties', 'icon': 'search' },
    { 'name': 'My Group', 'icon': 'group_work' },
    { 'name': 'New Group', 'icon': 'add' },
    { 'name': 'Profile', 'icon': 'account_circle' },
    { 'name': 'Login', 'icon': 'transit_enterexit' },
    { 'name': 'Register', 'icon': 'enter_to_app' },
    { 'name': 'Logout', 'icon': 'exit_to_app' },
  ];

  // $rootScope.$on('userAddedToGroup', () => {
  //   vm.message = 'User added to group';
  //   console.log(vm.message);
  // });
  // $rootScope.$on('success', () => {
  //   vm.message = 'User added to group';
  //   console.log(vm.message);
  // });

  // $rootScope.$on('loggedIn', () => {
  //   console.log('logged in');
  //   vm.user = CurrentUserService.getUser();
  //   $state.go('companyIndex');
  // });
  //
  // $rootScope.$on('loggedOut', () => {
  //   console.log('logged out');
  //   vm.user = null;
  //   $state.go('login');
  // });

  function stateErrors(event, err) {
    vm.stateHasChanged = false;
    vm.message         = err.data.message;

    if(err.status === 401) $state.go('login');
  }

  function secureState(event, toState) {
    vm.message = null;

    if(!$auth.isAuthenticated() && protectedStates.includes(toState.name)) {
      event.preventDefault();
      $state.go('login');
      vm.message = 'You must be logged in to go there!';
    }
  }

  function authenticateState(event, toState) {
    // vm.currentUserGroupId = null;
    if(vm.stateHasChanged) vm.message = null;
    if(!vm.stateHasChanged) vm.stateHasChanged = true;
    if(vm.stateHasChanged) document.body.scrollTop = document.documentElement.scrollTop = 0;

    if($auth.getPayload()) {
    vm.currentUserId = $auth.getPayload().userId;

    return User
      .get({ id: vm.currentUserId }) // OR ===> .query()
      .$promise
      .then((user) => {
        vm.user = user; // OR with query() ===> // vm.user = users.find(obj => obj.id === vm.currentUserId);

        if((toState.name === 'propsIndex' && vm.user.group === null || undefined) && protectedStates.includes(toState.name)) {
          event.preventDefault();
          $state.go('groupsNew');
          vm.message = 'You must create a group before searching for properties';
        }

        return !vm.user.group ? vm.currentUserGroupId = null : vm.currentUserGroupId = vm.user.group.id;
      });
    }
  }

  $rootScope.$on('error', stateErrors);
  $rootScope.$on('$stateChangeStart', secureState);
  $rootScope.$on('$stateChangeSuccess', authenticateState);

  vm.logout = () => {
    $auth
      .logout()
      // .removeToken()
      .then(() => {
        // $window.localStorage.clear();
        $state.go('login');
      });
      // remove user from local storage and clear http auth header
      // delete $localStorage.currentUser;
      // $http.defaults.headers.common.Authorization = '';
  };
  // vm.message = 'Sorry to see you leaving and we hope to see you again soon.😃';

  vm.close = () => {
    // Component lookup should always be available since we are not using `ng-if`
    $mdSidenav('left')
      .close()
      .then(() => $log.debug('close LEFT is done'));
  };

  function buildToggler(navID) {
    return () => {
      // Component lookup should always be available since we are not using `ng-if`
      $mdSidenav(navID)
        .toggle()
        .then(() => $log.debug('toggle ' + navID + ' is done'));
    };
  }
}
