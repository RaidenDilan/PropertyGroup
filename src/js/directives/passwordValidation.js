angular
  .module('pncApp')
  .directive('compareTo', compareTo);

compareTo.$inject = [];
function compareTo() {
  const directive = {
    restrict: 'A', //
    require: 'ngModel',
    scope: {
      otherModelValue: '=compareTo'
    },
    link(scope, element, attributes, ngModel) {

      ngModel.$validators.compareTo = (modelValue) => {
        return modelValue == scope.otherModelValue;
      };

      scope.$watch('otherModelValue', () => ngModel.$validate());
    }
  };

  return directive;
}
