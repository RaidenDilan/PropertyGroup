const Group = require('../models/group');

function addPropertyRoute(req, res, next) {
  req.body.createdBy = req.user;

  Group
    .findById(req.user.group)
    // .findById(req.params.id) // there is no group id in params as we are calling /api/properties/
    // .findByIdAndUpdate(req.user.group, { $push: { properties: req.body }}, { new: true })
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

function addPropertyRating(req, res, next) {
  if(req.user) req.body.createdBy = req.user;

  Group
    .findById(req.params.id) // .findByIdAndUpdate(req.params.id, { $push: { properties: req.body }}, { new: true })
    .populate('users properties.images.createdBy properties.comments.createdBy properties.ratings.createdBy')
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

function addPropertyImage(req, res, next) {
  if(req.file) req.body.file = req.file.filename;
  req.body.createdBy = req.user;

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

function addPropertyComment(req, res, next) {
  req.body.createdBy = req.user;

  Group
    .findById(req.params.id)
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

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

module.exports = {
  addProperty: addPropertyRoute,
  deleteProperty: deletePropertyRoute,
  addRating: addPropertyRating,
  deleteRating: deletePropertyRating,
  addImage: addPropertyImage,
  deleteImage: deletePropertyImage,
  addComment: addPropertyComment,
  deleteComment: deletePropertyComment
};
