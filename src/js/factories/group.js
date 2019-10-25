angular
  .module('groupartyApp')
  .factory('Group', Group)
  .factory('GroupUser', GroupUser)
  .factory('GroupProperty', GroupProperty)
  // .factory('GroupPropertyLike', GroupPropertyLike)
  .factory('GroupPropertyImage', GroupPropertyImage)
  .factory('GroupPropertyRating', GroupPropertyRating)
  .factory('GroupPropertyComment', GroupPropertyComment);

Group.$inject = ['$resource'];
function Group($resource) {
  return new $resource('/api/groups/:id', { id: '@id' }, { update: { method: 'PUT' } });
}

GroupUser.$inject = ['$resource'];
function GroupUser($resource) {
  return new $resource('/api/groups/:id/users/:userId', { id: '@id' }, { update: { method: 'PUT' } });
}

GroupProperty.$inject = ['$resource'];
function GroupProperty($resource) {
  return new $resource('/api/groups/:id/properties/:listingId', { id: '@id' }, { update: { method: 'PUT' } });
}

// GroupPropertyLike.$inject = ['$resource'];
// function GroupPropertyLike($resource) {
//   return new $resource('/api/groups/:id/properties/:listingId/likes/:likeId', { id: '@id' }, {
//     update: {
//       method: 'PUT'
//       // isArray: true
//     }
//   });
// }

GroupPropertyImage.$inject = ['$resource'];
function GroupPropertyImage($resource) {
  return new $resource('/api/groups/:id/properties/:listingId/images/:imageId', { id: '@id' }, { update: { method: 'PUT' } });
}

GroupPropertyRating.$inject = ['$resource'];
function GroupPropertyRating($resource) {
  return new $resource('/api/groups/:id/properties/:listingId/ratings/:ratingId', { id: '@id' }, { update: { method: 'PUT' } });
}

GroupPropertyComment.$inject = ['$resource'];
function GroupPropertyComment($resource) {
  return new $resource('/api/groups/:id/properties/:listingId/comments/:commentId', { id: '@id' }, { update: { method: 'PUT' } });
}
