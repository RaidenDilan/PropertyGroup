const mongoose = require('mongoose');
const s3       = require('../lib/s3');
const Promise  = require('bluebird');
// const ObjectId = mongoose.Schema.ObjectId;

const userImageSchema = new mongoose.Schema({
  file: { type: String },
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'User' }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

const userNoteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'User' }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

const userRatingSchema = new mongoose.Schema({
  stars: { type: Number, required: true },
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'User' }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

const propertySchema = new mongoose.Schema({
  listingId: { type: String },
  images: [ userImageSchema ],
  notes: [ userNoteSchema ],
  rating: [ userRatingSchema ],
  upvotes: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'User' }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

const groupSchema = new mongoose.Schema({
  properties: [ propertySchema ],
  groupName: { type: String, required: true },
  owner: { type: mongoose.Schema.ObjectId, ref: 'User' }
}, {
  usePushEach: true, // equivalent of $push with $each array of documents
  timestamps: { createdAt: true, updatedAt: true }
});

groupSchema
  .virtual('users', {
    ref: 'User',
    localField: '_id',
    foreignField: 'group'
  })
  .set(function setUsers(users) {
    this._users = users;
  });

groupSchema.pre('save', function addGroupToUsers(next) {
  this
    .model('User')
    .find({ _id: this._users }) // mongoose ObjectId AKA it's hexString
    .exec()
    .then((users) => {
      const promises = users.map((user) => {
        user.group = this.id; // 'this.id' refers to the group object id
        return user.save();
      });

      return Promise.all(promises);
    })
    .then(next)
    .catch(next);
});

groupSchema.pre('save', function addGroupOwner(next) {
  this
    .model('User')
    .findByIdAndUpdate(this.owner, { $push: { group: this._id } }, next);
  return next();
});

userImageSchema
  .virtual('imageSRC')
  .get(function getImageSRC() {
    if(!this.file) return null;
    if(this.file.match(/^http/)) return (this.file);
    return `https://s3-eu-west-1.amazonaws.com/${process.env.AWS_BUCKET_NAME}/${this.file}`;
  });

userImageSchema.pre('remove', function deleteImage(next) {
  if(this.file) return s3.deleteObject({ Key: this.file }, next);
  return next();
});

// groupSchema.pre('update', function updateGroupUsers(next) {
//   this.model('User')
//     .find({ _id: this._users })
//     .exec()
//     .then((users) => {
//       const promises = users.map((user) => {
//         // user.group = this.id;
//         user.group = null;
//         user.save();
//       });
//
//       return Promise.all(promises);
//     })
//     .then(next)
//     .catch(next);
// });

// groupSchema.pre('remove', function removeGroupFromUsers(next) {
//   this
//     .model('User')
//     .find({ _id: this._users }) // mongoose ObjectId aka it's hexString
//     .exec()
//     .then((users) => {
//       const promises = users.map((user) => {
//         console.log('user --------------------------', user);
//         user.group = null; // this refers to the group object
//         return user.save();
//       });
//
//       return Promise.all(promises);
//     })
//     .then(next)
//     .catch(next);
// });

module.exports = mongoose.model('Group', groupSchema);
