/* global google:ignore */

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
      // console.log('scope', scope);

      let infoWindow = null;
      let marker     = null;
      const markers  = [];

      const propertyLatLng = { lat: scope.property.latitude, lng: scope.property.longitude };

      const map = new $window.google.maps.Map(element[0], {
        zoom: 13,
        scrollwheel: false,
        center: propertyLatLng,
        styles: mapStyles
      });

      const circle = new google.maps.Circle({
        strokeColor: '#0000FF',
        strokeOpacity: 0.8,
        strokeWeight: 1.5,
        fillColor: '#0000FF',
        fillOpacity: 0.2,
        map: map,
        center: propertyLatLng
      });

      const property = scope.property;

      addMarker(property);

      function addMarker(property) {
        const latLng = { lat: property.latitude, lng: property.longitude };

        marker = new google.maps.Marker({
          position: latLng,
          map,
          animation: google.maps.Animation.DROP
          // icon: '/assets/property.svg' // Adding a custom icon
        });

        markers.push(marker);

        const htmlElement =
          `<div id="infoWindow">
            <img src="${property.image_50_38_url}">
            <p>${property.listingId}</p>
         </div>`;

        google.maps.event.addListener(marker, 'click', function() {
          if(infoWindow) infoWindow.close();

          infoWindow = new google.maps.InfoWindow({ content: htmlElement });

          google.maps.event.addListener(infoWindow, 'domready', () => {
            document.getElementById('infoWindow').onclick = function handleWindowClick() {

              console.log('property 2', property);

              scope.lat = property.latitude;
              scope.lng = property.longitude;
              scope.$apply();
            };

          });

          infoWindow.open(map, this);
        });
      }
    }
  };

  return directive;
}

// Map Style (from here to end of file)
angular
  .module('pncApp')
  .constant('mapStyles', [{
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#444444' }]
  },{
    featureType: 'landscape',
    elementType: 'all',
    stylers: [{ color: '##000000' }]
  },{
    featureType: 'poi',
    elementType: 'all',
    stylers: [{ visibility: 'off' }]
  },{
    featureType: 'road',
    elementType: 'all',
    stylers: [{ saturation: -100 }, { lightness: 45 }]
  },{
    featureType: 'road.highway',
    elementType: 'all',
    stylers: [{ saturation: '0' }, { visibility: 'on' }]
  },{
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [{ color: '#00bc66' }, { saturation: '-59' }, { lightness: '46' }]
  },{
    featureType: 'road.arterial',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }]
  },{
    featureType: 'transit',
    elementType: 'all',
    stylers: [{ visibility: 'off' }]
  },{
    featureType: 'water',
    elementType: 'all',
    stylers: [{ color: '#46bcec' }, { visibility: 'on' }]
  }]);
