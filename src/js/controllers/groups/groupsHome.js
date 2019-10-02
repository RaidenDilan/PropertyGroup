angular
  .module('pncApp')
  .controller('GroupsHomeCtrl', GroupsHomeCtrl)
  .controller('GroupsHomeUserCtrl', GroupsHomeUserCtrl);

GroupsHomeCtrl.$inject = ['$scope', '$state', '$http', 'Group', 'GroupUser', '$stateParams', '$mdDialog', 'ToastAlertService'];
function GroupsHomeCtrl($scope, $state, $http, Group, GroupUser, $stateParams, $mdDialog, ToastAlertService) {
  const vm = this;

  vm.group      = {};
  vm.listingIds = [];
  vm.toastDelay = 3000;

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
        .then((group) => {
          $state.go('groupsNew');
          return ToastAlertService.customToast(`${group.message}`, vm.toastDelay, 'success');
        });
    };

    vm.update = () => {
      vm.group
        .$update()
        .then((group) => {
          $state.go('groupsNew');
          return ToastAlertService.customToast(`${group.groupName}`, vm.toastDelay, 'success');
        });
    };

    vm.groupsUsersShow = (user) => {
      $mdDialog.show({
        controller: GroupsHomeUserCtrl,
        controllerAs: 'groupsHomeUser',
        templateUrl: 'js/views/modals/user.html',
        parent: angular.element(document.body),
        targetEvent: user,
        clickOutsideToClose: true,
        fullscreen: false, // Only for -xs, -sm breakpoints.
        // onComplete: afterShowAnimation,
        // locals: { user: $scope.username },
        resolve: {
          selectedUser: () => {
            return user;
          }
        }
      });
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

GroupsHomeUserCtrl.$inject = ['$scope', 'selectedUser', '$mdDialog'];
function GroupsHomeUserCtrl($scope, selectedUser, $mdDialog) {
  const vm = this;

  vm.selected   = selectedUser;
  vm.hide       = () => $mdDialog.hide();
  vm.cancel     = () => $mdDialog.cancel();
  vm.showUserId = (userId) => $mdDialog.hide(userId);
}
