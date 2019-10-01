angular
  .module('pncApp')
  .controller('GroupsNewCtrl', GroupsNewCtrl);

GroupsNewCtrl.$inject = ['$state', '$auth', '$scope', 'Group', 'User', 'filterFilter', 'ToastAlertService'];
function GroupsNewCtrl($state, $auth, $scope, Group, User, filterFilter, ToastAlertService) {
  const vm = this;

  vm.group       = {};
  vm.group.users = [];
  vm.chosenUsers = [];
  vm.groupUsers  = User.query();
  vm.search      = null;

  const authUserId = $auth.getPayload().userId;

  function filterUsers() {
    const params = { username: vm.query };
    vm.filtered = filterFilter(vm.groupUsers, params);
  }

  $scope.$watch(() => vm.query, filterUsers);

  vm.addUser = (user) => {
    if(!vm.group.users.includes(user.id) && user.id !== authUserId) vm.group.users.push(user.id);
    if(!vm.chosenUsers.includes(user) && user.id !== authUserId) vm.chosenUsers.push(user);

    vm.query = ''; // reset input value after query
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
    vm.search = null;
    vm.query = '';
  };

  vm.submitSearch = () => {
    console.log('Search function not yet implemented');
  };

  // To focus on input element after it appears
  $scope.$watch(watchSearchBar, handleSearchBarChanges);

  function watchSearchBar(scope) {
    return document.querySelector('#search-bar:not(.ng-hide)');
  }

  function handleSearchBarChanges(newValue, oldValue) {
    return document.getElementById('search-input').focus();
  }
}
