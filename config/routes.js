const router      = require('express').Router();
const secureRoute = require('../lib/secureRoute');
const imageUpload = require('../lib/imageUpload');
const auth        = require('../controllers/auth');
// const oauth       = require('../controllers/oauth');
const users       = require('../controllers/users');
const groups      = require('../controllers/groups');
const properties  = require('../controllers/properties');
// const likes       = require('../controllers/likes');
const crimes      = require('../lib/crimeRoute');
const zooplas     = require('../lib/zooplaRoutes');
const geoCoder    = require('../lib/geoCoderRoutes');

// API
router.route('/location')
  .all(secureRoute)
  .get(geoCoder.getLocation);

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
  .put(groups.update)
  .delete(groups.delete)
  .post(secureRoute, properties.addProperty);

router.route('/groups/:id/users')
  .all(secureRoute)
  .put(groups.addUser);

router.route('/groups/:id/users/:userId')
  .all(secureRoute)
  .delete(groups.deleteUser);

// PROPERTIES
router.route('/groups/:id/properties')
  .all(secureRoute)
  .get(zooplas.selectedProp);

router.route('/groups/:id/properties/:listingId')
  .all(secureRoute)
  .get(zooplas.selectedProp)
  .delete(properties.deleteProperty);

router.route('/groups/:id/properties/:listingId/comments')
  .post(secureRoute, properties.addComment);

router.route('/groups/:id/properties/:listingId/comments/:commentId')
  .delete(secureRoute, properties.deleteComment);

router.route('/groups/:id/properties/:listingId/images')
  .post(secureRoute, imageUpload, properties.addImage);

router.route('/groups/:id/properties/:listingId/images/:imageId')
  .delete(secureRoute, properties.deleteImage);

router.route('/groups/:id/properties/:listingId/ratings')
  .post(secureRoute, properties.addRating);

router.route('/groups/:id/properties/:listingId/ratings/:ratingId')
  .delete(secureRoute, properties.deleteRating);

// router.route('/groups/:id/properties/:listingId/likes')
//   .post(secureRoute, likes.addLike);
//
// router.route('/groups/:id/properties/:listingId/likes/:likeId')
//   .put(secureRoute, likes.updateLike)
//   .delete(secureRoute, likes.deleteLike);

// AUTH
router.route('/login')
  .post(auth.login);

router.route('/register')
  .post(imageUpload, auth.register);

// router.route('/oauth/github')
  // .post(oauth.github);

router.all('/*', (req, res) => res.notFound());

module.exports = router;
