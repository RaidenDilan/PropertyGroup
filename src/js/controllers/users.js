angular
  .module('pncApp')
  .controller('UsersShowCtrl', UsersShowCtrl)
  .controller('UsersEditCtrl', UsersEditCtrl);

UsersShowCtrl.$inject = ['User', '$stateParams', '$state', '$auth'];
function UsersShowCtrl(User, $stateParams, $state, $auth) {
  const vm = this;
  vm.user = User.get($stateParams);

  vm.delete = () => {
    // $auth.logout(); // USER DELETE - Doesn't work here
    vm.user
      .$remove()
      .then((user) => {
        $auth.logout();  // USER DELETE - Works here
        $state.go('login');
      });
  };
}

UsersEditCtrl.$inject = ['User', '$stateParams', '$state'];
function UsersEditCtrl(User, $stateParams, $state) {
  const vm = this;
  vm.user = User.get($stateParams);

  vm.update = () => {
    if(vm.usersEditForm.$valid) {
      vm.user
        .$update()
        .then((user) => {
          $state.go('usersShow', $stateParams);
          console.log('user', user);
        });

      vm.usersEditForm.$setUntouched();
      vm.usersEditForm.$setPristine();
    }
  };
}
