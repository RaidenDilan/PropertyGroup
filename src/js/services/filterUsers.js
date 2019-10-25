angular
  .module('gropartyApp')
  .filter('search', search);

function search() {
  return function(input, filterString) {
    if(!filterString) return input;
    if(filterString) filterString = '.*' + filterString.toLowerCase().split(' ').join('.*');

    var regex = new RegExp(filterString, 'i');
    var filteredOutput = [];

    angular.forEach(input, (user) => (user.group === null) && (regex.test(user.username)) && (filteredOutput.push(user)));

    // angular.forEach(input, (user) => {
    //   if(user.group === null) {
    //     if(regex.test(user.username)) filteredOutput.push(user);
    //   }
    // });

    return filteredOutput;
  };
}

// function group() {
//   return function(array, query) {
//     if(!query || !query.username) return array;
//
//     var filteredUsers = [];
//
//     if(query.username) {
//       angular.forEach(array, (user) => {
//         // if(user.group && user.group.indexOf(query)>-1) {
//         if (user.group === null) filteredUsers.push(user);
//       });
//
//       return filteredUsers;
//     }
//   };
// }
