angular
  .module('pncApp')
  .factory('Group', Group)
  .factory('GroupProperty', GroupProperty)
  .factory('GroupPropertyImage', GroupPropertyImage)
  .factory('GroupPropertyNote', GroupPropertyNote);

Group.$inject = ['$resource'];
function Group($resource) {
  return new $resource('/api/groups/:id', { id: '@id' }, {
    update: { method: 'PUT' }
  });
}

GroupProperty.$inject = ['$resource'];
function GroupProperty($resource) {
  return new $resource('/api/groups/:id/properties/:listing_id', { id: '@id' }, {
    update: { method: 'PUT' }
  });
}

GroupPropertyImage.$inject = ['$resource'];
function GroupPropertyImage($resource) {
  return new $resource('/api/groups/:id/properties/:listing_id/images/:imageId', { id: '@id' }, {
    update: { method: 'PUT' }
  });
}

GroupPropertyNote.$inject = ['$resource'];
function GroupPropertyNote($resource) {
  return new $resource('/api/groups/:id/properties/:listing_id/notes/:noteId', { id: '@id' }, {
    update: { method: 'PUT' }
  });
}
