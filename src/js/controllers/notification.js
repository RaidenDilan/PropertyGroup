angular
  .module('pncApp')
  .controller('ToastCtrl', ToastCtrl);

ToastCtrl.$inject = ['$mdToast', '$mdDialog', '$document', '$scope'];
function ToastCtrl($mdToast, $mdDialog, $document, $scope) {
  const vm = this;

  vm.isDlgOpen     = null;
  vm.hideKey       = 'z';
  vm.dialogKey     = 'd';
  vm.actionResolve = 'hide';
  vm.keyListConfig = false;

  setupActionKeyListener();

  vm.closeToast = () => {
    if (vm.isDlgOpen) return;

    $mdToast
      .hide(vm.actionResolve)
      .then(() => vm.isDlgOpen = false);
  };

  vm.openMoreInfo = (e) => {
    if (vm.isDlgOpen) return;
    vm.isDlgOpen = true;

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
      .then(() => vm.isDlgOpen = false);
  };

  /** @param { KeyboardEvent } event to handle */
  function handleKeyDown(event) {
    if (event.key === 'Escape') $mdToast.hide(false);
    if (event.key === vm.hideKey && event.vmKey) $mdToast.hide('key');
    if (event.key === vm.dialogKey && event.vmKey) vm.openMoreInfo(event);
  }

  function setupActionKeyListener() {
    if (!vm.keyListConfig) {
      $document.on('keydown', handleKeyDown);
      vm.keyListConfig = true;
    }
  }

  function removeActionKeyListener() {
    if (vm.keyListConfig) {
      $document.off('keydown');
      vm.keyListConfig = false;
    }
  }

  $scope.$on('$destroy', () => removeActionKeyListener());
}
