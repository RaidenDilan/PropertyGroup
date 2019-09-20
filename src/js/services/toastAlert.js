angular
  .module('pncApp')
  .service('ToastAlertService', ToastAlertService);

  ToastAlertService.$inject = ['$mdToast', '$document', '$log'];
  function ToastAlertService($mdToast, $document, $log) {
    var service = {
      isDlgOpen: null,
      hideKey: 'z',
      dialogKey: 'd',
      actionResolve: 'hide',
      keyListConfig: false,
      customToaster: customToaster,
      simpleToaster: defaultToaster,
      customToast: showCustomToast
    };

    return service;

    function showCustomToast(content, delay, position) {
      $mdToast.show({
        hideDelay: delay,
        position: position,
        controller: ToastCtrl,
        controllerAs: 'toast',
        bindToController: true,
        locals: { toastMessage: content },
        templateUrl: 'js/views/modals/toast-template.html'
      })
      .then((result) => {
        if (result === service.actionResolve) $log.log('Hide action triggered by button.');
        else if (result === 'key') $log.log('Hide action triggered by hot key: Control-' + service.hideKey + '.');
        else if (result === false) $log.log('Custom toast dismissed by Escape key.');
        else $log.log('Custom toast hidden automatically.');
      })
      .catch((error) => $log.error('Custom toast failure:', error));
    }

    function customToaster(content , delay, position) {
      $mdToast.show(
        $mdToast.simple()
          .textContent(content)
          .position(position)
          .hideDelay(delay)
      );
    }

    function defaultToaster(content) {
      $mdToast.show(
        $mdToast.simple()
          .textContent(content)
          .position('bottom right')
          .hideDelay(3000)
      );
    }
  }
