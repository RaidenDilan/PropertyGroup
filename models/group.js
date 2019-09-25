const mongoose = require('mongoose');
const s3       = require('../lib/s3');
const Promise  = require('bluebird');
const ObjectId = mongoose.Schema.ObjectId;

// Embedded Document
const userLikeSchema = new mongoose.Schema({
  likeCount: { type: Number, default: 0 },
  user: { type: ObjectId, ref: 'User', unique: true, index: true }
});

const userImageSchema = new mongoose.Schema({
  file: { type: String },
  createdBy: { type: ObjectId, ref: 'User', required: true }
}, { timestamps: { createdAt: true, updatedAt: false }});

const userCommentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdBy: { type: ObjectId, ref: 'User', required: true }
}, { timestamps: { createdAt: true, updatedAt: false }});

const userRatingSchema = new mongoose.Schema({
  stars: { type: Number, required: true },
  createdBy: { type: ObjectId, ref: 'User', required: true }
}, { timestamps: { createdAt: true, updatedAt: false }});

const propertySchema = new mongoose.Schema({
  listingId: { type: String },
  likeCount: { type: Number, default: 0 },
  likes: [ userLikeSchema ],
  ratings: [ userRatingSchema ],
  images: [ userImageSchema ],
  comments: [ userCommentSchema ],
  createdBy: { type: ObjectId, ref: 'User', required: true }
}, { timestamps: { createdAt: true, updatedAt: false }});

const groupSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  properties: [ propertySchema ],
  // properties: [{ type: ObjectId, ref: 'Property' }],
  createdBy: { type: ObjectId, ref: 'User', required: true }
}, {
  usePushEach: true, // $push operator with $each instead. This forces the use of $pushAll - MongoDB 3.6
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
    .find({ _id: this._users })
    .exec()
    .then((users) => {
      const promises = users.map((user) => {
        user.group = this.id;
        return user.save();
      });

      return Promise.all(promises);
    })
    .then(next)
    .catch(next);
});

// groupSchema.pre('remove', function addGroupToUsers(next) {
//   this
//     .model('User')
//     .find({ _id: this._users }) // mongoose ObjectId AKA it's hexString
//     .exec()
//     .then((users) => {
//       const promises = users.map((user) => {
//         user.group = null; // set Group ObjectId back to default 'null' on selected users
//         return user.save();
//       });
//       return Promise.all(promises);
//     })
//     .then(next)
//     .catch(next);
// });

userImageSchema.virtual('imageSRC').get(function getImageSRC() {
  if(!this.file) return null;
  if(this.file.match(/^http/)) return (this.file);
  return `https://s3-eu-west-1.amazonaws.com/${process.env.AWS_BUCKET_NAME}/${this.file}`;
});

userImageSchema.pre('remove', function deleteImage(next) {
  console.log('this.file', this.file);
  if(this.file) return s3.deleteObject({ Key: this.file }, next);
  return next();
});

// userCommentSchema.methods.belongsTo = function commentBelongsTo(user) {
//   if(typeof this.createdBy.id === 'string') return this.createdBy.id === user.id;
//   return user.id === this.createdBy.toString();
// };

module.exports = mongoose.model('Group', groupSchema);
