angular
  .module('groupartyApp')
  .directive('httpLoader', httpLoader);

  httpLoader.$inject = ['$http'];
  function httpLoader($http) {
    const directive = {
      restrict: 'EA',
      templateUrl: 'js/views/modals/http-loader.html',
      link(scope, element, attrs) {
        scope.isLoading = () => $http.pendingRequests.length > 0;

        scope.$watch(scope.isLoading, (oldValue, newValue, scope) => oldValue = oldValue ? element.show() : element.hide(), true);
      }
  };

  return directive;
}
