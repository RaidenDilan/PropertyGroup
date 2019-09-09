angular
  .module('pncApp')
  .controller('PropsIndexCtrl', PropsIndexCtrl)
  .controller('PropsShowCtrl', PropsShowCtrl);

PropsIndexCtrl.$inject = ['$scope', '$http', '$uibModal', '$mdDialog', '$moment'];
function PropsIndexCtrl($scope, $http, $uibModal, $mdDialog, $moment) {
  const vm = this;

  vm.results         = [];
  vm.area            = null;
  vm.beds            = null;
  vm.limit           = 10; // loadMore Limit
  vm.fullscreen      = true; // $mdDialog option
  vm.originatorEvent = null; // Menu functionality
  vm.toShow          = 49; // Filtering and  sorting
  vm.sortBy          = '-createdAt'; // Filtering and  sorting

  vm.openMenu = ($mdMenu, e) => {
    // set max number of properties to be shown
    vm.originatorEvent = e;
    $mdMenu.open(e);
    // console.log('vm.originatorEvent', vm.originatorEvent);
  };

  vm.maxNum = (integer) => {
    vm.toShow = integer;
    // console.log('vm.toShow', vm.toShow);
  };

  vm.sortMethod = (sortType) => {
    vm.sortBy = sortType;
    // console.log('vm.sortBy', vm.sortBy);
  };

  vm.getProperties = () => {
    if(vm.propsIndexForm.$valid) {
      $http
        .get('/api/properties', { params: { area: vm.area, minimum_beds: vm.beds, maximum_beds: vm.beds }})
        .then((response) => {
          propertyUpdater(response.data);
          vm.results = response.data;
        })
        .then(() => {
          var x = vm.results;
          // var moment = $moment().format('ddd, hA');

          for (var i = 0; i < x.length; i++) {
            x[i].sinceWhen = $moment(x[i].createdAt).fromNow();
          }
        });

        vm.propsIndexForm.$setUntouched();
        vm.propsIndexForm.$setPristine();
      }
  };

  vm.loadMore = () => {
    return vm.limit +=12;
  };

  vm.showResults = () => {
    return vm.results.length !== 0;
  };

  vm.showProperty = (thisProperty) => {
    $mdDialog.show({
      controller: PropsShowCtrl,
      controllerAs: 'propsShow',
      templateUrl: 'js/views/props/show.html',
      parent: angular.element(document.body),
      targetEvent: thisProperty,
      clickOutsideToClose: true,
      fullscreen: vm.fullscreen || true,
      resolve: {
        selectedProperty: () => {
          return thisProperty;
        }
      }
    });
  };

  function propertyUpdater(properties) {
    if (typeof(properties) !== 'object') throw 'Properties should be an object';
    for (var i = 0; i < properties.length; i++) {
      properties[i].createdAt = createdOnParser(properties[i].createdAt);
      properties[i].price     = properties[i].like.length - properties[i].dislike.length;
      properties[i].popular   = properties[i].like + properties[i].dislike;

      console.log('createdAt', properties[i]);
    }
  }

  // make sense of the timestamps.
  function createdOnParser(data) {
    var str  = data.split('T');
    var date = str[0];
    var time = str[1].split('.')[0];
    return `${date} at ${time}`;
  }
}

PropsShowCtrl.$inject = ['GroupProperty', 'selectedProperty', '$mdDialog'];
function PropsShowCtrl(GroupProperty, selectedProperty, $mdDialog) {
  const vm = this;

  vm.selected = selectedProperty;
  vm.alert    = null;

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

  // vm.hide = () => {
  //   $mdDialog.hide(alert, 'finished');
  //   alert = undefined;
  // };
}
