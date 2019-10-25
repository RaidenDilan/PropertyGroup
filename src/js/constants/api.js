angular
  .module('gropartyApp')
  .constant('API', `${window.location.origin}/api`)
  .constant('mapStyles', [{ // Map Style (from here to end of file)
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
