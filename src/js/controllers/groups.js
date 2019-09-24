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
        .then((group) => {
          $state.go('propertiesIndex');
          ToastAlertService.customToast(`${group.message}`, 3000, 'success');
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
          ToastAlertService.customToast(`${group.message}`, vm.toastDelay, 'success');
        });
    };

    vm.update = () => {
      vm.group
        .$update()
        .then((group) => {
          $state.go('groupsNew');
          ToastAlertService.customToast(`${group.groupName}`, vm.toastDelay, 'top right', 'success');
          // ToastAlertService.customToast(`${group.data.message}`, '3000', 'top right');
        });
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

GroupsPropsShowCtrl.$inject = ['$stateParams', '$state', '$http', '$scope', '$auth', 'API', 'Group', 'GroupProperty', 'GroupPropertyComment', 'GroupPropertyImage', 'GroupPropertyRating', 'GroupPropertyLike', 'Crimes', '$uibModal', '$mdDialog', 'GeoCoder', '$moment', 'ToastAlertService'];
function GroupsPropsShowCtrl($stateParams, $state, $http, $scope, $auth, API, Group, GroupProperty, GroupPropertyComment, GroupPropertyImage, GroupPropertyRating, GroupPropertyLike, Crimes, $uibModal, $mdDialog, GeoCoder, $moment, ToastAlertService) {
  const vm = this;

  vm.max              = 5;
  vm.isReadonly       = true;
  vm.isReadonlyfalse  = false;
  vm.fullscreen       = false;
  vm.listingLat       = null;
  vm.listingLon       = null;
  vm.latlng           = null;
  vm.listingId        = $stateParams.listing_id;
  // vm.groupId          = $stateParams.id;
  vm.userLike         = {};
  vm.loggedInUserId   = $auth.getPayload().userId;
  vm.labels           = ['Anti Social Behaviour', 'Burglary', 'Bike Theft', 'Drugs', 'Robbery', 'Vehicle Crimes', 'Violent Crimes'];
  vm.crimes           = [];
  vm.crimes.crimeData = [];
  vm.toastDelay       = 3000;
  vm.toastStatus      = 'success';
  vm.liked            = true;

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

  Group
    .get($stateParams)
    .$promise
    .then((data) => {
      vm.group = data;
      getGroupProperty();

      vm.prop = vm.group.properties.find(obj => obj.listingId === vm.listingId);

      // console.log('group', vm.group);
      // console.log('prop', vm.prop);

      // if(vm.prop.likes.includes($auth.getPayload().userId)) {
      //   console.log('prop.likes.includes($auth.getPayload().userId)', vm.prop.likes.indexOf($auth.getPayload().userId));
      //   vm.userLike = vm.prop.likes.find(obj => obj.user === vm.loggedInUserId);
      //   console.log('vm.userLike', vm.userLike);
      //   // vm.userLike = vm.prop.likes.find(obj => {
      //   //   if (!obj) {
      //   //     console.log('------- NO OBJ -------');
      //   //     vm.newLike = { user: vm.loggedInUserId ? vm.loggedInUserId : null };
      //   //     return vm.newLike;
      //   //   }
      //   //   else {
      //   //     console.log('------- YES OBJ -------');
      //   //     return obj.id === vm.loggedInUserId;
      //   //   }
      //   // });
      // }

      // vm.liked = vm.prop.likes.includes(vm.userLike);
      // vm.liked = vm.prop.likes.indexOf(vm.userLike);
      // console.log('vm.prop --->', vm.prop);
      // console.log('vm.liked --->', vm.liked);
      // console.log('vm.userLike --->', vm.userLike);
    });

  // $scope.$watch(() => vm.listingLat, getGroupProperty);
  // $scope.$watch(() => vm.likeId, getLikes);

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

  vm.toggleLike = (like) => {
    if (!like) {
      console.log('------- DEFAULT LIKE -------', vm.userLike);
      vm.newLike = {};

      GroupPropertyLike
        .save({ id: vm.group.id, listingId: vm.listingId }, vm.newLike)
        .$promise
        .then((like) => {
          console.log('save --->', like);

          like.like = !like.like;
          vm.prop.likeCount++;
          vm.prop.likes.push(like);
          // vm.newLike = {};
          // vm.liked = vm.liked === true ? false : true;
          // like.user = vm.loggedInUserId;
          // vm.prop.likes.push(like);
        });
    } else if(like) {
      console.log('------- LIKED -------', vm.userLike);
      console.log('------- LIKED -------', like);

      GroupPropertyLike
        .update({ id: vm.group.id, listingId: vm.listingId, likeId: like.id })
        .$promise
        .then((like) => {
          console.log('update --->', like);
          like = !liked;
          vm.prop.likeCount++;
          // vm.liked = vm.liked === true ? false : true;
          // like.user = vm.loggedInUserId;
          vm.prop.likes.push(like);
        });
      }
  };

  // vm.addLike = (like) => {
  //   console.log('like --->', like);
  //   // if(vm.prop.likes.includes(vm.likeId) === false) {
  //     GroupPropertyLike
  //       .save({ id: vm.group.id, listingId: vm.listingId }, { user: vm.loggedInUserId })
  //       .$promise
  //       .then((like) => {
  //         console.log('addLike --->', like);
  //         vm.prop.likes.push(like);
  //         vm.liked = false;
  //       });
  //   // }
  // };
  // vm.deleteLike = (like) => {
  //   // if(vm.prop.likes.includes(vm.likeId) === true) {
  //     GroupPropertyLike
  //       .delete({ id: vm.group.id, listingId: vm.listingId, likeId: like.id })
  //       .$promise
  //       .then((like) => {
  //         console.log('deleteLike --->', like);
  //         const index = vm.prop.likes.indexOf(like);
  //         vm.liked = true;
  //         return vm.prop.likes.splice(index, 1);
  //       });
  //   // }
  // };

  vm.addComment = () => {
    GroupPropertyComment
      .save({ id: vm.group.id, listingId: vm.listingId }, vm.newComment)
      .$promise
      .then((comment) => {
        comment.createdAt = $moment(this.newComment.createdAt).fromNow();
        vm.prop.comments.push(comment);
        vm.newComment = {};
      });

    ToastAlertService.customToast('Comment posted', vm.toastDelay, vm.toastStatus);
  };

  vm.deleteComment = (comment) => {
    GroupPropertyComment
      .delete({ id: vm.group.id, listingId: vm.listingId, commentId: comment.id })
      .$promise
      .then(() => {
        const index = vm.prop.comments.indexOf(comment);
        return vm.prop.comments.splice(index, 1);
      });

    ToastAlertService.customToast('Commend deleted', vm.toastDelay, vm.toastStatus);
  };

  vm.addImage = () => {
    GroupPropertyImage
      .save({ id: vm.group.id, listingId: vm.listingId }, vm.newImage)
      .$promise
      .then((image) => {
        vm.prop.images.push(image);
        vm.newImage = {};
      });

    ToastAlertService.customToast('Image uploaded', vm.toastDelay, vm.toastStatus);
  };

  vm.deleteImage = (image) => {
    GroupPropertyImage
      .delete({ id: vm.group.id, listingId: vm.listingId, imageId: image.id })
      .$promise
      .then(() => {
        const index = vm.prop.images.indexOf(image);
        return vm.prop.images.splice(index, 1);
      });

    ToastAlertService.customToast('Image deleted', vm.toastDelay, vm.toastStatus);
  };

  vm.addRating = () => {
    GroupPropertyRating
      .save({ id: vm.group.id, listingId: vm.listingId }, vm.newRating)
      .$promise
      .then((rating) => {
        vm.prop.ratings.push(rating);
        vm.newRating = {};
      });

    ToastAlertService.customToast('Rating posted', vm.toastDelay, vm.toastStatus);
  };

  vm.deleteRating = (rating) => {
    GroupPropertyRating
      .delete({ id: vm.group.id, listingId: vm.listingId, ratingId: rating.id })
      .$promise
      .then(() => {
        const index = vm.prop.ratings.indexOf(rating);
        return vm.prop.ratings.splice(index, 1);
      });

    ToastAlertService.customToast('Rating deleted', vm.toastDelay, vm.toastStatus);
  };

  vm.deleteProperty = (property) => {
    GroupProperty
      .delete({ id: vm.group.id, listingId: vm.listingId })
      .$promise
      .then(() => {
        const index = vm.group.properties.indexOf(property);
        vm.group.properties.splice(index, 1);
        return $state.go('groupsHome', { id: vm.group.id });
      });

    ToastAlertService.customToast(`${property.listing_id} deleted from ${vm.group.groupName} group`, vm.toastDelay, vm.toastStatus);
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

  // function updateVote(listingId, likeId) {
  //   console.log('listingId    - updateVote --->', listingId);
  //   console.log('likeId       - updateVote --->', likeId);
  //   // console.log('vm.listingId - updateVote --->', vm.listingId);
  //   // console.log('$stateParams - updateVote --->', $stateParams);
  //
  //   GroupPropertyLike
  //   .update({ id: vm.group.id, listingId: listingId, likeId: likeId.id })
  //   .$promise
  //   .then((like) => {
  //     console.log('update LIKE --->', like);
  //
  //     like.
  //     like.update({ likeId: likeId }, likeId);
  //
  //     const index = vm.prop.likes.indexOf(like);
  //     return vm.prop.likes.splice(index, 1);
  //   });
  //
  //   GroupPropertyLike
  //   .update({ id: vm.group.id, listingId: listingId, likeId: likeId })
  //   .$promise
  //   .then((vote) => {
  //     console.log('vote', vote);
  //     // vote.articlevotes = likes;
  //     // vote.$update();
  //   });
  //
  //   var vote = GroupPropertyLike
  //   .get({ likeId: vm.likeId.id })
  //   // .update({ id: vm.group.id, listingId: vm.listingId, likeId: vm.likeId })
  //   .$promise
  //   .then((like) => {
  //     console.log('like', like);
  //
  //     vote.property = likes;
  //     console.log('vote.property', vote.property);
  //     vote.$update();
  //   });
  // }
  // vm.upVote = (property) => {
  //   // console.log('property - upVote --->', property);
  //   // property.likes++;
  //   var listingId = vm.listingId;
  //   var likeId    = vm.likeId;
  //   // console.log('likeId    - upVote --->', likeId);
  //   // console.log('listingId - upVote --->', listingId);
  //   updateVote(listingId, likeId);
  // };
  // vm.downVote = (property) => {
  //   // console.log('property - downVote --->', property);
  //   // property.likes--;
  //   var listingId = vm.listingId;
  //   var likeId    = vm.likeId;
  //   // console.log('likeId    - downVote --->', likeId);
  //   // console.log('listingId - downVote --->', listingId);
  //   updateVote(listingId, likeId);
  // };
  // vm.toggle = () => {
  //   vm.liked = !vm.liked;
  // };
  // vm.showHide = () => {
  //   console.log('vm.liked', vm.liked);
  //   if (vm.prop.likes.indexOf(vm.likeId) === -1) vm.liked = 0;
  //   else if (vm.prop.likes.indexOf(vm.likeId) === 0) vm.liked = -1;
  // };

  // vm.hasLike = (like) => {
  //   var indexOfLike = vm.prop.likes.indexOf(like); // or whatever your object is instead of $scope.roles
  //   if (indexOfLike === -1) vm.liked = true;
  //   else vm.liked = false;
  //   return vm.liked;
  // };
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
  // vm.chosenUsers = [];
  vm.search      = null;
  vm.toastDelay  = 3000;
  vm.toastStatus = 'success';

  const authUserId = $auth.getPayload().userId;

  Group
    .get($stateParams)
    .$promise
    .then((group) => {
      // group.users.forEach((user) => vm.groupUsers.push(user));
      vm.groupUsers = group.users;
    });

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
