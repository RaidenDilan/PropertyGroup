const Group = require('../models/group');

function addPropertyRoute(req, res, next) {
  req.body.createdBy = req.user;

  Group
    .findById(req.user.group)
    .exec()
    .then(group => {
      if (!group) return res.notFound('Group not found');

      const property = group.properties.create(req.body);

      group.properties.push(property);

      return group.save((err, success) => {
        if (err) return res.json({ message: 'Could not add property' });
        return res.status(200).json(property);
      });
    })
    .catch(next);
}

function deletePropertyRoute(req, res, next) {
  Group
    .findById(req.params.id)
    .exec()
    .then(group => {
      if (!group) return res.notFound('Group not found');

      const prop = group.properties.find(property => property.listingId === req.params.listingId);

      prop.remove();

      return group.save((err, success) => {
        if (err) return res.json({ message: 'Could not delete property' });
        return res.status(200).json(prop);
      });
    })
    .catch(next);

}

function addPropertyRating(req, res, next) {
  if (req.user) req.body.createdBy = req.user;

  Group
    .findById(req.params.id)
    .populate('users properties.images.createdBy properties.comments.createdBy properties.ratings.createdBy')
    .exec()
    .then(group => {
      if (!group) return res.notFound('Group not found');

      const prop = group.properties.find(property => property.listingId === req.params.listingId);
      const rating = prop.ratings.create(req.body);

      prop.ratings.push(rating);

      return group.save((err, success) => {
        if (err) return res.json({ message: 'Could not add rating' });
        return res.status(200).json(rating);
      });
    })
    .catch(next);
}

function deletePropertyRating(req, res, next) {
  Group
    .findById(req.params.id)
    .exec()
    .then(group => {
      if (!group) return res.notFound('Group not found');

      const prop = group.properties.find(property => property.listingId === req.params.listingId);
      const rating = prop.ratings.id(req.params.ratingId);

      rating.remove();

      return group.save((err, success) => {
        if (err) return res.json({ message: 'Could not delete your rating' });
        return res.status(200).json(rating);
      });
    })
    .catch(next);
}

function addPropertyImage(req, res, next) {
  if (req.file) req.body.file = req.file.filename;
  req.body.createdBy = req.user;

  Group
    .findById(req.params.id)
    .exec()
    .then(group => {
      if (!group) return res.notFound('Group not found');

      const prop = group.properties.find(property => property.listingId === req.params.listingId);
      const image = prop.images.create(req.body);

      prop.images.push(image);

      return group.save((err, success) => {
        if (err) return res.json({ message: 'Could not upload image' });
        return res.status(200).json(image);
      });
    })
    .catch(next);
}

function deletePropertyImage(req, res, next) {
  Group
    .findById(req.params.id)
    .exec()
    .then(group => {
      if (!group) return res.notFound('Group not found');

      const prop = group.properties.find(property => property.listingId === req.params.listingId);
      const image = prop.images.id(req.params.imageId);

      return image.remove((err, success) => {
        if (err) return res.json({ message: 'Could not delete image' });
        group.save();
        return res.status(200).json(success);
      });
    })
    .catch(next);
}

function addPropertyComment(req, res, next) {
  req.body.createdBy = req.user;

  Group
    .findById(req.params.id)
    .exec()
    .then(group => {
      if (!group) return res.notFound('Group not found');

      const prop = group.properties.find(property => property.listingId === req.params.listingId);
      const comment = prop.comments.create(req.body);

      prop.comments.push(comment);

      return group.save((err, success) => {
        if (err) return res.json({ message: 'Could not post comment' });
        return res.status(200).json(comment);
      });
    })
    .catch(next);
}

function deletePropertyComment(req, res, next) {
  Group
    .findById(req.params.id)
    .exec()
    .then(group => {
      if (!group) return res.notFound('Group not found');

      const prop = group.properties.find(property => property.listingId === req.params.listingId);
      const comment = prop.comments.id(req.params.commentId);

      comment.remove();

      return group.save((err, success) => {
        if (err) return res.json({ message: 'Could not delete comment' });
        return res.status(200).json(comment);
      });
    })
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
