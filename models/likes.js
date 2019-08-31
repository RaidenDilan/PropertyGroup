const mongoose = require('mongoose');

const likesSchema = new mongoose.Schema({
  like: { type: String, trim: true, required: true },
  user: { type: mongoose.Schema.ObjectId, ref: 'User' }
},{
  timestamps: true
});

module.exports = mongoose.model('Like', likesSchema);
