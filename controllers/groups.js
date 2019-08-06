const Group = require('../models/group');
const User = require('../models/user');

function indexGroup(req, res, next) {
  Group
    .find()
    // .populate('users')
    .populate('users properties.images.createdBy properties.notes.createdBy properties.rating.createdBy')
    .exec()
    .then((groups) => res.json(groups))
    .catch(next);
}

function showGroup(req, res, next) {
  Group
  .findById(req.params.id)
  .populate('users properties.images.createdBy properties.notes.createdBy properties.rating.createdBy')
  .exec()
  .then((group) => {
    if(!group) return res.notFound();
    return res.json(group);
  })
  .catch(next);
}

function createGroup(req, res, next) {
  Group
    .create(req.body)
    .then((group) => res.status(201).json({ group, message: `${group.groupName} created successfully` }))
    .catch(next);
}

function updateGroup(req, res, next) {
  Group
    .findById(req.params.id)
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound();

      for(const field in req.body) {
        group[field] = req.body[field];
      }

      // User
      //   .findById(req.params.id)
      //   .populate('group')
      //   .exec()
      //   .then((user) => {
      //     if(!user) return res.notFound();
      //
      //     // for (const field in req.body) {
      //     //   user[field] = req.body[field];
      //     // }
      //
      //     user.group = null;
      //     return user.save();
      //   })
      //   .then((user) => res.json({ user, message: `${user.username} successfully updated`}))
      //   .catch(next);

      console.log('updateGroup ---***--- USER DELETED');

      return group.save();
    })
    // .then((group) => res.json({ group, message: `${group.groupName} updated successfully` }))
    .then((group) => res.json(group))
    .catch(next);
}

// GROUP - DELETE
function deleteGroup(req, res, next) {
  Group
    .findById(req.params.id)
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound();
      return group.remove();
    })
    .then(() => res.status(204).end())
    .catch(next);
}

// GROUP - ADD USER TO GROUP
function addUserToGroup(req, res, next) {
  Group
    .findById(req.params.id)
    .then((user) => {
      if(!user.group.includes(req.params.id)) user.group.push(req.params.id);
      return user.save();
    })
    .then((group) => res.json({ group, message: `${req.user.username} added to group successfully` }))
    .catch(next);
}

// GROUP - DELETE USER FROM GROUP
function deleteUserFromGroup(req, res, next) {
  console.log('MY GROUP ---***--->', req.params.id);
  console.log('USER ID TO REMOVE ---***--->', req.params.userId);
  console.log('GROUP OWNER ---***--->', req.user.id);

  Group
    // .findByIdAndUpdate(req.user.id, { $pull: { users: req.params.userId } })
    // .findByIdAndUpdate(req.params.id, { $pull: { users: req.params.userId } })
    .findByIdAndUpdate(req.params.id, req.user.id, { $pull: { users: req.params.userId } })
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound();

      // console.log('deleteUserFromGroup ---***--- USER DELETED');
      // console.log('group ---***---<<<', group);
      // console.log('group users ---***---<<<', group.users);

      const users = group.users.find((user) => {
        console.log('users ---***---<<<', user);
        // if (user.id === req.params.userId) user.group = null;
        return user.id === req.params.userId;
      });

      console.log('users ============================', users);
      // const user = users.user.id(req.params.userId);
      // const user = users.user.indexOf(req.params.userId);
      // user.group = null;

      users.save();

      return group
        .save()
        .then(() => res.json({ group, message: `${group} deleted successfully` }));

      // User
      //   .findById(req.params.userId)
      //   .populate('group')
      //   .exec()
      //   .then((user) => {
      //     console.log('USER ---***---)))', user);
      //
      //     if(!user) return res.notFound();
      //
      //     // for (const field in req.body) {
      //     //   user[field] = req.body[field];
      //     // }
      //
      //     user.group = null;
      //     // return user.remove();
      //     return user.save();
      //   })
      //   .then((user) => res.json({ user, message: `${user.username} successfully updated`}));

      // return group.save();
    })
    .then(() => res.status(204).end())
    // .then((group) => res.json(group))
    .catch(next);
}

