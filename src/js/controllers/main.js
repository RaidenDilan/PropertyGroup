angular
  .module('pncApp')
  .controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['$rootScope', '$scope', '$state', '$auth', 'ToastAlertService', 'User', '$mdSidenav', '$log'];
  function MainCtrl($rootScope, $scope, $state, $auth, ToastAlertService, User, $mdSidenav, $log) {
    const vm = this;

    const protectedStates = [
      'usersShow',
      'usersEdit',
      'groupsIndex',
      'groupsNew',
      'groupsHome',
      'groupsEdit',
      'groupsPropsShow',
      'propertiesIndex',
      'propertiesShow'
    ];

    $state.current.hideBack = true;
    vm.hideBack             = $state.current.hideBack;
    vm.isAuthenticated      = $auth.isAuthenticated;
    vm.toastDelay           = 2000;
    vm.toggleLeft           = buildToggler('left');

    $rootScope.$on('error', stateErrors);
    $rootScope.$on('$stateChangeStart', secureState);
    $rootScope.$on('$stateChangeSuccess', authenticateState);

    function stateErrors(event, err) {
      vm.stateHasChanged = false;
      vm.message = err.data.message;

      ToastAlertService.customToast(vm.message, 5000, 'error');

      if (err.status === 401) $state.go('login');
    }

    function secureState(event, toState, toParams, fromState, fromParams) {
      vm.message = null;
      // console.log('vm.currentGroupId', vm.currentGroupId);
      if (!detectMobile() && vm.hideBack === true) vm.hideBack = $state.current.hideBack ? $state.current.hideBack : false;

      // SOME HOW PROTECTED ROUTES CAN BE ACCESSED WHEN NOT IN A GROUP BUT IS AUTHENTICATED
      // if (vm.currentGroupId === undefined) {
      //   event.preventDefault();
      //   $state.go('groupsNew');
      //   vm.message = 'You must be in this group to view it\'s contents!';
      //   ToastAlertService.customToast(vm.message, vm.toastDelay, 'warning');
      // }

      if (!$auth.isAuthenticated() && protectedStates.includes(toState.name)) {
        event.preventDefault();
        $state.go('login');
        vm.message = 'You must be logged in to view web contents!';
        ToastAlertService.customToast(vm.message, vm.toastDelay, 'warning');
      }
    }

    function authenticateState(event, toState, toParams, fromState, fromParams) {
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

    function detectMobile() {
      if(navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i)) return true;
      else return false;
    }

    vm.close = () => {
      // Component lookup should always be available since we are not using `ng-if`
      $mdSidenav('left')
        .close()
        .then(() => $log.debug('close LEFT is done'));
    };

    vm.logout = () => {
      $auth
        .logout()
        .then(() => {
          $state.go('home');
          ToastAlertService.customToast(`Logged out successfully`, vm.toastDelay, 'success');
        });
    };
  }

  // $scope.urlHistory = [];
  // $scope.$on('$routeChangeSuccess', function () {
  //   if ($location.$$absUrl.split('#')[1] !== $scope.urlHistory[$scope.urlHistory.length - 1]) $scope.urlHistory.push($location.$$absUrl.split('#')[1]);
  // });
  // $scope.goBack = function () {
  //   $scope.urlHistory.pop();
  //   $location.path($scope.urlHistory[$scope.urlHistory.length - 1]);
  // };

  // $scope.$on('$routeChangeStart', function (scope, next, current) {
  //   console.log('scope', scope);
  //   console.log('next', next);
  //   console.log('current', current);
  //   if (next.$$route.controller != "/") {
  //     // Show here for your model, and do what you need**
  //     // $("#yourModel").show();
  //   }
  // });
