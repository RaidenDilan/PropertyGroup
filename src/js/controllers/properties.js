angular
  .module('groupartyApp')
  .controller('PropertiesIndexCtrl', PropertiesIndexCtrl)
  .controller('PropertiesShowCtrl', PropertiesShowCtrl);

PropertiesIndexCtrl.$inject = ['$scope', '$http', '$mdDialog', '$moment'];
function PropertiesIndexCtrl($scope, $http, $mdDialog, $moment) {
  const vm = this;

  vm.results = [];
  vm.area = null;
  vm.propertyType = null;
  vm.minimumBeds = null;
  vm.maximumBeds = null;
  vm.minimumPrice = null;
  vm.maximumPrice = null;
  vm.maximumPrice = null;
  vm.originEvent = null;
  vm.orderBy = 'price';
  vm.ordering = 'descending';
  vm.sortBy = '-first_published_date'; // Filtering and sorting
  vm.queryLimit = 10; // loadMore Limit
  vm.toShow = 100; // Filtering and sorting --> was 49
  vm.isLoading = false;

  function propertyUpdater(properties) {
    if (typeof (properties) !== 'object') throw new Error('Properties should be an object');
    for (let i = 0; i < properties.length; i++) {
      properties[i].first_published_date = createdOnParser(properties[i].first_published_date);
      // properties[i].price = properties[i].like.length - properties[i].dislike.length;
      // properties[i].popular = properties[i].like + properties[i].dislike;
    }
  }

  // make sense of the timestamps.
  function createdOnParser(data) {
    let str = data.split('T');
    let date = str[0];
    let time = str[1].split('.')[0];
    return `${ date } at ${ time }`;
  }

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
        } })
        .then(response => {
          vm.isLoading = true;
          // propertyUpdater(response.data);
          vm.results = response.data;
        })
        .then(() => {
          // var moment = $moment().format('ddd, hA');
          let x = vm.results.listing;
          for (let i = 0; i < x.length; i++) {
            x[i].sinceWhen = $moment(x[i].first_published_date).fromNow();
          }
          vm.isLoading = false;
        });

      vm.propertiesIndexForm.$setUntouched();
      vm.propertiesIndexForm.$setPristine();
    }
  };

  function toggle() {
    vm.isLoading = !vm.isLoading;
  }
  vm.toggle = toggle;

  function toggleLoading() {
    vm.isLoading = vm.isLoading === false;
  }
  vm.toggleLoading = toggleLoading;

  // $scope.$watch(() => vm.area, getPropertyLocation);
  // $scope.$on('place_changed', (e, place) => $log('place', place));

  vm.openMenu = ($mdMenu, e) => {
    vm.originEvent = e;
    $mdMenu.open(e);
  };

  vm.maxNum = integer => {
    vm.toShow = integer;
  };

  vm.sortMethod = sortType => {
    vm.sortBy = sortType;
  };

  vm.loadMore = () => {
    return vm.queryLimit += 12;
  };

  vm.showResults = () => {
    return vm.results.length !== 0;
  };

  vm.showProperty = thisProperty => {
    $mdDialog.show({
      controller: PropertiesShowCtrl,
      controllerAs: 'propsShow',
      templateUrl: 'js/views/properties/show.html',
      parent: angular.element(document.body),
      targetEvent: thisProperty,
      clickOutsideToClose: true,
      escapeToClose: true,
      fullscreen: false,
      // onComplete: afterShowAnimation,
      resolve: {
        selectedProperty: () => {
          return thisProperty;
        }
      }
    });
  };

  // When the 'enter' animation finishes...
  function afterShowAnimation(scope, element, options) {
    // post-show code here: DOM element focus, etc.
  }
}

PropertiesShowCtrl.$inject = ['$state', '$auth', 'User', 'GroupProperty', 'selectedProperty', '$mdDialog', 'ToastAlertService'];
function PropertiesShowCtrl($state, $auth, User, GroupProperty, selectedProperty, $mdDialog, ToastAlertService) {
  const vm = this;

  vm.selected = selectedProperty;
  vm.toastDelay = 2000;
  vm.toastStatus = 'success';

  const authUserId = $auth.getPayload().userId;

  User
    .get({ id: authUserId })
    .$promise
    .then(user => {
      if (!user) return false;
      vm.user = user;
    });

  vm.storeAndView = () => {
    const newProperty = { listingId: vm.selected.listing_id };

    GroupProperty
      .save(newProperty)
      .$promise
      .then(property => {
        $state.go('groupsHome', { id: vm.user.group.id });
        vm.newProperty = {};
      });

    ToastAlertService.customToast(`${ newProperty.listingId } stored in ${ vm.user.group.groupName } group`, vm.toastDelay, vm.toastStatus);
  };

  vm.storeAndContinue = () => {
    const newProperty = { listingId: vm.selected.listing_id };

    GroupProperty
      .save(newProperty)
      .$promise
      .then(() => {
        vm.newProperty = {};
      });

    ToastAlertService.customToast(`${ newProperty.listingId } stored in ${ vm.user.group.groupName } group`, vm.toastDelay, vm.toastStatus);
  };

  vm.hide = () => $mdDialog.hide();

  // vm.hide = () => {
  //   $mdDialog.hide(alert, 'finished');
  //   alert = undefined;
  // };
}
