angular
  .module('gropartyApp')
  .controller('GroupsEditCtrl', GroupsEditCtrl);

GroupsEditCtrl.$inject = ['$stateParams', '$auth', '$state', '$scope', 'Group', 'GroupUser', 'User', 'searchFilter', 'ToastAlertService'];
function GroupsEditCtrl($stateParams, $auth, $state, $scope, Group, GroupUser, User, searchFilter, ToastAlertService, $timeout) {
  const vm = this;

  // vm.group                = Group.get($stateParams);
  vm.groupUsers           = [];
  vm.query                = null;
  vm.toastDelay           = 2000;
  vm.toastStatus          = 'success';
  vm.filteredLength       = 0;
  vm.availableUsersLength = 0;

  const authUserId = $auth.getPayload().userId;

  $scope.$watch(() => vm.query, filterUsers); // $scope.$watch(vm.query, (query) => $scope.filtered = $filter('filter')($scope.availableUsers, query));
  $scope.$watch(watchSearchBar, handleSearchBarChanges); // To focus on input element after it appears

  function fetchGroup() {
    Group
      .get($stateParams)
      .$promise
      .then((group) => {
        vm.group = group;
        vm.groupUsers = [];

        group.users.forEach((user) => (user.id !== authUserId) && (vm.groupUsers.push(user)));
        fetchUsers();
      });
  }

  if (vm.group) fetchGroup();
  fetchGroup();

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

  function filterUsers(query) {
    const params = { username: vm.query };

    vm.filtered = searchFilter(vm.availableUsers, query);
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

  // function pushToArray(array, obj) {
  //   const index = array.findIndex((element) => element.id === obj.id);
  //   if (index === -1) array.push(obj);
  //   else array[index] = obj;
  // }

  vm.addUser = (user) => {
    GroupUser
      .update({ id: vm.group.id, userId: user.id })
      .$promise
      .then((user) => {
        vm.groupUsers.push(user);
        vm.group.users.push(user);

        // if(!vm.group.users.includes(user.id) && user.id !== authUserId) vm.group.users.push(user.id);
        // if(!vm.chosenUsers.includes(user.id) && user.id !== authUserId) vm.chosenUsers.push(user);

        clearFilter();
        fetchGroup();
      });
  };

  vm.removeUser = (user) => {
    GroupUser
      .delete({ id: vm.group.id, userId: user.id })
      .$promise
      .then((group) => {
        const index = vm.groupUsers.indexOf(user);
        const useridx = vm.group.users.indexOf(user);

        vm.groupUsers.splice(index, 1);
        vm.group.users.splice(useridx, 1);

        clearFilter();
        fetchGroup();
      });
  };

  vm.update = () => {
    if (vm.groupsEditForm.$valid) {
      vm.group
        .$update()
        .then((group) => {
          $state.go('groupsHome', $stateParams);
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
