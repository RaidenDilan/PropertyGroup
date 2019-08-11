const Promise = require('bluebird');
const Group   = require('../models/group');
const User    = require('../models/user');

function indexGroup(req, res, next) {
  Group
    .find()
    // .populate('properties.images.createdBy properties.notes.createdBy properties.rating.createdBy')
    .populate('users')
    .exec()
    .then((groups) => {
      return res.json(groups);
    })
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
  req.body.createdBy = req.user;

  Group
    .create(req.body)
    .then((group) => {
      return res.json({ group, status: 200, message: `${group.groupName} created successfully` });
    })
    .catch(next);
}

function updateGroup(req, res, next) {
  Group
    .findById(req.params.id)
    .populate('users')
    .exec()
    .then((group) => {
      // console.log('group *********>>>', group);
      console.log('group.users *********>>>', group.users);

      if(!group) return res.notFound();

      // const members = group.users.find((user) => {
      //   return console.log('user >>>>>>>>>', user);
      //   // return user.id === req.params.userId;
      // });

      for(const field in req.body) {
        group[field] = req.body[field];
      }

      // if(!group.users.includes(req.params.id)) group.users.push(req.params.id);


      // const newUser = members.users.id(req.params.userId);
      // newUser.game();
      // User
      //   .findById(req.params.userId)
      //   .then((user) => {
      //     // user.group = null;
      //     return user.save();
      //   })
      //   .then(() => res.status(204).end())
      //   .catch(next);
      //
      //   return group
      //     .save()
      //     .then(() => {
      //       return res.json(group);
      //     });

      return group
        .save()
        .then(() => {
          return res.json(group);
        });
    })
    .catch(next);
}

function deleteGroup(req, res, next) {
  Group
    .findById(req.params.id)
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound();

      return group
        .remove()
        .then(() => {
          return res.json(group);
          // return res.json({ group, status: 200, message: `${group.groupName} successfully deleted` });
        });
    })
    .then(() => res.status(204).end())
    .catch(next);
}

function addUserToGroup(req, res, next) {
  Group
    // .findById(req.params.id)
    .findByIdAndUpdate(req.params.id, req.user.id, { $pull: { users: req.params.userId } })
    .then((user) => {
      console.log('user ------>', user);
      console.log('user.group ------>', user.group);
      // console.log('group.users ------>', user.users);

      if(!user.group.includes(req.params.id)) {
        console.log('If User is not already in this group', !user.group.includes(req.params.id));
        user.group.push(req.params.id);
      }
      if (!user.group.includes(req.params.id)) {

      }
      return user.save();
    })
    .then((group) => res.json(group))
    .catch(next);
}

function deleteUserFromGroup(req, res, next) {
  Group
    .findByIdAndUpdate(req.params.id, req.user.id, { $pull: { users: req.params.userId } })
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound();

      // const groupUsers = group.users.map((user) => { // .find() || .map()
      //   return user.id === req.params.userId;
      // });

      User
        .findById(req.params.userId)
        .then((user) => {
          user.group = null; // sets user group property to null when deleting user during groupsEdit/groupsNew
          return user.save();
        })
        .then(() => res.status(204).end())
        .catch(next);

      return group
        .save()
        .then(() => {
          return res.json(group);
        });
    })
    .then(() => res.status(204).end())
    .catch(next);
}

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
        .then(() => {
          return res.json(property);
        });
    })
    .catch(next);
}

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
        .then(() => {
          return res.json(prop);
        });
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
      if(!group) return res.notFound();

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      const note = prop.notes.create(req.body);
      prop.notes.push(note);

      return group
        .save()
        .then(() => {
          return res.json(note);
        });
    })
    .catch(next);
}

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
        .then(() => {
          return res.json(note);
        });
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
      if(!group) return res.notFound();

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      const image = prop.images.create(req.body);
      prop.images.push(image);

      return group
        .save()
        .then(() => {
          return res.json(image);
        });
    })
    .catch(next);
}

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
          .then(() => {
            return res.json(image);
          });
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
      if(!group) return res.notFound();

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      const rating = prop.rating.create(req.body);
      prop.rating.push(rating);

      return group
        .save()
        .then(() => {
          return res.json(rating);
        });
    })
    .catch(next);
}

function deletePropertyRating(req, res, next) {
  Group
    .findById(req.params.id)
    // .populate('users properties.images.createdBy properties.notes.createdBy properties.rating.createdBy')
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
        .then(() => {
          return res.json(rating);
        });
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
