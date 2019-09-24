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
      //   return res.status(201).json({ message: 'Registration successful'});
      // });

      return res.status(201).json({ message: 'Registration Successful' });
    })
    .catch((err, next) => {
      if (err) return res.status(400).json({ message: 'Something went wrong with authenticating a new user', err }); // if (err) return res.badRequest();
      // if (err) return res.status(500).json({ message: 'Something went wrong while registering' });
      return next();
    });
}

function login(req, res, next) {
  User
    .findOne({ email: req.body.email })
    .then((user) => {
      if (!user || !user.validatePassword(req.body.password)) return res.status(401).json({ message: `Incorrect username or password provided` }); // return res.unauthorized();

      // const token = jwt.sign({ userId: user.id }, secret, { expiresIn: 60 * 60 * 24 }); // expiresIn 24 HOURS
      const token = jwt.sign({ userId: user.id }, secret, { expiresIn: 60 * 60 * 24 * 7 }); // expiresIn 1 WEEK
      // const token = jwt.sign({ userId: user.id }, secret, { expiresIn: 60 * 60 }); // expiresIn 1 HOUR
      // const token = jwt.sign({ userId: user.id }, secret, { expiresIn: 60 * 2 }); // expiresIn 2 MINUTES
      // const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '1hr' }); // expiresIn 1 HOUR
      return res.status(200).json({ token, message: `Welcome back ${user.username}` });
    })
    .catch((err, next) => {
      if (err) return res.status(500).json({ message: 'something went wrong with authenticating user login', err });
      return next();
    });
}

module.exports = { register, login };
