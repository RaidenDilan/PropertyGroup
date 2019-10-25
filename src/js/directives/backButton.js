angular
  .module('groupartyApp')
  .directive('backButton', backButton);

backButton.$inject = ['$window'];
function backButton($window) {
  const directive = {
    restrict: 'EA',
    // replace: true,
    // template: '<button class="btn-back" ng-show="!main.hideBack" ng-cloak>Back</button>',
    // controller: ($scope, $state) => {
    //   $scope.$on('$stateChangeSuccess', (event, toState) => {
    //     $scope.hideBack = $state.current.hideBack ? $state.current.hideBack : false;
    //     console.log('$state.current', $state.current);
    //   });
    // },
    link(scope, element, attrs) {
      element.bind('click', () => {
        $window.history.back();
        scope.$apply();
      });
    }
  };

  return directive;
}
