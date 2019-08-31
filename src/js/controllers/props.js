angular
  .module('pncApp')
  .controller('PropsIndexCtrl', PropsIndexCtrl)
  .controller('PropsShowCtrl', PropsShowCtrl);

PropsIndexCtrl.$inject = ['$http', '$uibModal', '$mdDialog'];
function PropsIndexCtrl($http, $uibModal, $mdDialog) {
  const vm = this;

  vm.results    = [];
  vm.area       = null;
  vm.beds       = null;
  vm.limit      = 10;
  vm.fullscreen = true;

  vm.getProps = () => {
    $http
      .get('/api/properties', { params: { area: vm.area, minimum_beds: vm.beds, maximum_beds: vm.beds }})
      .then((response) => vm.results = response.data);
  };

  vm.loadMore = () => {
    return vm.limit +=12;
  };

  vm.showProperty = (thisProperty) => {
    $mdDialog.show({
      controller: PropsShowCtrl,
      controllerAs: 'propsShow',
      templateUrl: 'js/views/props/show.html',
      parent: angular.element(document.body),
      targetEvent: thisProperty,
      clickOutsideToClose: true,
      fullscreen: vm.fullscreen,
      resolve: {
        selectedProperty: () => {
          return thisProperty;
        }
      }
    });
  };
}

PropsShowCtrl.$inject = ['GroupProperty', 'selectedProperty', '$mdDialog'];
function PropsShowCtrl(GroupProperty, selectedProperty, $mdDialog) {
  const vm = this;

  vm.selected = selectedProperty;

  vm.store = () => {
    const newProperty = {
      listingId: vm.selected.listing_id
    };

    GroupProperty
      .save(newProperty)
      .$promise
      .then(() => vm.newProperty = {});
  };

  vm.hide = () => $mdDialog.hide();
}
