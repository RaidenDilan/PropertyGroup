angular
  .module('pncApp')
  .controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['$rootScope', '$state', '$auth', 'ToastAlertService', 'User', '$mdSidenav', '$log'];
  function MainCtrl($rootScope, $state, $auth, ToastAlertService, User, $mdSidenav, $log) {
    const vm = this;

    const protectedStates = ['groupsIndex', 'groupsNew', 'groupsHome', 'groupsEdit', 'groupsEdit', 'groupsPropsShow', 'usersShow', 'usersEdit', 'propertiesIndex'];

    vm.isAuthenticated = $auth.isAuthenticated;
    vm.toastDelay = 3000;
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

    function stateErrors(event, err) {
      vm.stateHasChanged = false;
      vm.message = err.data.message;

      ToastAlertService.customToast(vm.message, 5000, 'error');

      if (err.status === 401) $state.go('login');
    }

    function secureState(event, toState) {
      vm.message = null;

      if (!$auth.isAuthenticated() && protectedStates.includes(toState.name)) {
        event.preventDefault();

        $state.go('login');
        vm.message = 'You must be logged in to view web contents!';

        ToastAlertService.customToast(vm.message, vm.toastDelay, 'warning');
      }
    }

    function authenticateState(event, toState) {
      if (vm.stateHasChanged) vm.message = null;
      if (!vm.stateHasChanged) vm.stateHasChanged = true;
      if (vm.stateHasChanged) document.body.scrollTop = document.documentElement.scrollTop = 0; // BUG????

      if ($auth.getPayload()) {
        vm.currentUserId = $auth.getPayload().userId;

        return User
          .get({ id: vm.currentUserId })
          .$promise
          .then((user) => {
            vm.user = user;

            if ((toState.name === 'propertiesIndex' && vm.user.group === null) && protectedStates.includes(toState.name)) {
              event.preventDefault();

              $state.go('groupsNew');
              vm.message = 'You must create a group before searching for properties';

              ToastAlertService.customToast(vm.message, vm.toastDelay, 'warning');
            }
            return !vm.user.group ? vm.currentGroupId = null : vm.currentGroupId = vm.user.group.id;
          });
      }
    }

    function buildToggler(navID) {
      return () => {
        // Component lookup should always be available since we are not using `ng-if`
        $mdSidenav(navID)
          .toggle()
          .then(() => $log.debug('toggle ' + navID + ' is done'));
      };
    }

    $rootScope.$on('error', stateErrors);
    $rootScope.$on('$stateChangeStart', secureState);
    $rootScope.$on('$stateChangeSuccess', authenticateState);

    vm.close = () => {
      // Component lookup should always be available since we are not using `ng-if`
      $mdSidenav('left')
        .close()
        .then(() => $log.debug('close LEFT is done'));
    };

    // vm.message = 'Sorry to see you leaving and we hope to see you again soon.😃';

    vm.logout = () => {
      $auth
        .logout() // OR .removeToken()
        .then(() => {
          // $window.localStorage.clear();
          $state.go('home');
          ToastAlertService.customToast(`Logged out successfully`, vm.toastDelay, 'success');
        });
        // remove user from local storage and clear http auth header
        // delete $localStorage.currentUser;
        // $http.defaults.headers.common.Authorization = '';
    };
  }

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
  // vm.last = { bottom: false, top: true, left: false, right: true };
  // vm.toastPosition = angular.extend({}, last);
  // vm.getToastPosition = () => {
  //   sanitizePosition();
  //
  //   return Object
  //     .keys(vm.toastPosition)
  //     .filter((pos) => vm.toastPosition[pos])
  //     .join(' ');
  // };
  //
  // function sanitizePosition() {
  //   var current = vm.toastPosition;
  //
  //   if (current.bottom && last.top) current.top = false;
  //   if (current.top && last.bottom) current.bottom = false;
  //   if (current.right && last.left) current.left = false;
  //   if (current.left && last.right) current.right = false;
  //
  //   last = angular.extend({}, current);
  // }
  //
  // function showNotifications(message) {
  //   var toastPosition = vm.getToastPosition();
  //
  //   $mdToast.show(
  //     $mdToast.simple()
  //     .textContent(message)
  //     .position(toastPosition)
  //     .hideDelay(3000))
  //     .then(() => $log.log('Toast dismissed.'))
  //     .catch(() => $log.log('Toast failed or was forced to close early by another toast.'));
  // }

  // vm.backspaceTime = 50;    // set the time for each character to be typed out, defaults to 250ms
  // vm.startDelay    = 2000;  // set the time for each character to be deleted, defaults to type-time
  // vm.typeTime      = 60;    // set the time before the first action happens, defaults to 500ms
  // vm.startTrigger  = true;  // Set a boolean variable on the directive that will start the directive when the variable changes to true
  // vm.repeat        = false; // set whether to continuously loop over the words, defaults to true
  // vm.startTyping   = true;  // Set whether the directives first animation is either the type or delete/highlight
