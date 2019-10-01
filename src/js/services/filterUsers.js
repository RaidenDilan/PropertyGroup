angular
  .module('pncApp')
  .filter('smart', smart)
  .filter('group', group);

function smart() {
  return function(input, filterString) {
    if(!filterString) return input;
    if(filterString) filterString = '.*' + filterString.toLowerCase().split(' ').join('.*');

    var regex = new RegExp(filterString, 'i');
    var filteredOutput = [];

    angular.forEach(input, (user) => {
      if(user.group === null) {
        if(regex.test(user.username)) {
          filteredOutput.push(user);
        }
      }
      // if (regex.test(user.username) && regex.test(user.group === null)) filteredOutput.push(user);
    });

    console.log('input --->>>--->>>', input);
    console.log('input.length --->>>--->>>', input.length);

    return filteredOutput;
  };
}

function group() {
  return function(array, query) {
    if(!query || !query.username) return array;

    var filteredUsers = [];

    if(query.username) {
      angular.forEach(array, (user) => {
        // if(user.group && user.group.indexOf(query)>-1) {
        if (user.group === null) filteredUsers.push(user);
      });

      return filteredUsers;
    }
  };
}
