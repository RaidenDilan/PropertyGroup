angular
  .module('pncApp')
  .controller('GroupsIndexCtrl', GroupsIndexCtrl)
  .controller('GroupsNewCtrl', GroupsNewCtrl)
  .controller('GroupsHomeCtrl', GroupsHomeCtrl)
  .controller('GroupsEditCtrl', GroupsEditCtrl)
  .controller('GroupsPropsShowCtrl', GroupsPropsShowCtrl)
  .controller('GroupUserModalCtrl', GroupUserModalCtrl)
  .controller('UserImageModalCtrl', UserImageModalCtrl)
  .controller('GroupsHomeUser', GroupsHomeUser);

GroupsIndexCtrl.$inject = ['Group'];
function GroupsIndexCtrl(Group) {
  const vm = this;

  Group
    .query()
    .$promise
    .then((response) => vm.all = response);
}

GroupsNewCtrl.$inject = ['$state', '$auth', '$scope', 'Group', 'User', 'filterFilter'];
function GroupsNewCtrl($state, $auth, $scope, Group, User, filterFilter) {
  const vm = this;

  vm.group       = {};
  vm.group.users = [];
  vm.chosenUsers = [];
  vm.allUsers    = User.query();
  vm.search      = null;

  const authUserId = $auth.getPayload().userId;

  function filterUsers() {
    // Array: vm.allUsers
    // Params: params variable/obj - const params = { username: vm.q };
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
        .then(() => {
          $state.go('propertiesIndex');
          console.log('vm.create group - Array of user Obj ids', vm.group);
        });
    }
  };

  // vm.delete = function(user) {
	// 	vm.chosenUsers.splice(vm.chosenUsers.indexOf(user), 1);
	// };

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

