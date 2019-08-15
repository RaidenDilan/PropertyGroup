angular
  .module('pncApp')
  .controller('GroupsIndexCtrl', GroupsIndexCtrl)
  .controller('GroupsNewCtrl', GroupsNewCtrl)
  .controller('GroupsHomeCtrl', GroupsHomeCtrl)
  .controller('GroupsEditCtrl', GroupsEditCtrl)
  .controller('GroupsPropsShowCtrl', GroupsPropsShowCtrl)
  .controller('UserImageModalCtrl', UserImageModalCtrl);

GroupsIndexCtrl.$inject = ['Group'];
function GroupsIndexCtrl(Group) {
  const vm = this;

  Group
    .query()
    .$promise
    .then((response) => vm.all = response);
}

GroupsNewCtrl.$inject = ['Group', 'User', 'filterFilter', '$state', '$auth', '$scope'];
function GroupsNewCtrl(Group, User, filterFilter, $state, $auth, $scope) {
  const vm = this;

  vm.group       = {};
  vm.group.users = [];
  vm.chosenUsers = [];
  vm.allUsers    = User.query();

  const authUserId = $auth.getPayload().userId;

  function filterUsers() {
    // Array: vm.allUsers
    // Params: params variable/obj - const params = { username: vm.q };

    const params = { username: vm.q };
    vm.filtered = filterFilter(vm.allUsers, params);
  }

  // Let’s take a look at the code for $rootscope.watch().
  // This is its signature: function(watchExp, listener, objectEquality, prettyPrintExpression).
  //                      : function(vm.q, filterUsers, objectEquality, prettyPrintExpression).
  // In details, its four parameters:
  $scope.$watch(() => vm.q, filterUsers);

  function addUser(user) {
    if(!vm.group.users.includes(user.id) && user.id !== authUserId) vm.group.users.push(user.id);
    if(!vm.chosenUsers.includes(user) && user.id !== authUserId) vm.chosenUsers.push(user);

    vm.q = ''; // reset input value after query
    vm.filtered = {};
  }
  vm.addUser = addUser;

  function removeUser(user) {
    const index = vm.group.users.indexOf(user); // returns -1 if the user isn't found, or it's index otherwise. Can be eplaced by array.indexOf(item) !== -1
    vm.group.users.splice(index, 1);
    vm.chosenUsers.splice(index, 1);
  }
  vm.removeUser = removeUser;

  function groupsCreate() {
    if(vm.groupsNewForm.$valid) {
      vm.chosenUsers = [];
      if(!vm.group.users.includes(authUserId)) vm.group.users.push(authUserId); // if logged in user is not in a group or this group, push the user into the group 'object'

      Group
        .save(vm.group)
        .$promise
        .then(() => $state.go('propsIndex'));
    }
  }
  vm.create = groupsCreate;
}

GroupsHomeCtrl.$inject = ['Group', 'GroupUser', 'GroupProperty', '$stateParams', '$state', '$http', '$auth'];
function GroupsHomeCtrl(Group, GroupUser, GroupProperty, $stateParams, $state, $http, $auth) {
  const vm = this;

  vm.group      = {};
  vm.listingIds = [];

  const authUserId = $auth.getPayload().userId;

  Group.get($stateParams)
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

  function groupsDelete() {
    vm.group
      .$remove()
      .then(() => $state.go('groupsNew'));
  }
  vm.delete = groupsDelete;

  // ---------------------------------------------------------------------------

  // function removeUser(user) {
  //   console.log('vm.group.id ---***--->', vm.group.id);
  //   console.log('authUserId ---***--->', authUserId);
  //
  //   GroupUser
  //     .delete({ id: vm.group.id, userId: authUserId })
  //     .$promise
  //     .then((user) => {
  //       // console.log('GroupUser ---***--->', user);
  //       const index = vm.group.users.indexOf(user);
  //       console.log('index ---***--->', index);
  //       // console.log('vm.group.users ---***--->', vm.group.users);
  //
  //       return vm.group.users.splice(index, 1);
  //     })
  //     .then((user) => $state.go('groupsNew'));
  // }
  // vm.removeUser = removeUser;

  // ---------------------------------------------------------------------------

  // function deleteProperty() {
  //   GroupProperty
  //     .delete({ listingId: vm.listingId, id: vm.group.id })
  //     .$promise
  //     .then(() => $state.go('groupsHome', { id: vm.group.id }));
  // }
  // vm.deleteProperty = deleteProperty;

  // ---------------------------------------------------------------------------

  function groupsUpdate() {
    console.log('vm.group ---***--->>>', vm.group);
    vm.group
      .$update()
      .then(() => $state.go('groupsNew'));
  }
  vm.update = groupsUpdate;
}

