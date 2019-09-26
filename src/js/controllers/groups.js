angular
  .module('pncApp')
  .controller('GroupsIndexCtrl', GroupsIndexCtrl)
  .controller('GroupsNewCtrl', GroupsNewCtrl)
  .controller('GroupsHomeCtrl', GroupsHomeCtrl)
  .controller('GroupsEditCtrl', GroupsEditCtrl)
  .controller('GroupsHomeUserCtrl', GroupsHomeUserCtrl)
  .controller('GroupUserModalCtrl', GroupUserModalCtrl)
  .controller('UserImageModalCtrl', UserImageModalCtrl)
  .controller('GroupsPropsShowCtrl', GroupsPropsShowCtrl);

GroupsIndexCtrl.$inject = ['Group'];
function GroupsIndexCtrl(Group) {
  const vm = this;

  Group
    .query()
    .$promise
    .then((response) => vm.all = response);
}

GroupsNewCtrl.$inject = ['$state', '$auth', '$scope', 'Group', 'User', 'filterFilter', 'ToastAlertService'];
function GroupsNewCtrl($state, $auth, $scope, Group, User, filterFilter, ToastAlertService) {
  const vm = this;

  vm.group       = {};
  vm.group.users = [];
  vm.chosenUsers = [];
  vm.allUsers    = User.query();
  vm.search      = null;

  const authUserId = $auth.getPayload().userId;

  function filterUsers() {
    const params = { username: vm.q };
    vm.filtered = filterFilter(vm.allUsers, params);
  }

  $scope.$watch(() => vm.q, filterUsers);

  vm.addUser = (user) => {
    if(!vm.group.users.includes(user.id) && user.id !== authUserId) vm.group.users.push(user.id);
    if(!vm.chosenUsers.includes(user) && user.id !== authUserId) vm.chosenUsers.push(user);

    vm.q = ''; // reset input value after query
    vm.filtered = {};
  };

  vm.removeUser = (user) => {
    const index = vm.group.users.indexOf(user); // returns -1 if the user isn't found, or it's index otherwise. Can be eplaced by array.indexOf(item) !== -1
    vm.group.users.splice(index, 1);
    vm.chosenUsers.splice(index, 1);
  };

  vm.create = () => {
    if(vm.groupsNewForm.$valid) {
      vm.chosenUsers = [];
      if(!vm.group.users.includes(authUserId)) vm.group.users.push(authUserId); // if logged in user is not in a group or this group, push the user into the group 'object'

      Group
        .save(vm.group)
        .$promise
        .then((group) => {
          $state.go('propertiesIndex');
          return ToastAlertService.customToast(`${group.message}`, 3000, 'success');
        });
    }
  };

  vm.showPreSearchBar = () => {
    return vm.search === null;
  };

  vm.initiateSearch = () => {
    vm.search = '';
  };

  vm.showSearchBar = () => {
    return vm.search !== null;
  };

  vm.endSearch = () => {
    // return vm.search == null;
    vm.search = null;
  };

  vm.submit = () => {
    console.error('Search function not yet implemented');
  };

  // to focus on input element after it appears
  $scope.$watch(() => {
    return document.querySelector('#search-bar:not(.ng-hide)');
  }, function() {
    document.getElementById('search-input').focus();
  });
}

