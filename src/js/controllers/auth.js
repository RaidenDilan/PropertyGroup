angular
  .module('pncApp')
  .controller('RegisterCtrl', RegisterCtrl)
  .controller('LoginCtrl', LoginCtrl);

RegisterCtrl.$inject = ['$auth', '$state'];
function RegisterCtrl($auth, $state) {
  const vm = this;
  vm.user = {};

  function submit() {
    if(vm.registerForm.$valid) {
      $auth
        .signup(vm.user)
        .then(() => $state.go('login'));

      vm.registerForm.$setUntouched();
      vm.registerForm.$setPristine();
    }
  }
  vm.submit = submit;
}

LoginCtrl.$inject = ['$auth', '$state', '$stateParams'];
function LoginCtrl($auth, $state, $stateParams) {
  const vm = this;
  vm.credentials = {};

  function submit() {
    if(vm.loginForm.$valid) {
      $auth
        .login(vm.credentials)
        // .then(() => $state.go('groupsHome', { id: $auth.getPayload().userId }));
        .then(() => $state.go('usersShow', { id: $auth.getPayload().userId }));

      vm.loginForm.$setUntouched();
      vm.loginForm.$setPristine();
    }
  }
  vm.submit = submit;

  function authenticate(provider) {
    $auth
      .authenticate(provider)
      .then(() => $state.go('usersShow', { id: $auth.getPayload().userId }));
  }

  vm.authenticate = authenticate;
}
