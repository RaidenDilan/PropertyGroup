const Promise  = require('bluebird');
const Group    = require('../models/group');
const User     = require('../models/user');
// const Property = require('../models/property');
// const Vote    = require('../models/vote');

function addPropertyRoute(req, res, next) {
  req.body.createdBy = req.user.id;
  req.body.group = req.user.group;

  Group
    .findById(req.user.group)
    // .findByIdAndUpdate(req.user.group, { $set: { properties: req.body }}, { new: true })
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      const property = group.properties.create(req.body);
      group.properties.push(property); // group.properties.concat(property); // usePushEach: true, // $push operator with $each instead. This forces the use of $pushAll - MongoDB 3.6
      return group.save().then(() => res.json(property));
    })
    .then(() => res.status(204).end())
    .catch(next);
}

function deletePropertyRoute(req, res, next) {
  Group
    .findById(req.params.id)
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      const prop = group.properties.find((property) => property.listingId === req.params.listingId);
      prop.remove();

      return group
        .save()
        .then(() => res.json(prop));
    })
    .then(() => res.status(204).end())
    .catch(next);

}

function addPropertyComment(req, res, next) {
  if(req.body) req.body.createdBy = req.user;

  Group
    .findById(req.params.id)
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      var query     = req.params.id;
      const options = { new: true, upsert: true };
      const prop = group.properties.find((property) => property.listingId === req.params.listingId);
      const comment = prop.comments.create(req.body);
      prop.comments.push(comment);

      return group
        .save()
        .then(() => res.json(comment));
    })
    .then(() => res.status(204).end())
    .catch(next);
}

function deletePropertyComment(req, res, next) {
  Group
    .findById(req.params.id)
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      const prop = group.properties.find((property) => property.listingId === req.params.listingId);
      const comment = prop.comments.id(req.params.commentId);
      comment.remove();

      return group
        .save()
        .then(() => res.json(comment));
    })
    .then(() => res.status(204).end())
    .catch(next);
}

function addPropertyImage(req, res, next) {
  if(req.body) req.body.createdBy = req.user;
  if(req.file) req.body.file = req.file.filename;

  Group
    .findById(req.params.id)
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      const prop = group.properties.find((property) => property.listingId === req.params.listingId);
      const image = prop.images.create(req.body);
      prop.images.push(image);

      return group
        .save()
        .then(() => res.json(image));
    })
    .then(() => res.status(204).end())
    .catch(next);
}

function deletePropertyImage(req, res, next) {
  Group
    .findById(req.params.id)
    // .populate('users properties.images')
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      const prop = group.properties.find((property) => property.listingId === req.params.listingId);
      const image = prop.images.id(req.params.imageId);

      return image
        .remove()
        .then(() => {
          return group
            .save()
            .then(() => res.json(image));
        });
    })
    .then(() => res.status(204).end())
    .catch(next);
}

function addPropertyRating(req, res, next) {
  if(req.body) req.body.createdBy = req.user;

  Group
    .findById(req.params.id)
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      const prop = group.properties.find((property) => property.listingId === req.params.listingId);
      const rating = prop.ratings.create(req.body);
      prop.ratings.push(rating);

      return group
        .save()
        .then(() => res.json(rating));
    })
    .then(() => res.status(204).end())
    .catch(next);
}

function deletePropertyRating(req, res, next) {
  Group
    .findById(req.params.id)
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      const prop = group.properties.find((property) => property.listingId === req.params.listingId);
      const rating = prop.ratings.id(req.params.ratingId);
      rating.remove();

      return group
        .save()
        .then(() => res.json(rating));
    })
    .then(() => res.status(204).end())
    .catch(next);
}

function addPropertyLike(req, res, next) {
  if (req.body) req.body.user = req.user;
  console.log('addPropertyLike - req.body --->>>', req.body);

  Group
    .findById(req.params.id)
    .exec()
    .then((group) => {
      console.log('addPropertyLike group ---+++--->>>', group);

      if(!group) return res.notFound('Group not found');

      const prop = group.properties.find((property) => property.listingId === req.params.listingId);
      console.log('addPropertyLike prop ---+++--->>>', prop);
      const like = prop.likes.create(req.body);

      // if (like.id === req.params.likeId) {
      // if(prop.likes.indexOf(req.user.id) === -1) {
        console.log('addPropertyLike like ---+++--->>>', like);
        // console.log('ADD VOTE ---------->>>', like.id === req.params.likeId);
        // vote.like = !vote.like; // TOGGLE LIKE NUMERIC VALUE
        // prop.set();
        prop.likes.push(like);

        return group
          .save()
          .then(() => res.json(like));
      // }
    })
    .catch(next);
}