// PROPERTY - ADD TO GROUP
function addPropertyRoute(req, res, next) {
  req.body.createdBy = req.user;

  Group
    .findById(req.user.group)
    .exec()
    .then((group) => {
      if(!group) return res.notFound();

      const property = group.properties.create(req.body);
      group.properties.push(property);

      return group
        .save()
        .then(() => res.json({ property, message: `property added successfully` }));
    })
    .catch(next);
}

// PROPERTY - DELETE FROM GROUP
function deletePropertyRoute(req, res, next) {
  Group
    .findById(req.user.group)
    .exec()
    .then((group) => {
      if(!group) return res.notFound();

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      prop.remove();

      return group
        .save()
        .then(() => res.json({ group, message: `${group} deleted successfully` }));
    })
    .then(() => res.status(204).end())
    .catch(next);

}

// PROPERTY - ADD NOTE
function addPropertyNote(req, res, next) {
  req.body.createdBy = req.user;
  Group
    .findById(req.params.id)
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound();

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      const note = prop.notes.create(req.body);
      prop.notes.push(note);

      return group
        .save()
        .then(() => res.json({ note, message: `${note} added successfully` }));
    })
    .catch(next);
}

// PROPERTY - DELETE NOTE
function deletePropertyNote(req, res, next) {
  Group
    .findById(req.params.id)
    .exec()
    .then((group) => {
      if(!group) return res.notFound();

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      const note = prop.notes.id(req.params.noteId);

      note.remove();

      return group
        .save()
        .then(() => res.json({ note, message: `${note} deleted successfully` }));
    })
    .then(() => res.status(204).end())
    .catch(next);
}

// PROPERTY - ADD IMAGE
function addPropertyImage(req, res, next) {
  req.body.createdBy = req.user;
  if(req.file) req.body.file = req.file.filename;

  Group
    .findById(req.params.id)
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound();

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      const image = prop.images.create(req.body);
      prop.images.push(image);

      return group
        .save()
        .then(() => res.json({ image, message: `${image} added successfully` }));
    })
    .catch(next);
}

// PROPERTY - DELETE IMAGE
function deletePropertyImage(req, res, next) {
  Group
    .findById(req.params.id)
    .exec()
    .then((group) => {
      if(!group) return res.notFound();

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      const image = prop.images.id(req.params.imageId);

      return image
        .remove()
        .then(() => {
          return group
          .save()
          .then(() => res.json({ image, message: `${image} deleted successfully` }));
      });
    })
    .then(() => res.status(204).end())
    .catch(next);
}

// PROPERTY - ADD RATING
function addPropertyRating(req, res, next) {
  req.body.createdBy = req.user;
  Group
    .findById(req.params.id)
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound();

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      const rating = prop.rating.create(req.body);
      prop.rating.push(rating);

      return group
        .save()
        .then(() => res.json({ rating, message: `${rating} added successfully` }));
    })
    .catch(next);
}

// PROPERTY - DELETE RATING
function deletePropertyRating(req, res, next) {
  Group
    .findById(req.params.id)
    .exec()
    .then((group) => {
      if(!group) return res.notFound();

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      const rating = prop.rating.id(req.params.ratingId);
      rating.remove();

      return group
        .save()
        .then(() => res.json({ rating, message: `${rating} deleted successfully` }));
    })
    .then(() => res.status(204).end())
    .catch(next);
}

module.exports = {
  index: indexGroup,
  create: createGroup,
  show: showGroup,
  update: updateGroup,
  addUser: addUserToGroup,
  deleteUser: deleteUserFromGroup,
  delete: deleteGroup,
  addProperty: addPropertyRoute,
  deleteProperty: deletePropertyRoute,
  addNote: addPropertyNote,
  deleteNote: deletePropertyNote,
  addImage: addPropertyImage,
  deleteImage: deletePropertyImage,
  addRating: addPropertyRating,
  deleteRating: deletePropertyRating
};
