const Promise    = require('bluebird');
const jwt        = Promise.promisifyAll(require('jsonwebtoken'));
const { secret } = require('../config/environment');
const User       = require('../models/user');

function secureRoute(req, res, next) {
  if (!req.headers.authorization) return res.unauthorized(); // with dot notation // if (!req.headers.authorization) return res.status(401).json({ message: 'Unauthorized' }); // with dot notation
  let token = req.headers.authorization.replace('Bearer ', ''); // use const or let

  return jwt
    .verifyAsync(token, secret)
    .then((payload) => {
      if (!payload) return res.status(401).json({ message: 'Incorrect payload provided.' });
      return User.findById(payload.userId);
    })
    .then((user) => {
      if (!user) return res.status(500).json({ message: 'Something went wrong.' }); // if (!user) return res.unauthorized();
      req.user = user;
      return next();
    })
    // .then(next)
    .catch(next);
}

module.exports = secureRoute;
