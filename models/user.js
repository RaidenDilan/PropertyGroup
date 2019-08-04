const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const s3 = require('../lib/s3');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  firstname: { type: String },
  surname: { type: String },
  email: { type: String },
  password: { type: String },
  profileImage: { type: String },
  githubId: { type: Number },
  group: { type: mongoose.Schema.ObjectId, ref: 'Group' }
});

userSchema
  .path('profileImage')
  .set(function getPreviousImage(profileImage) {
    this._profileImage = this.profileImage;
    return profileImage;
  });

userSchema
  .virtual('profileImageSRC')
  .get(function getprofileImageSRC() {
    if(!this.profileImage) return null;
    if(this.profileImage.match(/^http/)) return (this.profileImage);
    return `https://s3-eu-west-1.amazonaws.com/${process.env.AWS_BUCKET_NAME}/${this.profileImage}`;
  });

userSchema.pre('save', function checkPreviousProfileImage(next) {
  if(this.isModified('profileImage') && this._profileImage) return s3.deleteObject({ Key: this._profileImage }, next);
  next();
});

userSchema.pre('remove', function deleteImage(next) {
  if(this.profileImage) return s3.deleteObject({ Key: this.profileImage}, next);
  next();
});

userSchema
  .virtual('passwordConfirmation')
  .set(function setPasswordConfirmation(passwordConfirmation) {
    this._passwordConfirmation = passwordConfirmation;
  });

userSchema.pre('validate', function checkPassword(next) {
  if(!this.password && !this.githubId) this.invalidate('password', 'required');
  if(this.isModified('password') && this._passwordConfirmation !== this.password)this.invalidate('passwordConfirmation', 'does not match');
  next();
});

userSchema.pre('save', function hashPassword(next) {
  if(this.isModified('password')) this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(11));
  next();
});

userSchema.methods.validatePassword = function validatePassword(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
