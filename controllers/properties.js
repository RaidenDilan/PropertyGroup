const Promise = require('bluebird');
const Group   = require('../models/group');
const User    = require('../models/user');
// const Vote    = require('../models/vote');

function addPropertyRoute(req, res, next) {
  req.body.createdBy = req.user;
  // req.body.groupId   = req.user.group;

  // console.log('req.body', req.body);
  // console.log('req.body.group', req.body.group);
  Group
    // .findById(req.user.group)
    .findByIdAndUpdate(req.user.group, { $addToSet: { properties: req.body }}, { new: true })
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      console.log('req.body', req.body);

      const property = group.properties.create(req.body);
      group.properties.push(property);
      // group.properties.concat(property); // this uses $set so no problems

      return group
        .save()
        .then(() => res.json(property));
    })
    .then(() => res.status(204).end())
    .catch(next);
}

function deletePropertyRoute(req, res, next) {
  // console.log('req.params -------------------', req.params);
  // console.log('req.user.group -------------------', req.user.group);

  Group
    .findById(req.user.group)
    // .findByIdAndRemove(req.params.listingId)
    // .findByIdAndUpdate(req.params.id, { $pull: { properties: req.params.listingId }}, { safe: true, upsert: true })
    // .findByIdAndUpdate(req.user.group, { $pull: { properties: req.params.listingId }}, { multi: true })
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      const property = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      property.remove();

      return group
        .save();
        // .then(() => res.json(property));
    })
    .then(() => res.status(204).end())
    .catch(next);

}

function addPropertyNote(req, res, next) {
  req.body.createdBy = req.user;

  Group
    .findById(req.params.id)
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      const note = prop.notes.create(req.body);
      prop.notes.push(note);

      return group
        .save()
        .then(() => res.json(note));
    })
    .catch(next);
}

function deletePropertyNote(req, res, next) {
  Group
    .findById(req.params.id)
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      const note = prop.notes.id(req.params.noteId);

      note.remove();

      return group
        .save()
        .then(() => res.json(note));
    })
    .then(() => res.status(204).end())
    .catch(next);
}

function addPropertyImage(req, res, next) {
  req.body.createdBy = req.user;
  if(req.file) req.body.file = req.file.filename;

  Group
    .findById(req.params.id)
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      const image = prop.images.create(req.body);
      prop.images.push(image);

      return group
        .save()
        .then(() => res.json(image));
    })
    .catch(next);
}

function deletePropertyImage(req, res, next) {
  Group
    .findById(req.params.id)
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

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
  req.body.createdBy = req.user;

  Group
    .findById(req.params.id)
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      const rating = prop.ratings.create(req.body);
      prop.ratings.push(rating);

      return group
        .save()
        .then(() => res.json(rating));
    })
    .catch(next);
}

function deletePropertyRating(req, res, next) {
  Group
    .findById(req.params.id)
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      const rating = prop.ratings.id(req.params.ratingId);
      rating.remove();

      return group
        .save()
        .then(() => res.json(rating));
    })
    .then(() => res.status(204).end())
    .catch(next);
}

// 1. GET GROUP
// 2. GET PROPERTIES
// 3. FIND SELECTED PROPERTY
// 4. ADD LIKE OR DISLIKE TO PROPERTY

