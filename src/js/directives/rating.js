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
      const vm          = scope.vm;
      var numArray      = [1, 2, 3, 4, 5];
      var newRatingStar = null;

      vm.mutable    = false;
      vm.starsArray = numArray.join('');

      init();

      function init() {
        vm.mutable = !!ngModel;
        if(ngModel) ngModel.$render = () => newRatingStar = ngModel.$viewValue;
        // return ngModel ? ngModel.$render = () => newRatingStar = ngModel.$viewValue : ngModel = ngModel;
      }

      vm.getClass = (num) => {
        return {
          on: vm.averageRating >= num || newRatingStar >= num,
          // 'on-half': vm.averageRating > newRatingStar && vm.averageRating < num && vm.averageRating >= num - 0.75,
          my: newRatingStar >= num
        };
      };

      vm.mouseover = (rating) => ngModel ? newRatingStar = rating : newRatingStar = null;
      vm.mouseout  = () => ngModel ? newRatingStar = ngModel.$viewValue : newRatingStar = null;
      vm.click     = () => ngModel ? newRatingStar = ngModel.$setViewValue(newRatingStar) : newRatingStar = null;
    }
  };

  return directive;
}
