angular
  .module('groupartyApp')
  .config(Material);

  Material.$inject = ['$mdThemingProvider', '$mdIconProvider'];
  function Material($mdThemingProvider, $mdIconProvider) {

    // Extend the red theme with a few different colors
    var neonPurpleMap = $mdThemingProvider.extendPalette('purple', { '500': '9C27B0' });
    var neonRedMap = $mdThemingProvider.extendPalette('red', { '500': 'f44336' });
    // var neonWhiteMap = $mdThemingProvider.extendPalette('white', { '500': 'ffffff' });

    // Register the new color palette map with the name <code>neonRed</code>
    $mdThemingProvider.definePalette('neonRed', neonRedMap);
    $mdThemingProvider.definePalette('neonPurple', neonPurpleMap);
    // $mdThemingProvider.definePalette('neonWhite', neonWhiteMap);

    // Use that theme for the primary intentions
    $mdThemingProvider.theme('default')
      .primaryPalette('neonPurple')
      .accentPalette('neonRed')
      .warnPalette('red');
      // .backgroundPalette('white');
  }