GroupsPropsShowCtrl.$inject = ['Group', 'GroupProperty','GroupPropertyNote', 'GroupPropertyImage', 'crimes',  'GroupPropertyRating', '$stateParams', '$state', '$http', '$uibModal', '$scope'];
function GroupsPropsShowCtrl(Group, GroupProperty, GroupPropertyNote, GroupPropertyImage, crimes, GroupPropertyRating, $stateParams, $state, $http, $uibModal, $scope) {
  const vm = this;

  vm.max                 = 5;
  vm.isReadonly          = true;
  vm.isReadonlyfalse     = false;
  vm.listingId           = $stateParams.listing_id;
  vm.listingLat          = null;
  vm.listingLon          = null;
  vm.crimes              = [];
  vm.labels              = ['Anti Social Behaviour', 'Burglary', 'Bike Theft', 'Drugs', 'Robbery', 'Vehicle Crimes', 'Violent Crimes'];
  vm.crimes.pieCrimeData = [];

  Group
    .get($stateParams)
    .$promise
    .then((data) => {
      vm.group = data;
      groupsShowProp();
      vm.prop = vm.group.properties.find(obj => obj.listingId === vm.listingId);
    });

  function groupsShowProp() {
    $http
      .get('/api/groups/:id/properties/:listingId', { params: { id: vm.group.id, listingId: vm.listingId} })
      .then((response) => {
        vm.gps        = response.data;
        vm.listingLat = vm.gps.listing[0].latitude;
        vm.listingLon = vm.gps.listing[0].longitude;
      });
  }

  function getCrimes() {
    if(!vm.listingLat) return false;
    crimes

      .getCrimes(vm.listingLat, vm.listingLon)
      .then((data) => {
        vm.crimes = data;
        return vm.crimes;
      });
  }

  $scope.$watch(() => vm.listingLat, getCrimes);

  function addNote() {
    GroupPropertyNote
      .save({ id: vm.group.id, listingId: vm.listingId }, vm.newNote)
      .$promise
      .then((note) => {
        vm.prop.notes.push(note);
        vm.newNote = {};
      });
  }
  vm.addNote = addNote;

  function deleteNote(note) {
    GroupPropertyNote
      .delete({ id: vm.group.id, listingId: vm.listingId, noteId: note.id })
      .$promise
      .then(() => {
        const index = vm.prop.notes.indexOf(note);
        return vm.prop.notes.splice(index, 1);
      });
  }
  vm.deleteNote = deleteNote;

  function addImage() {
    GroupPropertyImage
      .save({ id: vm.group.id, listingId: vm.listingId }, vm.newImage)
      .$promise
      .then((image) => {
        vm.prop.images.push(image);
        vm.newImage = {};
      });
  }
  vm.addImage = addImage;

  function deleteImage(image) {
    GroupPropertyImage
      .delete({ id: vm.group.id, listingId: vm.listingId, imageId: image.id })
      .$promise
      .then(() => {
        const index = vm.prop.images.indexOf(image);
        return vm.prop.images.splice(index, 1);
      });
  }
  vm.deleteImage = deleteImage;

  function addRating() {
    GroupPropertyRating
      .save({ id: vm.group.id, listingId: vm.listingId }, vm.newRating)
      .$promise
      .then((rating) => {
        vm.prop.rating.push(rating);
        vm.newRating = {};
      });
  }
  vm.addRating = addRating;

  function deleteRating(rating) {
    GroupPropertyRating
      .delete({ id: vm.group.id, listingId: vm.listingId, ratingId: rating.id })
      .$promise
      .then(() => {
        const index = vm.prop.rating.indexOf(rating);
        return vm.prop.rating.splice(index, 1);
      });
  }
  vm.deleteRating = deleteRating;

  function deleteProperty() {
    GroupProperty
      .delete({ listingId: vm.listingId, id: vm.group.id })
      .$promise
      .then(() => $state.go('groupsHome', { id: vm.group.id }));
  }
  vm.deleteProperty = deleteProperty;

  function openModal(thisImage) {
    $uibModal.open({
      templateUrl: 'js/views/modals/images.html',
      controller: 'UserImageModalCtrl as userImage',
      windowClass: 'app-modal-window',
      resolve: {
        selectedImage: () => {
          return thisImage;
        }
      }
    });
  }
  vm.openModal = openModal;
}

UserImageModalCtrl.$inject = ['selectedImage', 'GroupPropertyImage', '$uibModalInstance'];
function UserImageModalCtrl(selectedImage, GroupPropertyImage, $uibModalInstance) {
  const vm = this;

  vm.selected = selectedImage;

  function closeModal() {
    $uibModalInstance.close();
  }
  vm.closeModal = closeModal;
}

GroupsEditCtrl.$inject = ['Group', 'GroupUser', 'User', '$stateParams', '$auth', '$state', '$scope', 'filterFilter'];
function GroupsEditCtrl(Group, GroupUser, User, $stateParams, $auth, $state, $scope, filterFilter) {
  const vm = this;

  vm.group       = Group.get($stateParams);
  vm.allUsers    = User.query();
  vm.group.users = [];
  vm.chosenUsers = [];

  const authUserId = $auth.getPayload().userId;

  Group
    .get($stateParams)
    .$promise
    .then((group) => {
      vm.group.users = group.users;
      vm.chosenUsers = group.users;
    });

  function filterUsers() {
    const params = { username: vm.q };
    vm.filtered = filterFilter(vm.allUsers, params);
  }

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

  function addUser(user) {
    console.log('USER: === INITIAL ===>', user);

    GroupUser
      .update({ id: vm.group.id, userId: user.id })
      .$promise
      .then((group) => {
        vm.group.users.push(user);
        user.group = vm.group.id; // <--- OR ---> user.group.push(vm.group.id);
        vm.q = ''; // reset input value after query
        vm.filtered = {}; // reset filtered so users input list disappear after selecting a add
      });

    /* PREVIOUS VERSION CODE
      GroupUser
        .update({ id: vm.group.id, userId: user.id }, (group) => {
          console.log('addUser : user --->', user);
          console.log('addUser : group --->', group);

          vm.group.users.push(user);
          user.group.push(vm.group.id);

          vm.q = ''; // reset input value after query
          vm.filtered = {};
        });
    */
  }
  vm.addUser = addUser;

  function removeUser(user) {
    GroupUser
      .delete({ id: vm.group.id, userId: user.id })
      .$promise
      .then((group) => {
        const index = vm.group.users.indexOf(user);
        vm.group.users.splice(index, 1);
      });
  }
  vm.removeUser = removeUser;

  function groupsUpdate() {
    if(vm.groupsEditForm.$valid) {
      vm.group
        .$update()
        .then(() => $state.go('groupsHome', $stateParams));
    }
  }
  vm.update = groupsUpdate;
}
