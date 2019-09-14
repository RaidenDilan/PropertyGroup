angular
  .module('pncApp')
  .controller('PropertiesIndexCtrl', PropertiesIndexCtrl)
  .controller('PropertiesShowCtrl', PropertiesShowCtrl);

PropertiesIndexCtrl.$inject = ['$scope', '$http', '$uibModal', '$mdDialog', '$moment'];
function PropertiesIndexCtrl($scope, $http, $uibModal, $mdDialog, $moment) {
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

  vm.getProperties = () => {
    if(vm.propertiesIndexForm.$valid) {
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

        vm.propertiesIndexForm.$setUntouched();
        vm.propertiesIndexForm.$setPristine();
      }
  };

  vm.maxNum = (integer) => {
    vm.toShow = integer;
    // console.log('vm.toShow', vm.toShow);
  };

  vm.sortMethod = (sortType) => {
    vm.sortBy = sortType;
  };

  vm.loadMore = () => {
    return vm.limit +=12;
  };

  vm.showResults = () => {
    return vm.results.length !== 0;
  };

  vm.showProperty = (thisProperty) => {
    $mdDialog.show({
      controller: PropertiesShowCtrl,
      controllerAs: 'propsShow',
      templateUrl: 'js/views/properties/show.html',
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

PropertiesShowCtrl.$inject = ['$state', '$auth', 'User', 'GroupProperty', 'selectedProperty', '$mdDialog'];
function PropertiesShowCtrl($state, $auth, User, GroupProperty, selectedProperty, $mdDialog) {
  const vm = this;

  vm.selected = selectedProperty;
  vm.userId   = $auth.getPayload().userId;
  // vm.user     = null;
  // vm.alert    = null;

  User
    .get({ id: vm.userId })
    .$promise
    .then((user) => {
      if(!user) return false;

      vm.user = user;
      return vm.user;
    });

  vm.storeAndView = () => {
    const newProperty = { listingId: vm.selected.listing_id };

    GroupProperty
    .save(newProperty)
    .$promise
    .then(() => {
      $state.go('groupsHome', { id: vm.user.group.id });
      vm.newProperty = {};
    });
  };

  vm.storeAndContinue = () => {
    const newProperty = { listingId: vm.selected.listing_id };

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
