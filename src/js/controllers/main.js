angular
  .module('pncApp')
  .controller('MainCtrl', MainCtrl)
  .controller('ToastCtrl', ToastCtrl);

MainCtrl.$inject = ['$rootScope', '$timeout', '$state', '$auth', 'User', '$window', '$mdSidenav', '$log', '$mdToast'];
function MainCtrl($rootScope, $timeout, $state, $auth, User, $window, $mdSidenav, $log, $mdToast) {
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
    'propertiesIndex'
  ];
  var message = 'Custom toast';
  var isDlgOpen;
  var ACTION_RESOLVE = 'undo';
  var UNDO_KEY       = 'z';
  var DIALOG_KEY     = 'd';

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

  function stateErrors(event, err) {
    vm.stateHasChanged = false;
    vm.message         = err.data.message;
    // var errMsg         = vm.message.toString();
    // showCustomToast(err.data.message);
    if(err.status === 401) $state.go('login');
  }

  function secureState(event, toState) {
    vm.message = null;

    if(!$auth.isAuthenticated() && protectedStates.includes(toState.name)) {
      event.preventDefault();
      $state.go('home');
      vm.message = 'You must be logged in to go there!';
    }
  }

  function authenticateState(event, toState) {
    // vm.currentUserGroupId = null;
    if(vm.stateHasChanged) vm.message = null;
    if(!vm.stateHasChanged) vm.stateHasChanged = true;
    // if(vm.stateHasChanged)
    document.body.scrollTop = document.documentElement.scrollTop = 0;

    if($auth.getPayload()) {
    vm.currentUserId = $auth.getPayload().userId;

    return User
      .get({ id: vm.currentUserId }) // OR ===> .query()
      .$promise
      .then((user) => {
        vm.user = user; // OR with query() ===> // vm.user = users.find(obj => obj.id === vm.currentUserId);

        if((toState.name === 'propertiesIndex' && vm.user.group === null || undefined) && protectedStates.includes(toState.name)) {
          event.preventDefault();
          $state.go('groupsNew');
          vm.message = 'You must create a group before searching for properties';
        }

        return !vm.user.group ? vm.currentUserGroupId = null : vm.currentUserGroupId = vm.user.group.id;
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

  function showCustomToast(message) {
    console.log('message', message);

    $mdToast.show({
      hideDelay: 0,
      position: 'top right',
      // controller: 'ToastCtrl',
      controller: ToastCtrl,
      controllerAs: 'toastCtrl',
      bindToController: true,
      locals: { toastMessage: message },
      templateUrl: 'js/views/modals/toast-template.html'
    })
    .then((result) => {
      if (result === ACTION_RESOLVE) $log.log('Undo action triggered by button.');
      else if (result === 'key') $log.log('Undo action triggered by hot key: Control-' + UNDO_KEY + '.');
      else if (result === false) $log.log('Custom toast dismissed by Escape key.');
      else $log.log('Custom toast hidden automatically.');
    })
    .catch((error) => $log.error('Custom toast failure:', error));
  }

  // vm.message = 'Sorry to see you leaving and we hope to see you again soon.😃';
  vm.logout = () => {
    $auth
      .logout()
      // .removeToken()
      .then(() => {
        // $window.localStorage.clear();
        $state.go('home');
      });
      // remove user from local storage and clear http auth header
      // delete $localStorage.currentUser;
      // $http.defaults.headers.common.Authorization = '';
  };

  vm.close = () => {
    // Component lookup should always be available since we are not using `ng-if`
    $mdSidenav('left')
      .close()
      .then(() => $log.debug('close LEFT is done'));
  };
}

ToastCtrl.$inject = ['$mdToast', '$mdDialog', '$document', '$scope'];
function ToastCtrl($mdToast, $mdDialog, $document, $scope) {
  const vm = this;
  var UNDO_KEY   = 'z';
  var DIALOG_KEY = 'd';

  vm.undoKey = UNDO_KEY;
  vm.dialogKey = DIALOG_KEY;
  vm.keyListenerConfigured = false;

  setupActionKeyListener();

  vm.closeToast = () => {
    if (isDlgOpen) return;

    $mdToast
      .hide(ACTION_RESOLVE)
      .then(() => isDlgOpen = false);
  };

  vm.openMoreInfo = (e) => {
    if (isDlgOpen) return;
    isDlgOpen = true;

    $mdDialog
      .show(
        $mdDialog
        .alert()
        .title('More info goes here.')
        .textContent('Something witty.')
        .ariaLabel('More info')
        .ok('Got it')
        .targetEvent(e)
      )
      .then(() => isDlgOpen = false);
  };

  /** @param { KeyboardEvent } event to handle */
  function handleKeyDown(event) {
    if (event.key === 'Escape') $mdToast.hide(false);
    if (event.key === UNDO_KEY && event.vmKey) $mdToast.hide('key');
    if (event.key === DIALOG_KEY && event.vmKey) vm.openMoreInfo(event);
  }

  function setupActionKeyListener() {
    if (!vm.keyListenerConfigured) {
      $document.on('keydown', handleKeyDown);
      vm.keyListenerConfigured = true;
    }
  }

  function removeActionKeyListener() {
    if (vm.keyListenerConfigured) {
      $document.off('keydown');
      vm.keyListenerConfigured = false;
    }
  }

  $scope.$on('$destroy', () => removeActionKeyListener());
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
