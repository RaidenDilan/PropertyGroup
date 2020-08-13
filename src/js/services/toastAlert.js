angular
  .module('groupartyApp')
  .service('ToastAlertService', ToastAlertService);

ToastAlertService.$inject = ['$mdToast'];
function ToastAlertService($mdToast) {
  let dialogs = {
    isDlgOpen: null,
    hideKey: 'z',
    dialogKey: 'd',
    actionResolve: 'hide',
    keyListConfig: false,
    position: 'top right',
    customToast(content, delay, toastClass) {
      $mdToast.show({
        // parent: angular.element(document.body), // The element to append the toast to. Defaults to appending to the root element of the application.
        // clickOutsideToClose: true,
        // escapeToClose: true,
        // scope: this, // the scope to link the template / controller to. If none is specified, it will create a new child scope. This scope will be destroyed when the toast is removed unless preserveScope is set to true.
        // preserveScope: true, // whether to preserve the scope when the element is removed. Default is false
        // autoWrap: true, // Whether or not to automatically wrap the template content with a <div class="md-toast-content"> if one is not provided. Defaults to true. Can be disabled if you provide a custom toast directive.
        hideDelay: delay,
        position: this.position,
        controller: 'ToastCtrl as toastCtrl',
        // controller: ToastCtrl',
        // controllerAs: 'toast',
        bindToController: true,
        locals: {
          toastMessage: content // An object containing key/value pairs. The keys will be used as names of values to inject into the controller. For example, locals: { toastMessage: content } would inject three into the controller with the
          // toastObject: object
        },
        templateUrl: 'js/views/modals/toast-template.html',
        // targetEvent: $event,
        toastClass: toastClass // A class to set on the toast element.
        // resolve: {
        //   selectedObject: () => {
        //     return content;
        //   }
        // } // Similar to locals, except it takes promises as values and the toast will not open until the promises resolve.
      });
      // .then((result) => {
      //   // $log.log('ToastAlertService - err ------>>>', err);
      //   // $log.log('ToastAlertService - result ------>>>', result);
      //   return result;
      //   // return result === this.actionResolve ? $log.log('Hide action triggered by button.')
      //   //   : result === 'key' ? $log.log('Hide action triggered by hot key: Control-' + this.hideKey + '.')
      //   //   : result === false ? $log.log('Custom toast dismissed by Escape key.')
      //   //   : $log.log('Custom toast hidden automatically.');
      //
      //   // if (result === this.actionResolve) $log.log('Hide action triggered by button.');
      //   // else if (result === 'key') $log.log('Hide action triggered by hot key: Control-' + this.hideKey + '.');
      //   // else if (result === false) $log.log('Custom toast dismissed by Escape key.');
      //   // else $log.log('Custom toast hidden automatically.');
      // })
      // .catch((error) => {
      //   $log.error('Cacthed custom toast failure:', error);
      // });
    }
    // customToaster(content, delay, position) {
    //   $mdToast.show(
    //     $mdToast.simple()
    //     .textContent(content)
    //     .position(position)
    //     .hideDelay(delay)
    //     // .theme("success-toast")
    //   );
    // },
    // defaultToaster(content) {
    //   $mdToast.show(
    //     $mdToast.simple()
    //     .textContent(content)
    //     .position('bottom right')
    //     .hideDelay(3000)
    //     // .theme("success-toast")
    //   );
    // }
  };

  return dialogs;
}

// var data = { type: 'SUCCESS', message: 'Well done!' };
// var toastClass;
// switch (data.type) {
//   case "SUCCESS":
//     toastClass = "success";
//     break;
//   case "ERROR":
//     toastClass = "error";
//     break;
//   case "INFO":
//     toastClass = "info";
//     break;
//   case "WARNING":
//     toastClass = "warning";
//     break;
// }

// Toaster.$inject = ['$rootScope'];
// function Toaster($rootScope) {
//   this.pop = (type, title, body) => {
//     this.toast = {
//       type: type,
//       title: title,
//       body: body
//     };
//
//     $rootScope.$broadcast('toaster-newToast');
//   };
// }
