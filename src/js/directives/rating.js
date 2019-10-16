angular
  .module('pncApp')
  .directive('ratingStars', ratingStars);

ratingStars.$inject = [];
function ratingStars() {
  const directive = {
    restrict: 'E',
    require: '?ngModel',
    controller: angular.noop,
    controllerAs: 'vm',
    bindToController: true,
    templateUrl: 'js/views/modals/rating.html',
    scope: {
      ratings: '<',
      averageRating: '<',
      ratingsPosition: '@'
    },
    link(scope, element, attrs, ngModel) {
      const vm = scope.vm;

      var newRatingStar = null;
      var numArray      = [1, 2, 3, 4, 5];

      vm.mutable    = false;
      vm.starsArray = numArray.join('');

      init();

      function init() {
        vm.mutable = !!ngModel;

        if (ngModel) {
          ngModel.$render = () => {
            newRatingStar = ngModel.$viewValue;
          };
        }
      }

      vm.getClass = (num) => {
        return { on: vm.averageRating >= num || newRatingStar >= num, 'on-half': vm.averageRating > newRatingStar && vm.averageRating < num && vm.averageRating >= num - 0.75, my: newRatingStar >= num };
      };

      vm.mouseover = (rating) => {
        if(ngModel) newRatingStar = rating;
        // return ngModel ? newRatingStar = rating : newRatingStar = null;
        // ((condition) && (answer if true) || (answer if false))
      };

      vm.mouseout = () => {
        if(ngModel) newRatingStar = ngModel.$viewValue;
      };

      vm.click = () => {
        if(ngModel) ngModel.$setViewValue(newRatingStar);
      };
    }
  };

  return directive;
}
