angular
  .module('pncApp')
  .directive('propertyLike', propertyLike);

propertyLike.$inject = [];
function propertyLike() {
  const directive = {
    restrict: 'A',
    // replace: true,
    // require: 'ngModel',
    scope: {
      property: '=',
      like: '=',
      user: '=',
      visibility: '='
      // otherModelValue: '=compareTo'
    },
    link(scope, element, attrs) {
      // const property = scope.property;
      // const likes = scope.property.likes;
      // const like = scope.like;
      //
      // // console.log('element', element);
      console.log('scope', scope);
      // console.log('property', property);
      // console.log('likes', likes);
      // console.log('like', like);
      //
      scope.$watch(scope.property.likes, (newValue, oldValue) => {
        // console.log('newValue, oldValue', newValue, oldValue);
        if (scope.property.likes.includes(scope.like)) {
          scope.visibility = true;
          console.log(`Liked by ${scope.user.username} --->`, scope.property.likes.includes(scope.like));
        } else if (!scope.property.likes.includes(scope.like)) {
          scope.visibility = false;
          console.log(`Not liked by ${scope.user.username} --->`, !scope.property.likes.includes(scope.like));
        }
      });

      // function getLikes() {
      //   scope.property.forEach((cinema) => {
      //     cinema.latitude = cinema.geometry.location.lat;
      //     cinema.longitude = cinema.geometry.location.lng;
      //     // addMarker(cinema);
      //     // filterMarkers();
      //   });
      // }
      //
      // scope.$watch('property', getLikes);
    }
  };

  return directive;
}
