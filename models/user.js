const mongoose  = require('mongoose');
const bcrypt    = require('bcrypt');
const s3        = require('../lib/s3');
const ObjectId  = mongoose.Schema.ObjectId;
const validator = require('validator');
const avatar    = 'https://www.searchpng.com/wp-content/uploads/2019/02/Profile-ICon.png';

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, trim: true, lowercase: true, required: true },
  email: { type: String, unique: true, trim: true, lowercase: true, required: true },
  budget: { type: Number, required: true },
  password: { type: String, required: true,  minLength: 1 },
  profileImage: { type: String, default: avatar, required: true },
  githubId: { type: Number },
  group: { type: ObjectId, ref: 'Group', default: null } // Referenced Document
});

userSchema.path('profileImage').set(function getPreviousImage(profileImage) {
  this._profileImage = this.profileImage;
  return profileImage;
});

userSchema.path('email').validate(validateEmail);

userSchema.virtual('profileImageSRC').get(function getprofileImageSRC() {
  if(!this.profileImage) return null;
  if(this.profileImage.match(/^http/)) return (this.profileImage);
  return `https://s3-eu-west-1.amazonaws.com/${process.env.AWS_BUCKET_NAME}/${this.profileImage}`;
});

userSchema.pre('save', function checkPreviousProfileImage(next) {
  if(this.isModified('profileImage') && this._profileImage) return s3.deleteObject({ Key: this._profileImage }, next);
  return next();
});

userSchema.pre('remove', function deleteImage(next) {
  if(this.profileImage) return s3.deleteObject({ Key: this.profileImage}, next);
  return next();
});

userSchema.virtual('passwordConfirmation').set(function setPasswordConfirmation(passwordConfirmation) {
  this._passwordConfirmation = passwordConfirmation;
});

userSchema.pre('validate', function checkPassword(next) {
  if(!this.password && !this.githubId) this.invalidate('password', 'required');
  if(this.isModified('password') && this._passwordConfirmation !== this.password)this.invalidate('passwordConfirmation', 'does not match');
  return next();
});

userSchema.pre('save', function hashPassword(next) {
  if(this.isModified('password')) this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(11));
  return next();
});

userSchema.methods.validatePassword = function validatePassword(password) {
  return bcrypt.compareSync(password, this.password);
};

function validateEmail(email) {
  if(!validator.isEmail(email)) return this.invalidate('email', 'Email must be valid email address');
}

// The raw value of `email` is lowercased
// userSchema.get('email', null, { getters: false }); // 'test@gmail.com'

// // Validate empty email
// userSchema
//   .path('email')
//   .validate(function(email) {
//     if (authTypes.indexOf(this.provider) !== -1) return true;
//     return email.length;
//   }, 'Email cannot be blank');

// // Validate empty password
// userSchema
//   .path('password')
//   .validate(function (password) {
//     if (authTypes.indexOf(this.provider) !== -1) return true;
//     return password.length;
//   }, 'Password cannot be blank');

// // Validate email is not taken
// userSchema
//   .path('email')
//   .validate({
//     isAsync: true,
//     validator(value, respond) {
//       var self = this;
//
//       this
//         .model('User')
//         .findOne({ email: value })
//         .exec()
//         .then((user) => {
//           if (user) {
//             if (self.id === user.id) return respond(false);
//             console.log('user =-=-=-=-=-=-=-=-=-=->>>', user);
//             return respond(true);
//           }
//           return respond(true);
//         })
//         .catch((err) => {
//           if (err) throw err;
//           return respond(true);
//         });
//       },
//       message: 'The specified email address is already in use.'
//   });

// userSchema
//   .path('email')
//   .validate(validateEmail);
//   function validateEmail(email) {
//   if(!validator.isEmail(email)) return this.invalidate('email', 'Email must be valid email address');
// }

// userSchema
//   .path('email')
//   .validate(function validateEmail(email) {
//     console.log('email validation');
//     if(!validator.isEmail(email)) {
//       console.log('!validator.isEmail(email)', !validator.isEmail(email));
//       return this.invalidate('email', 'Email must be valid email address');
//     }
// });

// userSchema.pre('validate', function validateEmail(email, next) {
//   if(!validator.isEmail(email)) return this.invalidate('email', 'Email must be valid email address');
//   next();
// });

// var validateEmail = function(email) {
//   var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
//   return re.test(email);
// };

module.exports = mongoose.model('User', userSchema);