function addPropertyVote(req, res, next) {
  req.body.createdBy = req.user;

  Group
    // .findByIdAndUpdate(req.params.id, { $push: { votes: req.body }}, { safe: true, upsert: true })
    .findById(req.params.id)
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');
      // console.log('req.params - addPropertyVote ------>>>', req.params);
      // console.log('req.body - addPropertyVote ------>>>', req.body);
      // console.log('group - addPropertyVote ------>>>', group);

      // var like = 0;
      // var vote = { like: !like, user: req.user.id };

      const property = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      // const userVote = property.votes.create(vote);
      // property.votes.push(userVote);

      const voted = property.votes.id(req.params.likeId);
      console.log('voted ===================', voted);
      voted.like = !voted.like;
      return group.save().then(() => res.json(voted));

      // const vote = property.votes.id(req.params.likeId); // returns a matching subdocument
      // console.log('vote --->>>', vote);
      // vote.like++;

      // if(property.votes.indexOf(req.user.id) === -1) {
      //   console.log('CONDITION --------------------------->>>', property.votes.indexOf(req.user.id) === -1);
      //   var vote = { like: !like, user: req.user.id };
      //   // const userVote = property.votes.create(vote);
      //   // property.votes.push(userVote);
      //
      //   const voted = property.votes.id(req.params.likeId);
      //   console.log('voted ===================', voted);
      //   voted.like = !voted.like;
      //   return group.save();
      //
      //   // return group.save().then(() => res.json(voted)); // saves document with subdocuments and triggers validation
      // }
      // property.set(req.body); // updates the address while keeping its schema
      // property.votes = req.body.like; // individual fields can be set directly
      // console.log('property 2 --->>>', property);

      })
      // .then((group) => {
      //   // console.log('group 2 --->>>', group);
      //   res.json(group);
      // })
      .catch(next);
}

function addPropertyLike(req, res, next) {
  req.body.createdBy = req.user;
  // console.log('req.params - addPropertyLike --->>>', req.params);
  // console.log('req.body - addPropertyLike --->>>', req.body);
  // console.log('req.user -------- addPropertyLike ---->>>', req.user);

  Group
    .findById(req.params.id)
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      const property = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      if(property.votes.indexOf(req.user.id) === -1) {
        console.log('HAS USER VOTED? - ADD VOTE ---------->>>', property.votes.indexOf(req.user.id) === -1);
      }

      const like = property.votes.create(req.body);

      property.votes.push(like);

      return group
        .save()
        .then(() => res.json(like));
      })
      .catch(next);
}

function deletePropertyLike(req, res, next) {
  req.body.createdBy = req.user;
  // const options = { new: true, upsert: true };
  // .findByIdAndUpdate(req.params.id, { $addToSet: { likes: req.body }}, options)

  Group
    .findById(req.params.id)
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      if(property.votes.indexOf(req.user.id) === -1) {
        console.log('HAS USER VOTED? - DELETE VOTE ---------->>>', property.votes.indexOf(req.user.id) === -1);
      }

      const like = prop.votes.id(req.params.likeId);

      like.remove();

      return group
        .save()
        .then(() => res.json(like));
  })
  .catch(next);
}

// function addPropertyUpvote(req, res, next) {
//   // req.body.createdBy = req.user;
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
//
//   // Group
//   //   .findById(req.params.id)
//   //   // .findByIdAndUpdate(req.params.id, { $addToSet: { downvotes: req.user.id }}, { new: true })
//   //   // .findByIdAndUpdate(req.params.id, { $push: { downvotes: req.user.id }}, { new: true })
//   //   .populate('users properties')
//   //   .exec()
//   //   .then((group) => {
//   //     if(!group) return res.notFound('Group not found');
//   //
//   //     const prop = group.properties.find((property) => {
//   //       return property.listingId === req.params.listingId;
//   //     });
//   //
//   //     if(prop.upvotes.indexOf(req.user.id) === -1) {
//   //       console.log('VOTE ALREADY EXISTS --->', prop.upvotes.indexOf(req.user.id) === -1);
//   //
//   //       const vote = prop.upvotes.create(req.body);
//   //       prop.upvotes.push(vote);
//   //
//   //       return group.save();
//   //
//   //       // return Vote
//   //       //   .create(req.body)
//   //       //   .then((vote) => {
//   //       //     if(!vote) return res.notFound('Vote not found');
//   //       //     // console.log('vote --------------------------->>>>>>>>>', vote);
//   //       //     // prop.upvotes.push(vote);
//   //       //     return res.status(200).json(vote);
//   //       //   })
//   //       //   .catch(next);
//   //     }
//   //     // else res.json({ message: `User already voted` });
//   //   })
//   //   .then(() => res.status(200).json(group))
//   //   // .then(() => res.status(204).end())
//   //   .catch(next);
// }

