const User       = require('../models/user');
const jwt        = require('jsonwebtoken');
const { secret } = require('../config/environment');
// const mail       = require('../lib/mail');

function register(req, res, next) {
  if(req.file) req.body.profileImage = req.file.filename;

  User
    .create(req.body)
    .then((user) => {
      // mail.send(user.email, 'Thanks for registering!', `Hey ${user.username}! Thanks for registering, for real!`, (err) => {
      //   if(err) next(err);
      //   res.status(201).json({ message: 'Registration successful'});
      // });
      return res.status(201).json({ message: 'Registration Successful' });
    })
    .catch((err, next) => {
      if (err) return res.status(500).json({ error: err.message, message: 'Something went wrong while registering' });
      else return next();
    });
}

function login(req, res, next) {
  User
    .findOne({ email: req.body.email })
    .then((user) => {
      if(!user || !user.validatePassword(req.body.password)) return res.status(401).json({ message: `Incorrect username or password` }); // return res.unauthorized();

      const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '1hr' });
      return res.status(200).json({ token, message: `Welcome back ${user.username}` });
    })
    .catch((err, next) => {
      if (err) return res.status(500).json({ error: err.message, message: 'Something went wrong while logging in' });
      else return next();
    });
}

module.exports = { register, login };
