const Promise  = require('bluebird');
const Group    = require('../models/group');
// const User     = require('../models/user');

function updatePropertyLike(req, res, next) {
  if(req.user) req.body.user = req.user;

  console.log('updatePropertyLike - req.body --->>>', req.body);
  console.log('req.params ---+--->>>', req.params);

  var query   = req.params.id;
  // var update  = { $set: { likes: req.user.id }}, { new: true };
  var filter  = { arrayFilters: [{ 'prop._id': req.params.likeId }] };
  var options = { upsert: true, new: true, setDefaultsOnInsert: true };

  // var update  = { $push: { 'properties.likes': req.body } };
  // var filter  = { arrayFilters: [{ 'prop._id': req.params.likeId }] };
  // var options = { upsert: true, new: true, setDefaultsOnInsert: true };

  Group
    .findById(req.params.id)
    // .findByIdAndUpdate(req.params.id, { $inc: { 'properties.0.likeCount': -1 }})

    // .findByIdAndUpdate(req.params.id, { $set: { 'properties.0.likes': { user: req.user.id } }}, { upsert: true, new: true })
    // .findByIdAndUpdate(query, update, options) // The $pullAll operator removes all instances of the specified values from an existing array. Unlike the $pull operator that removes elements by specifying a query, $pullAll removes elements that match the listed values.
    // .findOneAndUpdate(query, update, options) // The $pullAll operator removes all instances of the specified values from an existing array. Unlike the $pull operator that removes elements by specifying a query, $pullAll removes elements that match the listed values.
    // .findOneAndUpdate(
    //     // req.params.id
    //     { _id: req.params.id, 'properties.listingId': req.params.listingId, 'likes.id': req.params.likeId },
    //     // { _id: req.params.id, 'properties.listingId': req.params.listingId },
    //     { $set: { 'properties.0.likes': { user: req.user, likeCount: 1 } } },
    //     { upsert: true, new: true }
    //   )

    .populate('users properties.images.createdBy properties.comments.createdBy properties.ratings.createdBy')
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      const prop = group.properties.find((property) => property.listingId === req.params.listingId);
      // const like = prop.likes.find((like) => like.id === req.params.likeId);
      const like = prop.likes.id(req.params.likeId);

      console.log('like ---+++--->>', like);
      // like.user = !like.user;
      like.save();

      // if (!prop.likes.indexOf(req.params.likeId)) {
      //   const like = prop.likes.create(req.body);
      //   prop.likes.push(like); // prop.likes.set(like);
      //   return group.save().then(() => res.json(like));
      // }
      // if (!prop.likes.id(req.params.likeId)) {
      //   const like = prop.likes.create(req.body);
      //   prop.likes.push(like); // prop.likes.set(like);
      //   return group.save().then(() => res.json(like));
      // }
      //
      // if (!req.params.likeId) console.log('!req.params.likeId', !req.params.likeId);
      //
      // const like = prop.likes.find((like) => {
      //   console.log('like.user ----------->>>', like.user);
      //   console.log('req.user.id ----------->>>', req.user.id);
      //   return like.user === req.user.id;
      // });
      // console.log('like ----------->>>', like);
      //
      // if (prop.likes.indexOf(req.params.likeId)) {}
      // const like = prop.likes.id(req.params.likeId);
      // like.user.set(req.user.id);
      // like.user = req.user;
      // prop.likeCount++;
      // like.likeCount = !like.likeCount;
      // prop.likes.push(like);

      return group
        .save()
        .then(() => res.json(like));
    })
    .then(() => res.status(204).end())
    .catch(next);
}

function addPropertyLike(req, res, next) {
  if(req.user) req.body.user = req.user;
  const options = { upsert: true, new: true };

  Group
    .findById(req.params.id)
    // .findByIdAndUpdate(req.params.id, { $inc: { 'properties.0.likeCount': 1 }}, options)
    // .findByIdAndUpdate(req.params.id, { $addToSet: { 'properties.0.likes': req.body }, $inc: { 'properties.0.likeCount': 1 }}, options)
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      const prop = group.properties.find((property) => property.listingId === req.params.listingId);

      if (prop.likes.indexOf(req.user.id) !== -1) {
        console.log('prop.likes.indexOf(req.user.id) !== -1', prop.likes.indexOf(req.user.id) !== -1);
        return res.status(403).json({ message: 'User already cast vote' });
      }

      const like = prop.likes.create(req.body);

      // prop.likeCount[likeId] += 1;
      // prop.likes.push({ user: req.body.user.id });
      if(like) prop.likeCount++;
      prop.likes.push(like);
      prop.markModified('likes');

      return group
        .save()
        .then(() => res.json(like));
    })
    .then(() => res.status(204).end())
    .catch(next);
}

function deletePropertyLike(req, res, next) {
  // const options = { upsert: true, new: true };
  // const action  = req.body.action;
  // const counter = action === 'Like' ? 1 : -1;

  Group
    .findById(req.params.id)
    // .findByIdAndUpdate(req.params.id, { $inc: { 'properties.0.likeCount': -1 }})
    // .findByIdAndUpdate(req.params.id, { $addToSet: { properties.0.likes: req.body }}, options)
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      const prop = group.properties.find((property) => property.listingId === req.params.listingId);
      // const like = prop.likes.find((like) => like.id === req.params.likeId);
      const like = prop.likes.id(req.params.likeId);

      if(like) prop.likeCount--;
      if(like === null || undefined) return res.status(404).json({ like: like, message: 'Like does not exist' });

      like.remove();

      return group
        .save()
        .then(() => res.json(like));
  })
  .then(() => res.status(204).end())
  .catch(next);
}

// Increment the vote number of an option of a poll
// Returns a 403 if the user already voted
function addPropertyVote(req, res) {
  var id          = req.params.id;
  // var optionIndex = req.params.option;
  // var counter     = action === 'Like' ? 1 : -1;
  var userId      = req.user.id;

  Group
    .findById(id, (err, group) => {
      console.log('group', group);
      if (err) return handleError(res, err);
      if (!group) return res.status(404).send('Not Found');

      const prop = group.properties.find((property) => property.listingId === req.params.listingId);
      if (prop.likes.indexOf(userId) !== -1) return res.status(403).send('User already cast vote');

      prop.likes.push(userId);
      // prop.likeCount[optionIndex] = prop.likeCount[optionIndex] + 1;
      // prop.likeCount++;
      prop.markModified('likes');

      prop.save((err, newProperty) => {
        console.log('newProperty', newProperty);
        if (err) return handleError(res, err);
        return res.status(200).json(newProperty);
      });
    });
}

function handleError(res, err) {
  return res.status(500).json(err);
}

function addVote(groupId, listingId, likeId, callback) {
  Group.findById(groupId, function(err, group) {
      if(err) return callback(false);

      const prop = group.properties.find((property) => property.listingId === listingId);

      prop.likes[likeId] += 1;
      prop.markModified('likes');

      return prop.save(function(err) {
        if (err) callback(false);
        return callback(true);
      });
    });
}

module.exports = {
  addLike: addPropertyLike,
  deleteLike: deletePropertyLike,
  updateLike: updatePropertyLike
};
