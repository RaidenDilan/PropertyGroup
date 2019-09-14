angular
  .module('pncApp')
  .factory('Group', Group)
  .factory('GroupUser', GroupUser)
  .factory('GroupProperty', GroupProperty)
  .factory('GroupPropertyImage', GroupPropertyImage)
  .factory('GroupPropertyNote', GroupPropertyNote)
  .factory('GroupPropertyLike', GroupPropertyLike)
  // .factory('GroupPropertyUpvote', GroupPropertyUpvote)
  // .factory('GroupPropertyDownvote', GroupPropertyDownvote)
  .factory('GroupPropertyRating', GroupPropertyRating);

Group.$inject = ['$resource'];
function Group($resource) {
  return new $resource('/api/groups/:id', { id: '@id' }, {
    update: { method: 'PUT' }
  });
}

GroupUser.$inject = ['$resource'];
function GroupUser($resource) {
  return new $resource('/api/groups/:id/users/:userId', { id: '@id' }, {
    update: { method: 'PUT' }
  });
}

GroupProperty.$inject = ['$resource'];
function GroupProperty($resource) {
  return new $resource('/api/groups/:id/properties/:listingId', { id: '@id' }, {
    update: { method: 'PUT' }
  });
}

GroupPropertyImage.$inject = ['$resource'];
function GroupPropertyImage($resource) {
  return new $resource('/api/groups/:id/properties/:listingId/images/:imageId', { id: '@id' }, {
    update: { method: 'PUT' }
  });
}

GroupPropertyNote.$inject = ['$resource'];
function GroupPropertyNote($resource) {
  return new $resource('/api/groups/:id/properties/:listingId/notes/:noteId', { id: '@id' }, {
    update: { method: 'PUT' }
  });
}

GroupPropertyRating.$inject = ['$resource'];
function GroupPropertyRating($resource) {
  return new $resource('/api/groups/:id/properties/:listingId/ratings/:ratingId', { id: '@id' }, {
    update: { method: 'PUT' }
  });
}

GroupPropertyLike.$inject = ['$resource'];
function GroupPropertyLike($resource) {
  return new $resource('/api/groups/:id/properties/:listingId/likes/:likeId', { id: '@id' }, {
    update: { method: 'PUT' }
  });
}

// GroupPropertyUpvote.$inject = ['$resource'];
// function GroupPropertyUpvote($resource) {
//   return new $resource('/api/groups/:id/properties/:listingId/upvote', { id: '@id' }, {
//     update: { method: 'PUT' }
//   });
// }
//
// GroupPropertyDownvote.$inject = ['$resource'];
// function GroupPropertyDownvote($resource) {
//   return new $resource('/api/groups/:id/properties/:listingId/downvote', { id: '@id' }, {
//     update: { method: 'PUT' }
//   });
// }
