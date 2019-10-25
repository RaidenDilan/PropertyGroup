angular
  .module('gropartyApp')
  .controller('UsersShowCtrl', UsersShowCtrl)
  .controller('UsersEditCtrl', UsersEditCtrl);

UsersShowCtrl.$inject = ['User', '$stateParams', '$state', '$auth', 'ToastAlertService'];
function UsersShowCtrl(User, $stateParams, $state, $auth, ToastAlertService) {
  const vm = this;

  vm.user = User.get($stateParams);

  vm.delete = () => {
    vm.user
      .$remove()
      .then((user) => {
        $auth.logout();
        $state.go('login');
        ToastAlertService.customToast(`${user.message}`, 2000, 'success');
      });
  };
}

UsersEditCtrl.$inject = ['User', '$stateParams', '$state', 'ToastAlertService'];
function UsersEditCtrl(User, $stateParams, $state, ToastAlertService) {
  const vm = this;

  vm.user = User.get($stateParams);

  vm.update = () => {
    if (vm.usersEditForm.$valid) {
      vm.user
        .$update()
        .then((res) => {
          $state.go('usersShow', $stateParams);
          ToastAlertService.customToast(`${res.user.username} Updated`, 2000, 'success');
        });

      vm.usersEditForm.$setUntouched();
      vm.usersEditForm.$setPristine();
    }
  };
}
