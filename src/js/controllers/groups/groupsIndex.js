angular
  .module('groupartyApp')
  .controller('GroupsIndexCtrl', GroupsIndexCtrl);

GroupsIndexCtrl.$inject = ['Group'];
function GroupsIndexCtrl(Group) {
  const vm = this;

  Group
    .query()
    .$promise
    .then(response => vm.all = response);
}
