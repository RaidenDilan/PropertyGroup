angular
  .module('groupartyApp')
  .directive('propertyMap', propertyMap);

propertyMap.$inject = ['$window', 'mapStyles'];
function propertyMap($window, mapStyles) {
  const directive = {
    restrict: 'E',
    replace: true,
    template: '<div class="google-map"></div>',
    scope: {
      property: '=',
      lat: '=',
      lng: '=',
      center: '='
    },
    link(scope, element, attrs) {
      const property = scope.property;

      const latLng = { lat: property.latitude, lng: property.longitude }; // .toFixed(3)

      const map = new $window.google.maps.Map(element[0], {
        zoom: 12,
        scrollwheel: false,
        center: latLng,
        styles: mapStyles
      });

      const marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        zoom: 12,
        position: latLng,
        draggable: false,
        map: map
      });

      const infoWindow = new google.maps.InfoWindow({
        content:
          `<div id="infoWindow">
            <img src="${ property.image_354_255_url }">
            <p>${ property.displayable_address }</p>
          </div>`,
        maxWidth: 300
      });

      marker.addListener('click', function(event) {
        if (!marker.open && infoWindow) {
          infoWindow.close();
          marker.open = false;
        }
        infoWindow.open(map, this);
        marker.open = true;
      });

      map.addListener('click', () => {
        infoWindow.close();
        marker.open = false;
      });

      // function toggleBounce() {
      //   if (marker.getAnimation() !== null) marker.setAnimation(null);
      //   else marker.setAnimation(google.maps.Animation.BOUNCE);
      // }

      // marker.addListener('click', toggleBounce);
    }
  };

  return directive;
}
