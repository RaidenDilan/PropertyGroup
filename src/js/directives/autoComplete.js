angular
  .module('pncApp')
  .directive('autocomplete', autocomplete);

autocomplete.$inject = ['$window', '$rootScope'];
function autocomplete($window, $rootScope) {
  const directive = {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      geometry: '='
    },
    link: (scope, element, attrs, model) => {
      const options = { types: [] };
      const autocomplete = new $window.google.maps.places.Autocomplete(element[0], options);

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        scope.geometry = place.geometry.location.toJSON();
        model.$setViewValue(element.val());
        $rootScope.$broadcast('place_changed', place);
      });
    }
  };

  return directive;
}