GroupsHomeCtrl.$inject = ['$scope', '$state', '$http', '$auth', 'Group', 'GroupUser', 'GroupProperty', '$stateParams', '$mdDialog', 'ToastAlertService'];
function GroupsHomeCtrl($scope, $state, $http, $auth, Group, GroupUser, GroupProperty, $stateParams, $mdDialog, ToastAlertService) {
  const vm = this;
  const authUserId = $auth.getPayload().userId;

  vm.group      = {};
  vm.listingIds = [];
  vm.toastDelay = 3000;
  // vm.status     = '';

  Group
    .get($stateParams)
    .$promise
    .then((data) => {
      vm.group = data;
      let propIds = [];

      vm.group.properties.forEach((property) => {
        return propIds.push(property.listingId);
      });

      propIds = propIds.join(',');

      if(propIds) {
        $http
          .get('/api/groups/:id/properties', { params: { id: vm.group.id, listingId: propIds } })
          .then((response) => vm.selected = response.data);
      }

      console.log('vm.group', vm.group);
    });

    vm.delete = () => {
      vm.group
        .$remove()
        .then((group) => {
          console.log('group', group);
          $state.go('groupsNew');
          return ToastAlertService.customToast(`${group.message}`, vm.toastDelay, 'success');
        });
    };

    vm.update = () => {
      vm.group
        .$update()
        .then((group) => {
          $state.go('groupsNew');
          return ToastAlertService.customToast(`${group.groupName}`, vm.toastDelay, 'top right', 'success');
        });
    };

    vm.showGroupUser = (user) => {
      $mdDialog.show({
        controller: GroupsHomeUserCtrl,
        controllerAs: 'groupsHomeUser',
        templateUrl: 'js/views/modals/user.html',
        parent: angular.element(document.body),
        targetEvent: user,
        clickOutsideToClose: true,
        fullscreen: false, // Only for -xs, -sm breakpoints.
        // onComplete: afterShowAnimation,
        // locals: { employee: $scope.userName },
        resolve: {
          selectedUser: () => {
            return user;
          }
        }
      });
      // .then((userId) => {
      //   vm.status = `You finished viewing ${userId}.`;
      // }, () => {
      //   vm.status = 'Actions Cancelled';
      // });
    };

    vm.leaveGroup = (user) => {
      GroupUser
        .delete({ id: vm.group.id, userId: user })
        .$promise
        .then((group) => {
          const index = vm.group.users.indexOf(user);
          vm.group.users.splice(index, 1);
          return $state.go('groupsNew');
        });
    };
}

GroupsHomeUserCtrl.$inject = ['$scope', '$mdDialog', 'selectedUser'];
function GroupsHomeUserCtrl($scope, $mdDialog, selectedUser) {
  const vm = this;

  vm.selected = selectedUser;

  vm.hide   = () => $mdDialog.hide();
  vm.cancel = () => $mdDialog.cancel();
  vm.showUserId = (userId) => $mdDialog.hide(userId);
}

