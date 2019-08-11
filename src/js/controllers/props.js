angular
  .module('pncApp')
  .controller('PropsIndexCtrl', PropsIndexCtrl)
  .controller('PropsShowCtrl', PropsShowCtrl);

PropsIndexCtrl.$inject = ['$http', '$uibModal'];
function PropsIndexCtrl($http, $uibModal) {
  const vm = this;
  vm.results = [];
  vm.area = null;
  vm.beds = null;
  vm.limit = 10;

  function getProps() {
    $http
      .get('/api/properties', { params: { area: vm.area, minimum_beds: vm.beds, maximum_beds: vm.beds }})
      .then((response) => vm.results = response.data);
  }
  vm.getProps = getProps;

  function loadMore() {
    return vm.limit +=12;
  }
  vm.loadMore = loadMore;

  function openModal(thisProp) {
    $uibModal.open({
      templateUrl: 'js/views/props/show.html',
      controller: 'PropsShowCtrl as propsShow',
      windowClass: 'app-modal-window',
      resolve: {
        selectedProp: () => {
          return thisProp;
        }
      }
    });
  }
  vm.openModal = openModal;
}

PropsShowCtrl.$inject = ['User', 'GroupProperty', '$http', '$stateParams', 'selectedProp', '$uibModalInstance'];
function PropsShowCtrl(User, GroupProperty, $http, $stateParams, selectedProp, $uibModalInstance){
  const vm = this;
  vm.selected = selectedProp;

  function storeProp() {
    const newProperty = {
      listingId: vm.selected.listing_id
    };

    GroupProperty
      .save(newProperty)
      .$promise
      .then(() => vm.newProperty = {});
  }
  vm.store = storeProp;

  function closeModal() {
    $uibModalInstance.close();
  }
  vm.closeModal = closeModal;
}
