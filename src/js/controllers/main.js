angular
  .module('pncApp')
  .controller('MainCtrl', MainCtrl);

MainCtrl.$inject = ['$rootScope', '$state', '$auth', 'User'];
function MainCtrl($rootScope, $state, $auth, User){
  const vm = this;
  vm.isAuthenticated = $auth.isAuthenticated;

  $rootScope.$on('error', (e, err) => {
    vm.message = err.data.message;
    if(err.status === 401) $state.go('login');
  });

  $rootScope.$on('$stateChangeSuccess', () => {
    vm.currentUserGroupId = null;
    if(vm.stateHasChanged) vm.message = null;
    if(!vm.stateHasChanged) vm.stateHasChanged = true;

    if($auth.getPayload()) {
      vm.currentUserId = $auth.getPayload().userId;

      User
        .query()
        .$promise
        .then((response) => {
          vm.user = response.find(obj => obj.id === vm.currentUserId);
          return (!vm.user.group) ? vm.currentUserGroupId = null : vm.currentUserGroupId = vm.user.group.id;
          // if (vm.user.group === null || undefined) return null;
          // if (!vm.user.group) vm.currentUserGroupId = null;
          // if (vm.user.group) vm.currentUserGroupId = vm.user.group.id;
        });
    }

    // if($auth.getPayload()) {
    //   vm.currentUserId = $auth.getPayload().userId;
    //
    //   User
    //     .get({ id: vm.currentUserId })
    //     .$promise
    //     .then((user) => {
    //       vm.currentUser = user;
    //
    //       if(toState.name === 'message' && vm.currentUser.locked === true) {
    //         e.preventDefault();
    //         $state.go('usersIndex');
    //         vm.message = 'Complete your profile in order to message other users';
    //       }
    //     });
    // }
    //
    // const protectedStates = ['usersProfile', 'usersEdit', 'message'];
    //
    // function secureState(e, toState) {
    //   // console.log('Changing states');
    //   vm.message = null;
    //   if(!$auth.isAuthenticated() && protectedStates.includes(toState.name)) {
    //     e.preventDefault();
    //     $state.go('login');
    //     vm.message = 'You must be logged in to go there!';
    //   }
    // }
    // $rootScope.$on('$stateChangeStart', secureState);
  });

  function logout() {
    $auth.logout();
    $state.go('login');
  }
  vm.logout = logout;
}