GroupsPropsShowCtrl.$inject = ['$stateParams', '$state', '$http', '$scope', '$auth', 'API', 'Group', 'GroupProperty', 'GroupPropertyComment', 'GroupPropertyImage', 'GroupPropertyRating', 'GroupPropertyLike', 'Crimes', '$uibModal', '$mdDialog', 'GeoCoder', '$moment', 'ToastAlertService'];
function GroupsPropsShowCtrl($stateParams, $state, $http, $scope, $auth, API, Group, GroupProperty, GroupPropertyComment, GroupPropertyImage, GroupPropertyRating, GroupPropertyLike, Crimes, $uibModal, $mdDialog, GeoCoder, $moment, ToastAlertService) {
  const vm = this;

  vm.group            = Group.get($stateParams);
  vm.max              = 5;
  vm.isReadonly       = true;
  vm.isReadonlyfalse  = false;
  vm.fullscreen       = false;
  vm.listingLat       = null;
  vm.listingLon       = null;
  vm.latlng           = null;
  vm.listingId        = $stateParams.listing_id;
  vm.loggedInUserId   = $auth.getPayload().userId;
  vm.labels           = ['Anti Social Behaviour', 'Burglary', 'Bike Theft', 'Drugs', 'Robbery', 'Vehicle Crimes', 'Violent Crimes'];
  vm.crimes           = [];
  vm.crimes.crimeData = [];
  vm.toastDelay       = 3000;
  vm.toastStatus      = 'success';

  vm.chartOptions = {
    responsive: true, // set to false to remove responsiveness. Default responsive value is true.
    legend: {
      display: true,
      position: 'right',
      fullWidth: false,
      labels: { fontColor: 'rgb(255, 99, 132)' },
      onClick: (e) => e.stopPropagation(),
    }
  };

  if(vm.group) getGroup();

  function getGroup() {
    Group
      .get($stateParams)
      .$promise
      .then((data) => {
        vm.group = data;
        getGroupProperty();
        vm.prop = vm.group.properties.find(obj => obj.listingId === vm.listingId);
        vm.prop.createdAt = $moment(vm.prop.createdAt).fromNow();
        vm.prop.ratings.forEach((rating) => rating.createdAt = $moment(rating.createdAt).fromNow());
        vm.prop.images.forEach((image) => image.createdAt = $moment(image.createdAt).fromNow());
        vm.prop.comments.forEach((comment) => comment.createdAt = $moment(comment.createdAt).fromNow());
      });
  }

  function getGroupProperty() {
    $http
      .get('/api/groups/:id/properties/:listingId', { params: { id: vm.group.id, listingId: vm.listingId } })
      .then((response) => {
        vm.properties = response.data;
        vm.listingLat = vm.properties.listing[0].latitude;
        vm.listingLon = vm.properties.listing[0].longitude;
        vm.latlng     = `${vm.listingLat},${vm.listingLon}`;
        getPropertyCrimes();
        // getPropertyLocation(vm.listingLat, vm.listingLon);
        // getPropertyCrimes(vm.listingLat, vm.listingLon);
      });
  }

  function getPropertyLocation(lat, lng) {
    console.log('getPropertyLocation --->>', lat, lng);
    if(!vm.listingLat) return false;

    GeoCoder
      .getLocation(lat, lng) // .getLocation(vm.listingLat, vm.listingLon)
      .then((response) => {
        vm.property = response;
        return vm.property;
      });
  }

  function getPropertyCrimes() {
    if(!vm.listingLat) return false;

    Crimes
      .getCrimes(vm.listingLat, vm.listingLon)
      .then((data) => {
        vm.crimes = data;
        return vm.crimes;
      });
  }

  vm.addComment = () => {
    GroupPropertyComment
      .save({ id: vm.group.id, listingId: vm.listingId }, vm.newComment)
      .$promise
      .then((comment) => {
        comment.createdAt = $moment(this.newComment.createdAt).fromNow();
        vm.prop.comments.push(comment);
        vm.newComment = {};
      })
      .then(() => ToastAlertService.customToast('Comment posted', vm.toastDelay, vm.toastStatus));
  };
  vm.deleteComment = (comment) => {
    GroupPropertyComment
      .delete({ id: vm.group.id, listingId: vm.listingId, commentId: comment.id })
      .$promise
      .then(() => {
        const index = vm.prop.comments.indexOf(comment);
        return vm.prop.comments.splice(index, 1);
      })
      .then(() => ToastAlertService.customToast('Commend deleted', vm.toastDelay, vm.toastStatus));
  };

  vm.addImage = () => {
    GroupPropertyImage
      .save({ id: vm.group.id, listingId: vm.listingId }, vm.newImage)
      .$promise
      .then((image) => {
        vm.prop.images.push(image);
        vm.newImage = {};
      })
      .then((image) => ToastAlertService.customToast('Image uploaded', vm.toastDelay, vm.toastStatus));
  };
  vm.deleteImage = (image) => {
    GroupPropertyImage
      .delete({ id: vm.group.id, listingId: vm.listingId, imageId: image.id })
      .$promise
      .then(() => {
        const index = vm.prop.images.indexOf(image);
        return vm.prop.images.splice(index, 1);
      })
      .then(() => ToastAlertService.customToast('Image deleted', vm.toastDelay, vm.toastStatus));
  };

  vm.addRating = () => {
    GroupPropertyRating
      .save({ id: vm.group.id, listingId: vm.listingId }, vm.newRating)
      .$promise
      .then((rating) => {
        vm.prop.ratings.push(rating);
        vm.newRating = {};
      })
      .then((rating) => ToastAlertService.customToast('Rating posted', vm.toastDelay, vm.toastStatus));
  };
  vm.deleteRating = (rating) => {
    GroupPropertyRating
      .delete({ id: vm.group.id, listingId: vm.listingId, ratingId: rating.id })
      .$promise
      .then(() => {
        const index = vm.prop.ratings.indexOf(rating);
        return vm.prop.ratings.splice(index, 1);
      })
      .then(() => ToastAlertService.customToast('Rating deleted', vm.toastDelay, vm.toastStatus));
  };

  vm.deleteProperty = (property) => {
    GroupProperty
      .delete({ id: vm.group.id, listingId: vm.listingId })
      .$promise
      .then(() => {
        const index = vm.group.properties.indexOf(property);
        vm.group.properties.splice(index, 1);
        return $state.go('groupsHome', { id: vm.group.id });
      })
      .then(() => ToastAlertService.customToast(`${property.listing_id} deleted from ${vm.group.groupName} group`, vm.toastDelay, vm.toastStatus));
  };

  vm.showUserImage = (thisImage) => {
    $mdDialog.show({
      controller: UserImageModalCtrl,
      controllerAs: 'userImageModal',
      templateUrl: 'js/views/modals/image.html',
      parent: angular.element(document.body),
      targetEvent: thisImage,
      clickOutsideToClose: true,
      fullscreen: vm.fullscreen,
      resolve: {
        selectedImage: () => {
          return thisImage;
        }
      }
    });
  };
}

