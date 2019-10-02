angular
  .module('pncApp')
  .controller('PropertiesIndexCtrl', PropertiesIndexCtrl)
  .controller('PropertiesShowCtrl', PropertiesShowCtrl);

PropertiesIndexCtrl.$inject = ['$scope', '$http', '$uibModal', '$mdDialog', '$moment'];
function PropertiesIndexCtrl($scope, $http, $uibModal, $mdDialog, $moment) {
  const vm = this;


  vm.results         = [];

  // ZOOPLA DEFAULTS
  vm.area            = null;
  vm.propertyType    = null;
  vm.minimumBeds     = null;
  vm.maximumBeds     = null;
  vm.minimumPrice    = null;
  vm.maximumPrice    = null;
  vm.maximumPrice    = null;
  vm.orderBy         = 'price';
  vm.ordering        = 'descending';

  vm.originatorEvent = null; // Menu functionality
  vm.limit           = 10; // loadMore Limit
  vm.toShow          = 100; // Filtering and sorting - was 49
  vm.sortBy          = '-first_published_date'; // Filtering and  sorting

  vm.getProperties = () => {
    if (vm.propertiesIndexForm.$valid) {
      $http
        .get('/api/properties', { params: {
          area: vm.area,
          property_type: vm.propertyType,
          minimum_beds: vm.minimumBeds,
          maximum_beds: vm.maximumBeds,
          minimum_price: vm.minimumPrice,
          maximum_price: vm.maximumPrice,
          order_by: vm.orderBy,
          ordering: vm.ordering
        }})
        .then((response) => {
          propertyUpdater(response.data);
          vm.results = response.data;
          console.log('vm.results', vm.results);
        })
        .then(() => {
          // var moment = $moment().format('ddd, hA');
          var x = vm.results.listing;
          for (var i = 0; i < x.length; i++) {
            x[i].sinceWhen = $moment(x[i].first_published_date).fromNow();
          }
        });

        vm.propertiesIndexForm.$setUntouched();
        vm.propertiesIndexForm.$setPristine();
    }
  };

  // function getPropertyLocation(lat, lng) {
  //   console.log('getPropertyLocation --->>', lat, lng);
  //   // if(!vm.listingLat) return false;
  //
  //   GeoCoder
  //     .getLocation(lat, lng)
  //     .then((response) => {
  //       console.log('<--- ^ response ^ --->', lat, lng);
  //       vm.property = response;
  //       return vm.property;
  //     });
  // }

  vm.openMenu = ($mdMenu, e) => {
    vm.originatorEvent = e;
    $mdMenu.open(e);
  };

  vm.maxNum = (integer) => {
    vm.toShow = integer;
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
      fullscreen: true,
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
      properties[i].first_published_date = createdOnParser(properties[i].first_published_date);
      // properties[i].price = properties[i].like.length - properties[i].dislike.length;
      // properties[i].popular = properties[i].like + properties[i].dislike;

      // console.log('properties', properties);
      // console.log('first_published_date', properties[i]);
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

PropertiesShowCtrl.$inject = ['$state', '$auth', 'User', 'GroupProperty', 'selectedProperty', '$mdDialog', 'ToastAlertService'];
function PropertiesShowCtrl($state, $auth, User, GroupProperty, selectedProperty, $mdDialog, ToastAlertService) {
  const vm = this;

  vm.selected = selectedProperty;
  vm.toastDelay  = 3000;
  vm.toastStatus = 'success';

  const authUserId = $auth.getPayload().userId;

  User
    .get({ id: authUserId })
    .$promise
    .then((user) => {
      if (!user) return false;
      vm.user = user;
    });

  vm.storeAndView = () => {
    const newProperty = { listingId: vm.selected.listing_id };

    GroupProperty
      .save(newProperty)
      .$promise
      .then((property) => {
        $state.go('groupsHome', { id: vm.user.group.id });
        vm.newProperty = {};
      });

      ToastAlertService.customToast(`${newProperty.listingId} stored in ${vm.user.group.groupName} group`, vm.toastDelay, vm.toastStatus);
  };

  vm.storeAndContinue = () => {
    const newProperty = { listingId: vm.selected.listing_id };

    GroupProperty
      .save(newProperty)
      .$promise
      .then(() => {
        vm.newProperty = {};
      });

      ToastAlertService.customToast(`${newProperty.listingId} stored in ${vm.user.group.groupName} group`, vm.toastDelay, vm.toastStatus);
  };

  vm.hide = () => $mdDialog.hide();

  // vm.hide = () => {
  //   $mdDialog.hide(alert, 'finished');
  //   alert = undefined;
  // };
}
