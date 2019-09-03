angular
  .module('pncApp')
	.directive('smartConfirm', smartConfirm);

smartConfirm.$inject = ['$compile'];
function smartConfirm($compile) {
	const directive = {
		restrict: 'EA',
		scope: {
			'confirm': '&'
		},
		transclude: true,
    templateUrl: 'js/views/templates/confirm.html',
		link(scope, element, attrs) {
      console.log(scope, element, attrs);
    }
	};
  return directive;
}
