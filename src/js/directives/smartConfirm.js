angular
  .module('groupartyApp')
  .directive('smartConfirm', smartConfirm);

smartConfirm.$inject = ['$compile'];
function smartConfirm($compile) {
  const directive = {
    restrict: 'EA',
    scope: {
      confirm: '&'
    },
    transclude: true,
    templateUrl: 'js/views/modals/confirm.html'
  };

  return directive;
}