function updatePropertyLike(req, res, next) {
  if(req.body) req.body.user = req.user;
  console.log('updatePropertyLike - req.body --->>>', req.body);

  console.log('req.params ---+--->>>', req.params);

  // var query   = {};
  var query   = req.params.id;
  // var update  = { $set: { likes: req.user.id }}, { new: true };
  var filter  = { arrayFilters: [{ 'prop._id': req.params.likeId }] };
  var options = { upsert: true, new: true, setDefaultsOnInsert: true };

  // var update  = { $push: { 'properties.likes': req.body } };
  // var filter  = { arrayFilters: [{ 'prop._id': req.params.likeId }] };
  // var options = { upsert: true, new: true, setDefaultsOnInsert: true };

  Group
    .findById(req.params.id)
    // .findByIdAndUpdate(req.params.id, { $set: { 'properties.0.likes': { user: req.user.id } }}, { upsert: true, new: true })
    // .findByIdAndUpdate(query, update, options) // The $pullAll operator removes all instances of the specified values from an existing array. Unlike the $pull operator that removes elements by specifying a query, $pullAll removes elements that match the listed values.
    // .findOneAndUpdate(query, update, options) // The $pullAll operator removes all instances of the specified values from an existing array. Unlike the $pull operator that removes elements by specifying a query, $pullAll removes elements that match the listed values.
    // .findOneAndUpdate(
    //   // req.params.id
    //   { _id: req.params.id, 'properties.listingId': req.params.listingId, 'likes.id': req.params.likeId },
    //   // { _id: req.params.id, 'properties.listingId': req.params.listingId },
    //   { $set: { 'properties.0.likes': { user: req.user, likeCount: 1 } } },
    //   { upsert: true, new: true }
    // )
    // .populate('users')
    // .populate('users properties.images.createdBy properties.comments.createdBy properties.ratings.createdBy')
    .exec()
    .then((group) => {
      // console.log('group ---+++--->>>', group);
      if(!group) return res.notFound('Group not found');

      const prop = group.properties.find((property) => property.listingId === req.params.listingId);
      // const like = prop.likes.find((like) => like.id === req.params.likeId);

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

      // if (!req.params.likeId) console.log('!req.params.likeId', !req.params.likeId);

      const like = prop.likes.find((like) => {
        console.log('like.user ----------->>>', like.user);
        console.log('req.user.id ----------->>>', req.user.id);
        return like.user === req.user.id;
      });
      console.log('like ----------->>>', like);

      // if (prop.likes.indexOf(req.params.likeId)) {}
      // const like = prop.likes.id(req.params.likeId);
      // like.user.set(req.user.id);
      // like.user = req.user;
      // prop.likeCount++;
      // like.likeCount = !like.likeCount;
      prop.likes.push(like);

      return group
        .save()
        .then(() => res.json(like));
    })
    // .then((group) => res.json(group))
    // .then(() => res.status(204).end())
    .catch(next);
}

// function deletePropertyLike(req, res, next) {
//   // const options = { new: true, upsert: true };
//   // .findByIdAndUpdate(req.params.id, { $addToSet: { likes: req.body }}, options)
//
//   Group
//     .findById(req.params.id)
//     .populate('users')
//     .exec()
//     .then((group) => {
//       if(!group) return res.notFound('Group not found');
//
//       const prop = group.properties.find((property) => {
//         return property.listingId === req.params.listingId;
//       });
//       const like = prop.likes.id(req.params.likeId);
//
//       if (like.id === req.params.likeId) {
//         console.log('DELETE VOTE ---------->>>', like);
//         like.remove();
//
//         return group
//           .save()
//           .then(() => res.json(like));
//       }
//   })
//   .then(() => res.status(204).end())
//   .catch(next);
// }

module.exports = {
  addProperty: addPropertyRoute,
  deleteProperty: deletePropertyRoute,
  addComment: addPropertyComment,
  deleteComment: deletePropertyComment,
  addImage: addPropertyImage,
  deleteImage: deletePropertyImage,
  addRating: addPropertyRating,
  deleteRating: deletePropertyRating,
  addLike: addPropertyLike,
  // deleteLike: deletePropertyLike,
  updateLike: updatePropertyLike
};

