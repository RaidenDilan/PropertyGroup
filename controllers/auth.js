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
      return res.json({ status: 200, message: 'Registration Successful' });
    })
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
      return res.json({ token, status: 200, message: `Welcome back ${user.username}` });
    })
    .catch((err, next) => {
      if (err) console.log('err', err);
    });
}

module.exports = { register, login };
