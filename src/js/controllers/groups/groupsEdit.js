angular
  .module('pncApp')
  .controller('GroupsEditCtrl', GroupsEditCtrl)
  .controller('GroupsUserModalCtrl', GroupsUserModalCtrl);

GroupsEditCtrl.$inject = ['$stateParams', '$auth', '$state', '$scope', 'Group', 'GroupUser', 'User', 'filterFilter', '$uibModal', 'ToastAlertService', '$filter', '$timeout', '$q', '$log', 'smartFilter', 'groupFilter'];
function GroupsEditCtrl($stateParams, $auth, $state, $scope, Group, GroupUser, User, filterFilter, $uibModal, ToastAlertService, $filter, $timeout, $q, $log, smartFilter, groupFilter) {
  const vm = this;

  vm.group       = Group.get($stateParams);
  // vm.group.users = [];
  vm.groupUsers  = [];
  // vm.availableUsers = [];
  vm.chosenUsers = [];
  vm.states      = '';
  vm.query       = null;
  vm.toastDelay  = 3000;
  vm.toastStatus = 'success';

  const authUserId = $auth.getPayload().userId;

  function fetchUsers() {
    return User
      .query()
      .$promise
      .then((users) => {
        vm.availableUsers = [];

        users.forEach((user) => {
          if(user.group === null) vm.availableUsers.push(user);
        });
      });
  }

  function fetchGroup() {
    return Group
      .get($stateParams)
      .$promise
      .then((group) => {
        vm.groupUsers = [];

        group.users.forEach((user) => (user.id !== authUserId) && (vm.groupUsers.push(user)));

        // group.users.forEach((user) => {
        //   if(user.id !== authUserId) vm.groupUsers.push(user);
        // });
        fetchUsers();
      });
  }

  fetchGroup();

  function filterUsers(query) {
    const params = { username: vm.query };
    vm.filtered = smartFilter(vm.availableUsers, query); // vm.filtered = $filter('filter')(vm.availableUsers, params);
  }

  $scope.$watch(() => vm.query, filterUsers); // $scope.$watch(vm.query, (query) => $scope.filtered = $filter('filter')($scope.availableUsers, query));

  vm.addUser = (user) => {
    GroupUser
      .update({ id: vm.group.id, userId: user.id })
      .$promise
      .then((user) => {
        vm.groupUsers.push(user);
        vm.group.users.push(user);

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
    if(vm.groupsEditForm.$valid) {
      vm.group
        .$update()
        .then((group) => {
          $state.go('groupsHome', $stateParams);
          return ToastAlertService.customToast(`${group.message}`, vm.toastDelay, vm.toastStatus);
        });
    }
  };

  vm.openModal = (thisUser) => {
    $uibModal.open({
      templateUrl: 'js/views/modals/user.html',
      controller: 'GroupsUserModalCtrl as groupUsersDelete',
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
    // console.log('Pre Search Bar : Opened');
    return vm.query === null;
  };

  vm.initiateSearch = () => {
    // console.log('Search Bar : initiated');
    vm.query = '';
  };

  vm.showSearchBar = () => {
    // console.log('Search Bar : Revealed');
    return vm.query !== null;
  };

  vm.endSearch = () => {
    // console.log('Search Bar : Closed');
    vm.query = null;
  };

  vm.submitSearch = () => {
    // console.log('Search function : Has been disabled');
    // filterUsers(); // MANUAL SEARCH
  };

  // vm.setOrder = function(order) {
  //   vm.tagOrder = order;
  // };
  //
  // vm.tagOrder = vm.availableUsers[0];
  //
  function clearFilter() {
    vm.query = null || ''; // reset input value after query
    vm.filtered = {}; // reset filtered so users input list disappear after selecting a add
  }

  // To focus on input element after it appears
  $scope.$watch(watchSearchBar, handleSearchBarChanges);

  function watchSearchBar(scope) {
    return document.querySelector('#search-bar:not(.ng-hide)');
  }

  function handleSearchBarChanges(newValue, oldValue) {
    return document.getElementById('search-input').focus();
  }

  // function pushToArray(array, obj) {
  //   const index = array.findIndex((element) => element.id === obj.id);
  //   if(index === -1) array.push(obj);
  //   else array[index] = obj;
  // }
}

GroupsUserModalCtrl.$inject = ['selectedUser', 'User', 'Group', 'GroupUser', '$uibModalInstance', '$stateParams', '$auth', '$state'];
function GroupsUserModalCtrl(selectedUser, User, Group, GroupUser, $uibModalInstance, $stateParams, $auth, $state) {
  const vm = this;

  vm.selected = selectedUser;
  vm.group    = Group.get($stateParams);

  vm.closeModal = () => $uibModalInstance.close(vm.selected);
  vm.cancelModal = () => $uibModalInstance.dismiss(vm.selected);
}
