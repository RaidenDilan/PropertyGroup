const port   = process.env.PORT || 4000;
const env    = process.env.NODE_ENV || 'development';
const dbURI  = process.env.MONGODB_URI || `mongodb://localhost/project-3-${env}`;
const secret = process.env.SECRET || 'I bet you never even look at this!';
// const bluebirdConfig = process.env.BLUEBIRD_W_FORGOTTEN_RETURN = 0;

module.exports = { port, env, dbURI, secret };
