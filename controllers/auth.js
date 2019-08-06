const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { secret } = require('../config/environment');

function register(req, res, next) {
  if(req.file) req.body.profileImage = req.file.filename;

  User
    .create(req.body)
    .then(() => res.json({ message: 'Registration Successful' }))
    // .then(() => res.status(200).json({ message: 'Registration Successful' }))
    .catch(next);
}

function login(req, res, next) {
  User
    .findOne({ email: req.body.email })
    .then((user) => {
      if(!user || !user.validatePassword(req.body.password)) {
        return res.status(401).json({ message: `Incorrect username or password` });
        // return res.unauthorized();
      }

      const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '1hr' });
      return res.status(200).json({ token, message: `Welcome back ${user.username}` });
      // return res.json({ token, message: `Welcome back ${user.username}` });
    })
    .catch(next);
}

module.exports = {
  register,
  login
};