GroupsHomeCtrl.$inject = ['$scope', '$state', '$http', '$auth', 'Group', 'GroupUser', 'GroupProperty', '$stateParams', '$mdDialog'];
function GroupsHomeCtrl($scope, $state, $http, $auth, Group, GroupUser, GroupProperty, $stateParams, $mdDialog) {
  const vm = this;
  const authUserId = $auth.getPayload().userId;

  vm.group      = {};
  vm.listingIds = [];
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
    });

    vm.delete = () => {
      vm.group
        .$remove()
        .then(() => $state.go('groupsNew'));
    };

    vm.update = () => {
      vm.group
        .$update()
        .then(() => $state.go('groupsNew'));
    };

    vm.showGroupUser = (user) => {
      $mdDialog.show({
        controller: GroupsHomeUser,
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

GroupsHomeUser.$inject = ['$scope', '$mdDialog', 'selectedUser'];
function GroupsHomeUser($scope, $mdDialog, selectedUser) {
  const vm = this;

  vm.selected = selectedUser;

  vm.hide   = () => $mdDialog.hide();
  vm.cancel = () => $mdDialog.cancel();
  vm.showUserId = (userId) => $mdDialog.hide(userId);
}

GroupsPropsShowCtrl.$inject = ['$stateParams', '$state', '$http', '$scope', '$auth', 'API', 'Group', 'GroupProperty', 'GroupPropertyNote', 'GroupPropertyImage', 'GroupPropertyRating', 'GroupPropertyLike', 'Crimes', '$uibModal', '$mdDialog', 'GeoCoder', '$moment'];
function GroupsPropsShowCtrl($stateParams, $state, $http, $scope, $auth, API, Group, GroupProperty, GroupPropertyNote, GroupPropertyImage, GroupPropertyRating, GroupPropertyLike, Crimes, $uibModal, $mdDialog, GeoCoder, $moment) {
  const vm = this;

  vm.max                 = 5;
  vm.isReadonly          = true;
  vm.isReadonlyfalse     = false;
  vm.fullscreen          = false;
  vm.listingLat          = null;
  vm.listingLon          = null;
  vm.latlng              = null;
  // vm.userLike            = null;
  vm.listingId           = $stateParams.listing_id;
  vm.loggedInUser        = $auth.getPayload().userId;
  vm.labels              = ['Anti Social Behaviour', 'Burglary', 'Bike Theft', 'Drugs', 'Robbery', 'Vehicle Crimes', 'Violent Crimes'];
  vm.crimes              = [];
  vm.crimes.pieCrimeData = [];
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

  $scope.isVisible = false;

  // vm.isVisible = -1;

  Group
    .get($stateParams)
    .$promise
    .then((data) => {
      vm.group = data;
      getGroupProperty();

      if (vm.group && vm.group.properties.length > 0) vm.prop = vm.group.properties.find(obj => obj.listingId === vm.listingId);
      if (vm.prop && vm.prop.likes.length > 0) vm.userLike = vm.prop.likes.find(obj => {
        // console.log('obj', obj);
        return obj.user === $auth.getPayload().userId;
      });

      console.log('vm.prop.likes', vm.prop.likes);

      // $scope.liked = vm.prop.likes.indexOf(vm.userLike);

      // console.log('indexOf of user: ', vm.prop.likes.indexOf(vm.userLike));
      // console.log('indexOf of user:  === -1', vm.prop.likes.indexOf(vm.userLike) === -1);
      // console.log('indexOf of user: === 0', vm.prop.likes.indexOf(vm.userLike) === 0);
      // console.log('indexOf of user: !== -1', vm.prop.likes.indexOf(vm.userLike) !== -1);
      // console.log('indexOf of user: > -1', vm.prop.likes.indexOf(vm.userLike) > -1);
    });

  // $scope.$watch(() => vm.listingLat, getGroupProperty);
  // $scope.$watch(() => vm.listingLat, getPropertyLocation);
  // $scope.$watch(() => vm.listingLat, getCrimes);
  // $scope.$watch(() => vm.listingLat, getLikes);

  function getGroupProperty() {
    $http
      .get('/api/groups/:id/properties/:listingId', { params: { id: vm.group.id, listingId: vm.listingId } })
      .then((response) => {
        vm.properties = response.data;
        vm.listingLat = vm.properties.listing[0].latitude;
        vm.listingLon = vm.properties.listing[0].longitude;
        vm.latlng     = `${vm.listingLat},${vm.listingLon}`;

        // getPropertyLocation(vm.listingLat, vm.listingLon);
        // getCrimes(vm.listingLat, vm.listingLon);
        getCrimes();
        // getLikes();
      });
  }

  function getPropertyLocation(lat, lng) {
    console.log('getPropertyLocation --->>', lat, lng);
    if(!vm.listingLat) return false;

    GeoCoder
      .getLocation(lat, lng)
      // .getLocation(vm.listingLat, vm.listingLon)
      .then((response) => {
        // console.log('CONTROLLER', response);
        vm.property = response;

        return vm.property;
      });
  }

  function getCrimes() {
    if(!vm.listingLat) return false;

    Crimes
      .getCrimes(vm.listingLat, vm.listingLon)
      .then((data) => {
        vm.crimes = data;
        return vm.crimes;
      });
  }

  $scope.toggle = () => {
    $scope.liked = !$scope.liked;
  };
  // function getLikes() {
  //   // if(!vm.listingLikes) return false;
  //
  //   Group
  //     .get($stateParams)
  //     .$promise
  //     .then((data) => {
  //       vm.group = data;
  //       if (vm.group && vm.group.properties.length > 0) vm.prop = vm.group.properties.find(obj => obj.listingId === vm.listingId);
  //       console.log('32323', vm.userLike);
  //     });
  // }

  // vm.showHide = () => {
  //   console.log('vm.isVisible', vm.isVisible);
  //   if (vm.prop.likes.indexOf(vm.userLike) === -1) vm.isVisible = 0;
  //   else if (vm.prop.likes.indexOf(vm.userLike) === 0) vm.isVisible = -1;
  // };

  vm.addNote = () => {
    GroupPropertyNote
      .save({ id: vm.group.id, listingId: vm.listingId }, vm.newNote)
      .$promise
      .then((note) => {
        note.createdAt = $moment(this.newNote.createdAt).fromNow();
        vm.prop.notes.push(note);
        vm.newNote = {};
      });
  };

  vm.deleteNote = (note) => {
    GroupPropertyNote
      .delete({ id: vm.group.id, listingId: vm.listingId, noteId: note.id })
      .$promise
      .then(() => {
        const index = vm.prop.notes.indexOf(note);
        return vm.prop.notes.splice(index, 1);
      });
  };

  vm.addImage = () => {
    GroupPropertyImage
      .save({ id: vm.group.id, listingId: vm.listingId }, vm.newImage)
      .$promise
      .then((image) => {
        vm.prop.images.push(image);
        vm.newImage = {};
      });
  };

  vm.deleteImage = (image) => {
    GroupPropertyImage
      .delete({ id: vm.group.id, listingId: vm.listingId, imageId: image.id })
      .$promise
      .then(() => {
        const index = vm.prop.images.indexOf(image);
        return vm.prop.images.splice(index, 1);
      });
  };

  vm.addRating = () => {
    GroupPropertyRating
      .save({ id: vm.group.id, listingId: vm.listingId }, vm.newRating)
      .$promise
      .then((rating) => {
        vm.prop.ratings.push(rating);
        vm.newRating = {};
      });
  };

  vm.deleteRating = (rating) => {
    GroupPropertyRating
      .delete({ id: vm.group.id, listingId: vm.listingId, ratingId: rating.id })
      .$promise
      .then(() => {
        const index = vm.prop.ratings.indexOf(rating);
        return vm.prop.ratings.splice(index, 1);
      });
  };

  vm.deleteProperty = (property) => {
    console.log('property', property);
    console.log('vm.group', vm.group);

    // .delete({ listingId: vm.listingId, id: vm.group.id })
    GroupProperty
      .delete({ id: vm.group.id, listingId: vm.listingId })
      .$promise
      .then(() => {
        const index = vm.group.properties.indexOf(property);
        vm.group.properties.splice(index, 1);
        return $state.go('groupsHome', { id: vm.group.id });
      });
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

  vm.addLike = () => {
    if(vm.prop.likes.indexOf(vm.userLike) === -1) {
      GroupPropertyLike
      .save({ id: vm.group.id, listingId: vm.listingId }, $auth.getPayload())
      .$promise
      .then((like) => {
        console.log('addLike --->', like);
        vm.prop.likes.push(like);
        $scope.toggle = true;
        vm.newLike = {};
      });
    }
  };

  vm.deleteLike = (like) => {
    if(vm.prop.likes.indexOf(vm.userLike) !== -1) {
      GroupPropertyLike
        .delete({ id: vm.group.id, listingId: vm.listingId, likeId: like.id })
        .$promise
        .then((like) => {
          console.log('deleteLike --->', like);

          $scope.toggle = false;
          const index = vm.prop.likes.indexOf(like);
          return vm.prop.likes.splice(index, 1);
        });
    }
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

GroupsEditCtrl.$inject = ['$stateParams', '$auth', '$state', '$scope', 'Group', 'GroupUser', 'User', 'filterFilter', '$uibModal'];
function GroupsEditCtrl($stateParams, $auth, $state, $scope, Group, GroupUser, User, filterFilter, $uibModal) {
  const vm = this;

  vm.group       = Group.get($stateParams);
  vm.allUsers    = User.query();
  vm.groupUsers  = [];
  vm.chosenUsers = [];
  vm.search      = null;

  const authUserId = $auth.getPayload().userId;

  Group
    .get($stateParams)
    .$promise
    .then((group) => group.users.forEach((user) => vm.groupUsers.push(user)));

  function filterUsers() {
    const params = { username: vm.q };
    vm.filtered = filterFilter(vm.allUsers, params);
  }

  // Let’s take a look at the code for $rootscope.watch().
  // This is its signature: function(watchExp, listener, objectEquality, prettyPrintExpression).
  //                      : function(vm.q, filterUsers, objectEquality, prettyPrintExpression).
  // In details, its four parameters:
  $scope.$watch(() => vm.q, filterUsers); // $scope.$watchGroup(() => vm.q, filterUsers, true);

  // // Function for searching and filtering through users
  // function filterUsers() {
  //   vm.filtered = filterFilter(vm.all, vm.q);
  //   vm.filtered = orderByFilter(vm.filtered, vm.sort);
  // }

  // $scope.$watchGroup([
  //   () => vm.q,
  //   () => vm.sort
  // ], filterUsers);
  // filterUsers(); // USEAGE in a

  vm.addUser = (user) => {
    GroupUser
      .update({ id: vm.group.id, userId: user.id })
      .$promise
      .then((group) => {
        console.log('------> group <------', group);
        // ------> not sure how I'm using the group object query here <------
        vm.group.users.push(user); // vm.group.users.push(group);
        user.group = vm.group.id; // <--- OR ---> user.group.push(vm.group.id);
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
        .then(() => $state.go('groupsHome', $stateParams));
        // console.log('vm.create group - Array of user Obj ids', vm.group);
        // $rootScope.$broadcast('userAddedToGroup');
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

  // to focus on input element after it appears
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

  // vm.removeUser = (user) => {
  //   console.log('user ===>', user);
  //
  //   GroupUser
  //     .delete({ id: vm.group.id, userId: vm.selected.id })
  //     .$promise
  //     .then((group) => {
  //       const index = vm.group.users.indexOf(user);
  //
  //       vm.group.users.splice(index, 1);
  //
  //       $state.go($state.current, {}, { reload: true });
  //     });
  // };

  vm.closeModal = () => $uibModalInstance.close(vm.selected);

  vm.cancelModal = () => $uibModalInstance.dismiss(vm.selected);
}
