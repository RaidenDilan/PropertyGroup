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

  vm.group = {};
  vm.group.users = [];
  vm.chosenUsers = [];
  vm.allUsers = User.query();

  const authUserId = $auth.getPayload().userId;

  function filterUsers() {
    const params = { username: vm.q };
    vm.filtered = filterFilter(vm.allUsers, params);
  }

  $scope.$watch(() => vm.q, filterUsers);

  function addUser(user) {
    if(!vm.group.users.includes(user.id) && user.id !== authUserId) vm.group.users.push(user.id);
    if(!vm.chosenUsers.includes(user) && user.id !== authUserId) vm.chosenUsers.push(user);
    vm.filtered = {};
  }
  vm.addUser = addUser;

  function removeUser(user) {
    const index = vm.group.users.indexOf(user);
    vm.group.users.splice(index, 1);
    vm.chosenUsers.splice(index, 1);
  }
  vm.removeUser = removeUser;

  function groupsCreate() {
    if(vm.groupsNewForm.$valid) {
      vm.chosenUsers = [];
      if(!vm.group.users.includes(authUserId)) vm.group.users.push(authUserId);

      Group
        .save(vm.group)
        .$promise
        .then(() => $state.go('propsIndex'));
    }
  }
  vm.create = groupsCreate;
}

GroupsHomeCtrl.$inject = ['Group', '$stateParams', '$state', '$http'];
function GroupsHomeCtrl(Group, $stateParams, $state, $http) {
  const vm = this;

  vm.group = {};
  vm.listingIds = [];

  Group.get($stateParams)
    .$promise
    .then((data) => {
      vm.group = data;

      let ids = [];
      vm.group.properties.forEach((property) => ids.push(property.listingId));

      ids = ids.join(',');

      if(ids) $http
        .get('/api/groups/:id/properties', { params: { id: vm.group.id, listingId: ids } })
        .then((response) => vm.selected = response.data);
    });

  function groupsDelete() {
    vm.group
      .$remove()
      .then(() => $state.go('groupsNew'));
  }
  vm.delete = groupsDelete;
}

GroupsPropsShowCtrl.$inject = ['Group', 'GroupProperty','GroupPropertyNote', 'GroupPropertyImage', 'crimes',  'GroupPropertyRating', '$stateParams', '$state', '$http', '$uibModal', '$scope'];
function GroupsPropsShowCtrl(Group, GroupProperty, GroupPropertyNote, GroupPropertyImage, crimes, GroupPropertyRating, $stateParams, $state, $http, $uibModal, $scope) {
  const vm = this;

  vm.max = 5;
  vm.isReadonly = true;
  vm.isReadonlyfalse = false;
  vm.listingId = $stateParams.listing_id;
  vm.listingLat = null;
  vm.listingLon = null;
  vm.crimes = [];

  vm.labels = ['Anti Social Behaviour', 'Burglary', 'Bike Theft', 'Drugs', 'Robbery', 'Vehicle Crimes', 'Violent Crimes'];
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
        vm.gps = response.data;
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
  vm.chosenUsers = [];
  vm.allUsers    = User.query(); // vm.user = User.get($stateParams);
  vm.group.users = [];

  // console.log('vm.group ---------******------>>>', vm.group);
  // console.log('vm.user', vm.user);

  const authUserId = $auth.getPayload().userId;

  Group
    .get($stateParams)
    .$promise
    .then((response) => {
      vm.chosenUsers = response.users;
      vm.group.users = response.users;
    });

  // User
  //   .get($stateParams)
  //   .$promise
  //   .then((response) => {
  //     vm.chosenUsers = response.users;
  //     vm.group.users = response.users;
  //     console.log('vm.chosenUsers', vm.chosenUsers);
  //     console.log('vm.group.users', vm.group.users);
  //   });

  function filterUsers() {
    const params = { username: vm.q };
    vm.filtered = filterFilter(vm.allUsers, params);
  }

  $scope.$watch(() => vm.q, filterUsers);

  function addUser(user) {
    GroupUser
      .update({ id: vm.group.id, userId: user.id }, (group) => {
        console.log(group);
        vm.group.users.push(user);
        console.log(user);
        user.group.push(vm.group.id);
        // user.group.push(vm.group.id);
        vm.filtered = {};
      });
  }
  vm.addUser = addUser;

  function removeUser(user) {
    // console.log('vm.group.id ---***--->', vm.group.id);
    // console.log('vm.user.id ---***--->', user.id);

    GroupUser
      .delete({ id: vm.group.id, userId: user.id })
      .$promise
      .then((user) => {
        console.log('GroupUser ---***--->', user);

        const indexGroup = vm.group.users.indexOf(user);
        console.log('indexGroup ---***--->', indexGroup);

        vm.group.users.splice(indexGroup, 1);
      });
  }
  vm.removeUser = removeUser;

  function groupsUpdate() {
    console.log('vm.group ---***--->>>', vm.group);

    vm.group
      .$update()
      .then(() => $state.go('groupsHome', $stateParams));
  }
  vm.update = groupsUpdate;
}
