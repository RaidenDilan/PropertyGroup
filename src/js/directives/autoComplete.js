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

// .directive('googleplace', googleplace);
// googleplace.$inject = [];
// function googleplace() {
//   return {
//     require: 'ngModel',
//     link: function(scope, element, attrs, model) {
//       var options = {
//         types: [],
//         componentRestrictions: {}
//       };
//       scope.autocomplete = new google.maps.places.Autocomplete(element[0], options);
//
//       google.maps.event.addListener(scope.autocomplete, 'place_changed', function() {
//         scope.$apply(function() {
//           model.$setViewValue(element.val());
//         });
//       });
//     }
//   };
// }
//
// <script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?libraries=places&sensor=false"></script>
// <div ng-app="myApp" ng-controller="MyCtrl">
//   <div>Google Places Autocomplte integration in Angular</div>
//   <div>To Test, start typing the name of any Indian city</div>
//   <div>selection is: {{chosenPlace}}</div>
//   <div><input ng-model="chosenPlace" googleplace/></div>
// </div>
