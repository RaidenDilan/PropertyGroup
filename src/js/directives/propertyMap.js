angular
  .module('pncApp')
  .directive('propertyMap', propertyMap);

propertyMap.$inject = ['$window', 'mapStyles'];
function propertyMap($window, mapStyles) {
  const directive = {
    restrict: 'E',
    replace: true,
    template: '<div class="google-map"></div>',
    scope: {
      center: '=',
      property: '=',
      lat: '=',
      lng: '='
    },
    link(scope, element, attrs) {
      const property = scope.property;
      const latLng   = { lat: property.latitude, lng: property.longitude };
      let infoWindow = null;

      const map = new $window.google.maps.Map(element[0], {
        zoom: 13,
        scrollwheel: false,
        center: latLng,
        styles: mapStyles
      });

      if (property) addMarker(property);

      function addMarker(property) {
        const marker = new google.maps.Marker({
          animation: google.maps.Animation.DROP,
          zoom: 12,
          position: latLng,
          draggable: false,
          map: map
        });

        const htmlElement =
          `<div id="infoWindow">
            <img src="${property.image_354_255_url}">
            <p>${property.displayable_address}</p>
          </div>`;

        marker.addListener('click', function(event) {
          if(infoWindow) infoWindow.close();
          infoWindow = new google.maps.InfoWindow({ content: htmlElement });
          infoWindow.open(map, this);
        });
      }

      // function toggleBounce() {
      //   if (marker.getAnimation() !== null) marker.setAnimation(null);
      //   else marker.setAnimation(google.maps.Animation.BOUNCE);
      // }

      // marker.addListener('click', toggleBounce);
    }
  };

  return directive;
}