UserImageModalCtrl.$inject = ['selectedImage', '$mdDialog'];
function UserImageModalCtrl(selectedImage, $mdDialog) {
  const vm = this;

  vm.selected = selectedImage;

  vm.hide   = () => $mdDialog.hide();
  vm.cancel = () => $mdDialog.cancel();
  vm.showUserId = (userId) => $mdDialog.hide(userId);
}

GroupsEditCtrl.$inject = ['$stateParams', '$auth', '$state', '$scope', 'Group', 'GroupUser', 'User', 'filterFilter', '$uibModal', 'ToastAlertService'];
function GroupsEditCtrl($stateParams, $auth, $state, $scope, Group, GroupUser, User, filterFilter, $uibModal, ToastAlertService) {
  const vm = this;

  vm.group       = Group.get($stateParams);
  vm.allUsers    = User.query();
  vm.groupUsers  = [];
  vm.search      = null;
  vm.toastDelay  = 3000;
  vm.toastStatus = 'success';

  const authUserId = $auth.getPayload().userId;

  Group
    .get($stateParams)
    .$promise
    .then((group) => vm.groupUsers = group.users);

  function filterUsers() {
    const params = { username: vm.q };
    vm.filtered = filterFilter(vm.allUsers, params);
  }

  $scope.$watch(() => vm.q, filterUsers);

  vm.addUser = (user) => {
    GroupUser
      .update({ id: vm.group.id, userId: user.id })
      .$promise
      .then((user) => { // group
        // console.log('------> group <------', user); // group
        // ------> not sure how I'm using the group object query here <------

        user.group = vm.group.id; // <--- OR ---> user.group.push(vm.group.id);

        vm.group.users.push(user); // vm.group.users.push(group);

        // user.group = vm.group.id; // <--- OR ---> user.group.push(vm.group.id);

        vm.q = ''; // reset input value after query
        vm.filtered = {}; // reset filtered so users input list disappear after selecting a add
      });
  };

  vm.removeUser = (user) => {
    GroupUser
      .delete({ id: vm.group.id, userId: user.id })
      .$promise
      .then((group) => {
        const index = vm.group.users.indexOf(user);
        vm.group.users.splice(index, 1);
      });
  };

  vm.update = () => {
    if(vm.groupsEditForm.$valid) {
      vm.group
        .$update()
        .then((group) => {
          console.log('update group', group);
          $state.go('groupsHome', $stateParams);
          ToastAlertService.customToast(`${group.message}`, vm.toastDelay, vm.toastStatus);
        });
    }
  };

  vm.openModal = (thisUser) => {
    $uibModal.open({
      templateUrl: 'js/views/modals/user.html',
      controller: 'GroupUserModalCtrl as groupUsersDelete',
      windowClass: 'app-modal-window',
      animation: true,
      size: 'sm', //modal open size large
      backdrop: 'static', // 'static' - means not to close modal when clicking on background
      keyboard: false,
      resolve: {
        selectedUser: () => {
          return thisUser;
        }
      }
    });
  };

  vm.showPreSearchBar = () => {
    return vm.search === null;
  };

  vm.initiateSearch = () => {
    vm.search = '';
  };

  vm.showSearchBar = () => {
    return vm.search !== null;
  };

  vm.endSearch = () => {
    // return vm.search == null;
    vm.search = null;
  };

  vm.submit = () => {
    console.error('Search function not yet implemented');
  };

  // To focus on input element after it appears
  $scope.$watch(() => {
    return document.querySelector('#search-bar:not(.ng-hide)');
  }, function() {
    document.getElementById('search-input').focus();
  });
}

GroupUserModalCtrl.$inject = ['selectedUser', 'User', 'Group', 'GroupUser', '$uibModalInstance', '$stateParams', '$auth', '$state'];
function GroupUserModalCtrl(selectedUser, User, Group, GroupUser, $uibModalInstance, $stateParams, $auth, $state) {
  const vm = this;

  vm.selected = selectedUser;
  vm.group    = Group.get($stateParams);

  vm.closeModal = () => $uibModalInstance.close(vm.selected);
  vm.cancelModal = () => $uibModalInstance.dismiss(vm.selected);
}
