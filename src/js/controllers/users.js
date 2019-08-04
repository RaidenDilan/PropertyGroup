angular
  .module('pncApp')
  .controller('UsersShowCtrl', UsersShowCtrl)
  .controller('UsersEditCtrl', UsersEditCtrl);

UsersShowCtrl.$inject = ['User', '$stateParams', '$state', '$auth'];
function UsersShowCtrl(User, $stateParams, $state, $auth) {
  const vm = this;
  vm.user = User.get($stateParams);

  function usersDelete() {
    // $auth.logout(); // USER DELETE - Doesn't work here

    vm.user
      .$remove()
      .then((user) => {
        $auth.logout();  // USER DELETE - Works here
        $state.go('login');
      });
  }
  vm.delete = usersDelete;
}

UsersEditCtrl.$inject = ['User', '$stateParams', '$state'];
function UsersEditCtrl(User, $stateParams, $state) {
  const vm = this;
  vm.user = User.get($stateParams);

  function usersUpdate() {
    vm.user
      .$update()
      .then(() => $state.go('usersShow', $stateParams));
  }
  vm.update = usersUpdate;
}
