const User       = require('../models/user');
const jwt        = require('jsonwebtoken');
const { secret } = require('../config/environment');

function register(req, res, next) {
  if(req.file) req.body.profileImage = req.file.filename;

  User
    .create(req.body)
    .then((user) => res.status(201).json({ message: 'Registration Successful' }))
    .catch((err, next) => {
      if (err) return res.status(400).json({ message: 'Something went wrong with authenticating a new user', err }); // if (err) return res.badRequest();
      return next();
    });
}

function login(req, res, next) {
  User
    .findOne({ email: req.body.email })
    .then((user) => {
      if (!user || !user.validatePassword(req.body.password)) return res.status(401).json({ message: `Incorrect username or password provided` }); // return res.unauthorized();

      const token = jwt.sign({ userId: user.id }, secret, { expiresIn: 60 * 60 * 24 * 7 }); // expiresIn 1 WEEK
      return res.status(200).json({ token, message: `Welcome back ${user.username}` });
    })
    .catch((err, next) => {
      if (err) return res.status(500).json({ message: 'something went wrong with authenticating user login', err });
      return next();
    });
}

module.exports = { register, login };