// function addPropertyVote(req, res, next) {
//   req.body.createdBy = req.user.id;
//
//   Group
//     // .findByIdAndUpdate(req.params.id, { $push: { votes: req.body }}, { safe: true, upsert: true })
//     .findById(req.params.id)
//     .populate('users')
//     .exec()
//     .then((group) => {
//       if(!group) return res.notFound('Group not found');
//       // console.log('req.params - addPropertyVote ------>>>', req.params);
//       // console.log('req.body - addPropertyVote ------>>>', req.body);
//       // console.log('group - addPropertyVote ------>>>', group);
//
//       // var like = 0;
//       // var vote = { like: !like, user: req.user.id };
//
//       const property = group.properties.find((property) => {
//         return property.listingId === req.params.listingId;
//       });
//
//       // const userVote = property.votes.create(vote);
//       // property.votes.push(userVote);
//
//       const voted = property.votes.id(req.params.likeId);
//       console.log('voted ===================', voted);
//       voted.like = !voted.like;
//       return group.save().then(() => res.json(voted));
//
//       // const vote = property.votes.id(req.params.likeId); // returns a matching subdocument
//       // console.log('vote --->>>', vote);
//       // vote.like++;
//
//       // if(property.votes.indexOf(req.user.id) === -1) {
//       //   console.log('CONDITION --------------------------->>>', property.votes.indexOf(req.user.id) === -1);
//       //   var vote = { like: !like, user: req.user.id };
//       //   // const userVote = property.votes.create(vote);
//       //   // property.votes.push(userVote);
//       //
//       //   const voted = property.votes.id(req.params.likeId);
//       //   console.log('voted ===================', voted);
//       //   voted.like = !voted.like;
//       //   return group.save();
//       //
//       //   // return group.save().then(() => res.json(voted)); // saves document with subdocuments and triggers validation
//       // }
//       // property.set(req.body); // updates the address while keeping its schema
//       // property.votes = req.body.like; // individual fields can be set directly
//       // console.log('property 2 --->>>', property);
//
//       })
//       // .then((group) => {
//       //   // console.log('group 2 --->>>', group);
//       //   res.json(group);
//       // })
//       .catch(next);
// }
// function addPropertyUpvote(req, res, next) {
//   req.body.createdBy = req.user.id;
//
//   Group
//     .findById(req.params.id)
//     .populate('users')
//     .exec()
//     .then((group) => {
//       const prop = group.properties.find((property) => {
//         return property.listingId === req.params.listingId;
//       });
//
//       if(prop.upvotes.indexOf(req.user.id) === -1) {
//         prop.upvotes.push(req.user.id);
//
//         return group
//           .save()
//           .then((group) => res.json(group));
//       }
//       else if(prop.upvotes.indexOf(req.user.id) !== -1) res.json({ message: `User has voted already` });
//   })
//   .then(() => res.status(204).end())
//   .catch(next);
// }
// function addPropertyDownVote(req, res, next) {
//   Group
//     .findById(req.params.id)
//     .populate('users')
//     .exec()
//     .then((group) => {
//       const prop = group.properties.find((property) => {
//         return property.listingId === req.params.listingId;
//       });
//
//       if(prop.downvotes.indexOf(req.user.id) === -1) {
//         prop.downvotes.push(req.user.id);
//
//         return group
//           .save()
//           .then((group) => res.json(group));
//       }
//       else if(prop.downvotes.indexOf(req.user.id) !== -1) res.json({ message: `User has voted already` });
//   })
//   .then(() => res.status(204).end())
//   .catch(next);
// }

// var query   = {};
// var update  = { like: !like };
// var options = {
//   new: true, // Return the document after updates are applied
//   upsert: true, // Create a document if one isn't found. Required for `setDefaultsOnInsert`
//   setDefaultsOnInsert: true
// };
// return Vote
//   .findOneAndUpdate(query, update, options)
//   // .findByIdAndUpdate(req.params.id, { like: !like }, options)
//   .then((vote) => {
//     console.log('vote 111 ----------->>>', vote);
//     // vote.like = !vote.like;
//     return vote
//       .save()
//       .then((vote) => {
//         console.log('vote 222 ----------->>>', vote);
//         return res.json(vote);
//       });
//   })
//   .catch(next);
