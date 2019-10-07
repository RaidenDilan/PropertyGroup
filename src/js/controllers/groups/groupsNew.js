angular
  .module('pncApp')
  .controller('GroupsNewCtrl', GroupsNewCtrl);

GroupsNewCtrl.$inject = ['$state', '$auth', '$scope', 'Group', 'User', '$filter', 'ToastAlertService'];
function GroupsNewCtrl($state, $auth, $scope, Group, User, $filter, ToastAlertService) {
  const vm = this;

  vm.group                = {};
  vm.group.users          = [];
  vm.chosenUsers          = [];
  vm.query                = null;
  vm.toastDelay           = 2000;
  vm.toastStatus          = 'success';
  vm.filteredLength       = 0;
  vm.availableUsersLength = 0;

  const authUserId = $auth.getPayload().userId;

  if(vm.group) fetchUsers();

  $scope.$watch(() => vm.query, filterUsers);
  $scope.$watch(watchSearchBar, handleSearchBarChanges);

  function fetchUsers() {
    User
      .query()
      .$promise
      .then((users) => {
        vm.availableUsers = [];

        users.forEach((user) => (user.group === null) && (vm.availableUsers.push(user)));
        if (vm.availableUsers.length > 0) vm.availableUsersLength = vm.availableUsers.length;
      });
  }

  function filterUsers() {
    const params = { username: vm.query };

    vm.filtered = $filter('filter')(vm.availableUsers, params);
    if (vm.filtered && vm.filtered.length > 0) vm.filteredLength = vm.filtered.length;
  }

  function clearFilter() {
    vm.query = null; // reset input value after query
    vm.filtered = {}; // reset filtered so users input list disappear after selecting a add

    if (vm.filtered && vm.filtered.length > 0) vm.filteredLength = vm.filtered.length;
    if (vm.availableUsers && vm.availableUsers.length > 0) vm.availableUsersLength = vm.availableUsers.length;
  }

  function watchSearchBar() {
    return document.querySelector('#search-bar:not(.ng-hide)');
  }

  function handleSearchBarChanges() {
    return document.getElementById('search-input').focus();
  }

  vm.addUser = (user) => {
    if(!vm.group.users.includes(user.id) && user.id !== authUserId) vm.group.users.push(user.id);
    if(!vm.chosenUsers.includes(user.id) && user.id !== authUserId) vm.chosenUsers.push(user);

    clearFilter();
  };

  vm.removeUser = (user) => {
    const index   = vm.group.users.indexOf(user);
    const userIdx = vm.chosenUsers.indexOf(user);

    vm.group.users.splice(index, 1);
    vm.chosenUsers.splice(userIdx, 1);

    clearFilter();
  };

  vm.create = () => {
    if(vm.groupsNewForm.$valid) {
      if(!vm.group.users.includes(authUserId)) vm.group.users.push(authUserId);

      Group
        .save(vm.group)
        .$promise
        .then((group) => {
          $state.go('propertiesIndex');
          return ToastAlertService.customToast(`${group.message}`, vm.toastDelay, vm.toastStatus);
        });
    }
  };

  vm.showPreSearchBar = () => {
    return vm.query === null;
  };

  vm.initiateSearch = () => {
    vm.query = '';
  };

  vm.showSearchBar = () => {
    return vm.query !== null;
  };

  vm.endSearch = () => {
    vm.query = null;
  };

  vm.submitSearch = () => {
    // console.log('Search function : Has been disabled');
  };
}
