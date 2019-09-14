angular
  .module('pncApp')
  .controller('UsersShowCtrl', UsersShowCtrl)
  .controller('UsersEditCtrl', UsersEditCtrl);

UsersShowCtrl.$inject = ['User', '$stateParams', '$state', '$auth'];
function UsersShowCtrl(User, $stateParams, $state, $auth) {
  const vm = this;

  vm.user = User.get($stateParams);

  vm.delete = () => {
    vm.user
      .$remove()
      .then((user) => {
        $auth.logout();
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
        .then((user) => $state.go('usersShow', $stateParams));

      vm.usersEditForm.$setUntouched();
      vm.usersEditForm.$setPristine();
    }
  };
}
