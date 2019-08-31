const router      = require('express').Router();
const auth        = require('../controllers/auth');
const users       = require('../controllers/users');
const imageUpload = require('../lib/imageUpload');
const oauth       = require('../controllers/oauth');
const groups      = require('../controllers/groups');
const crimes      = require('../lib/crimes');
const secureRoute = require('../lib/secureRoute');
const zooplas     = require('../lib/zooplas');

// API
router.route('/properties')
  .all(secureRoute)
  .get(zooplas.properties);

router.route('/properties/:listingId')
  .all(secureRoute)
  .get(zooplas.selectedProp);

router.route('/crimes')
  .all(secureRoute)
  .get(crimes.getCrimes);

// USERS
router.route('/users')
  .get(users.index);

router.route('/users/:id')
  .all(secureRoute)
  .get(users.show)
  .put(imageUpload, users.update)
  .delete(users.delete);

// GROUPS
router.route('/groups')
  .get(groups.index)
  .post(secureRoute, groups.create);

router.route('/groups/:id')
  .all(secureRoute)
  .get(groups.show)
  .put(groups.update) // we are working on this
  .delete(groups.delete)
  .post(secureRoute, groups.addProperty);

router.route('/groups/:id/users')
  .all(secureRoute)
  .put(groups.addUser);

router.route('/groups/:id/users/:userId')
  .all(secureRoute)
  .delete(groups.deleteUser);

router.route('/groups/:id/properties')
  .all(secureRoute)
  .get(zooplas.selectedProp);

router.route('/groups/:id/properties/:listingId')
  .all(secureRoute)
  .get(zooplas.selectedProp)
  .delete(groups.deleteProperty);

router.route('/groups/:id/properties/:listingId/notes')
  .post(secureRoute, groups.addNote);

router.route('/groups/:id/properties/:listingId/notes/:noteId')
  .delete(secureRoute, groups.deleteNote);

router.route('/groups/:id/properties/:listingId/images')
  .post(secureRoute, imageUpload, groups.addImage);

router.route('/groups/:id/properties/:listingId/images/:imageId')
  .delete(secureRoute, groups.deleteImage);

router.route('/groups/:id/properties/:listingId/ratings')
  .post(secureRoute, groups.addRating);

router.route('/groups/:id/properties/:listingId/ratings/:ratingId')
  .delete(secureRoute, groups.deleteRating);

router.route('/groups/:id/properties/:listingId/like')
  .put(secureRoute, groups.addLike);

router.route('/groups/:id/properties/:listingId/dislike')
  .put(secureRoute, groups.deleteLike);

// AUTH
router.route('/login')
  .post(auth.login);

router.route('/register')
  .post(imageUpload, auth.register);

router.route('/oauth/github')
  .post(oauth.github);

router.all('/*', (req, res) => res.notFound());

module.exports = router;
