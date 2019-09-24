angular
  .module('pncApp')
  .controller('RegisterCtrl', RegisterCtrl)
  .controller('LoginCtrl', LoginCtrl);

RegisterCtrl.$inject = ['$auth', '$state', 'ToastAlertService'];
function RegisterCtrl($auth, $state, ToastAlertService) {
  const vm = this;

  vm.user = {};

  vm.submit = () => {
    if(vm.registerForm.$valid) {
      $auth
        .signup(vm.user)
        .then((user) => {
          $state.go('login');
          ToastAlertService.customToast(`${user.data.message}`, 3000, 'success');
        });

      vm.registerForm.$setUntouched();
      vm.registerForm.$setPristine();
    }
  };
}

LoginCtrl.$inject = ['$auth', '$state', '$stateParams', 'ToastAlertService'];
function LoginCtrl($auth, $state, $stateParams, ToastAlertService) {
  const vm = this;

  vm.credentials = {};

  vm.submit = () => {
    if(vm.loginForm.$valid) {
      $auth
        .login(vm.credentials)
        .then((user) => {
          $state.go('usersShow', { id: $auth.getPayload().userId });
          ToastAlertService.customToast(`${user.data.message}`, 3000, 'success');
        });

      vm.loginForm.$setUntouched();
      vm.loginForm.$setPristine();
    }
  };

  vm.authenticate = (provider) => {
    $auth
      .authenticate(provider)
      .then(() => {
        $state.go('usersShow', { id: $auth.getPayload().userId });
        ToastAlertService.customToast('You\'re now logged in', 3000, 'top right', 'success');
      });
  };
}
