angular
  .module('pncApp')
	.directive('viewport', viewport);

viewport.$inject = ['$window', '$document'];
function viewport($window, $document) {
	const directive = {
		restrict: 'EA',
    link(scope, element, attrs) {
      // var vh = $window.innerHeight * 0.01; // We execute the same script as before
      var vh = window.innerHeight * 0.01; // We execute the same script as before

      if (isMobile()) {
        console.log('vh', vh);
        document.documentElement.style.setProperty('--vh', `${vh}px`); // Then we set the value in the --vh custom property to the root of the document
        console.log('--vh value', document.documentElement.style.getPropertyValue('--vh'));
      }

      // scope.resize = function resize() {
      //   if (!isMobile()) {
      //     // scope.vh = $window.innerHeight * 0.01; // We execute the same script as before
      //     vh = $window.innerHeight * 0.01; // We execute the same script as before
      //     document.documentElement.style.setProperty('--vh', `${vh}px`); // Then we set the value in the --vh custom property to the root of the document
      //   }
      // };

      function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        // if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i)) return true;
        // else return false;
      }
    }
	};

  return directive;
}