// function addPropertyDownVote(req, res, next) {
//   // req.body.createdBy = req.user;
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
//
//   // Group
//   //   .findById(req.params.id)
//   //   // .findByIdAndUpdate(req.params.id, { $addToSet: { downvotes: req.user.id }}, { new: true })
//   //   // .findByIdAndUpdate(req.params.id, { $push: { downvotes: req.user.id }}, { new: true })
//   //   .populate('users')
//   //   .exec()
//   //   .then((group) => {
//   //     if(!group) return res.notFound('Group not found');
//   //
//   //     const prop = group.properties.find((property) => {
//   //       return property.listingId === req.params.listingId;
//   //     });
//   //
//   //     const vote = prop.downvotes.create(req.body);
//   //     prop.downvotes.push(vote);
//   //
//   //     return group
//   //       .save()
//   //       .then(() => res.json(vote));
//   //   })
//   //   .then(() => res.status(204).end())
//   //   .catch(next);
// }

module.exports = {
  addProperty: addPropertyRoute,
  deleteProperty: deletePropertyRoute,
  addNote: addPropertyNote,
  deleteNote: deletePropertyNote,
  addImage: addPropertyImage,
  deleteImage: deletePropertyImage,
  addRating: addPropertyRating,
  deleteRating: deletePropertyRating,
  addVote: addPropertyVote,
  addLike: addPropertyLike,
  deleteLike: deletePropertyLike
  // upvote: addPropertyUpvote,
  // downvote: addPropertyDownVote
};































// var query   = {};
// var update  = { like: !like };
// var options = {
//   new: true, // Return the document after updates are applied
//   upsert: true, // Create a document if one isn't found. Required for `setDefaultsOnInsert`
//   setDefaultsOnInsert: true
// };
//
// // console.log('req.params-----------------------', req.params);
// // console.log('req.body-----------------------', req.body);
//
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
// // const prop = group.properties.find((property) => {
// //   return property.listingId === req.params.listingId;
// // });
// //
// // if(prop.upvotes.indexOf(req.user.id) === -1) {
// //   prop.upvotes.push(req.user.id);
// //
// //   return group
// //     .save()
// //     .then((group) => res.json(group));
// // }
// // else if(prop.upvotes.indexOf(req.user.id) !== -1) res.json({ message: `User has voted already` });
// // return res.status(200).json(group);











// Group
//   .findById(req.params.id)
//   // .findByIdAndUpdate(req.params.id, { $addToSet: { downvotes: req.user.id }}, { new: true })
//   // .findByIdAndUpdate(req.params.id, { $push: { downvotes: req.user.id }}, { new: true })
//   .populate('users properties')
//   .exec()
//   .then((group) => {
//     if(!group) return res.notFound('Group not found');
//
//     const prop = group.properties.find((property) => {
//       return property.listingId === req.params.listingId;
//     });
//
//     if(prop.upvotes.indexOf(req.user.id) === -1) {
//       console.log('VOTE ALREADY EXISTS --->', prop.upvotes.indexOf(req.user.id) === -1);
//
//       const vote = prop.upvotes.create(req.body);
//       prop.upvotes.push(vote);
//
//       return group.save();
//
//       // return Vote
//       //   .create(req.body)
//       //   .then((vote) => {
//       //     if(!vote) return res.notFound('Vote not found');
//       //     // console.log('vote --------------------------->>>>>>>>>', vote);
//       //     // prop.upvotes.push(vote);
//       //     return res.status(200).json(vote);
//       //   })
//       //   .catch(next);
//     }
//     // else res.json({ message: `User already voted` });
//   })
//   .then(() => res.status(200).json(group))
//   // .then(() => res.status(204).end())
//   .catch(next);
