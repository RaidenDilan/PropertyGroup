angular
  .module('pncApp')
  .config(Material);

  Material.$inject = ['$mdThemingProvider', '$mdIconProvider'];
  function Material($mdThemingProvider, $mdIconProvider) {
    // Extend the red theme with a few different colors
    var neonRedMap = $mdThemingProvider.extendPalette('red', {
      '500': 'f44336'
    });
    var neonPurpleMap = $mdThemingProvider.extendPalette('purple', {
      '500': '9C27B0'
    });

    // Register the new color palette map with the name <code>neonRed</code>
    $mdThemingProvider.definePalette('neonRed', neonRedMap);
    $mdThemingProvider.definePalette('neonPurple', neonPurpleMap);

    // Use that theme for the primary intentions
    $mdThemingProvider.theme('default')
      .primaryPalette('neonPurple')
      .accentPalette('neonRed');
  }
