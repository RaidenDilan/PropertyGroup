angular
  .module('pncApp')
  .controller('GroupsIndexCtrl', GroupsIndexCtrl)
  .controller('GroupsNewCtrl', GroupsNewCtrl)
  .controller('GroupsHomeCtrl', GroupsHomeCtrl)
  .controller('GroupsEditCtrl', GroupsEditCtrl)
  .controller('GroupsPropsShowCtrl', GroupsPropsShowCtrl);

GroupsIndexCtrl.$inject = ['Group'];
function GroupsIndexCtrl(Group) {
  const vm = this;
  Group
    .query()
    .$promise
    .then((response) => {
      console.log('response', response);
      vm.all = response;
      console.log('all', vm.all);
    });
  // console.log('ALL', vm.all);
  // console.log('RESOURCE', vm.all[0].resource);


  // vm.myGroups = vm.all..find(obj => obj.listingId === vm.listingId);
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
    // console.log(vm.group);
    // user.group.push(vm.group.id);
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
        .then(() => $state.go('groupsIndex'));
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
      vm.group.properties.forEach((property) => {
        ids.push(property.listingId);
      });

      ids = ids.join(',');

      if(ids) $http.get('/api/groups/:id/properties', { params: { id: vm.group.id, listingId: ids } })
        .then((response) => {
          vm.selected = response.data;
          console.log(vm.selected);
        });
    });

  function groupsDelete() {
    vm.group
      .$remove()
      .then(() => $state.go('groupsIndex'));
  }
  vm.delete = groupsDelete;

}

GroupsPropsShowCtrl.$inject = ['Group', 'GroupProperty','GroupPropertyNote', 'GroupPropertyImage', '$stateParams', '$state', '$http'];
function GroupsPropsShowCtrl(Group, GroupProperty, GroupPropertyNote, GroupPropertyImage, $stateParams, $state, $http) {
  const vm = this;
  vm.listingId = $stateParams.listing_id;
  console.log($stateParams);
  Group.get($stateParams)
    .$promise
    .then((data) => {
      vm.group = data;
      groupsShowProp();
      vm.prop = vm.group.properties.find(obj => obj.listingId === vm.listingId);
      // console.log(vm.thisProp);
    });

  function groupsShowProp(){
    $http.get('/api/groups/:id/properties/:listingId', { params: { id: vm.group.id, listingId: vm.listingId} })
      .then((response) => {
        vm.gps = response.data;
      });
  }
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

  function deleteNote(note){
    GroupPropertyNote
    .delete({ id: vm.group.id, listingId: vm.listingId, noteId: note.id })
        .$promise
        .then(() => {
          const index = vm.prop.notes.indexOf(note);
          vm.prop.notes.splice(index, 1);
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

  function deleteImage(image){
    GroupPropertyImage
    .delete({ id: vm.group.id, listingId: vm.listingId, imageId: image.id })
        .$promise
        .then(() => {
          const index = vm.prop.images.indexOf(image);
          vm.prop.images.splice(index, 1);
        });
  }
  vm.deleteImage = deleteImage;

  function deleteProperty() {
    GroupProperty
    .delete({ listingId: vm.listingId, id: vm.group.id })
    .$promise
    .then(() => {
      $state.go('groupsHome', { id: vm.group.id });
    });
  }
  vm.deleteProperty = deleteProperty;
}

GroupsEditCtrl.$inject = ['Group', 'User', '$stateParams', '$auth', '$state', '$scope', 'filterFilter', 'GroupUser'];
function GroupsEditCtrl(Group, User, $stateParams, $auth, $state, $scope, filterFilter, GroupUser) {
  const vm = this;
  vm.group = Group.get($stateParams);
  // vm.chosenUsers = [];
  vm.allUsers = User.query();
  const authUserId = $auth.getPayload().userId;
  vm.group.users = [];

  Group
    .get($stateParams)
    .$promise
    .then((response) => {
      // vm.chosenUsers = response.users;
      vm.group.users = response.users;
      console.log('vm.chosenUsers', vm.chosenUsers);
      console.log('vm.group.users', vm.group.users);
    });

  function filterUsers() {
    const params = { username: vm.q };
    vm.filtered = filterFilter(vm.allUsers, params);
  }

  $scope.$watch(() => vm.q, filterUsers);

  function addUser(user) {
    GroupUser
      .update({ id: vm.group.id, userId: user.id}, (group) => {
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
    GroupUser
    .delete({ id: vm.group.id, userId: user.id })
        .$promise
        .then(() => {
          const indexGroup = vm.group.users.indexOf(user);
          vm.group.users.splice(indexGroup, 1);
        });
  }
  vm.removeUser = removeUser;

  function groupsUpdate() {
    console.log(vm.group);
    vm.group
      .$update()
      .then(() => $state.go('groupsHome', $stateParams));
  }
  vm.update = groupsUpdate;
}
