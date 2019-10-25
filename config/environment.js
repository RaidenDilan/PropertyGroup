const port         = process.env.PORT || 4000;
const env          = process.env.NODE_ENV || 'development';
const dbURI        = process.env.MONGODB_URI || `mongodb://localhost/groparty-${env}`;
const secret       = process.env.SECRET || 'I bet you never even look at this!';
const google       = process.env.PR3_GOOGLE_MAP_KEY;
const mongoOptions = { useMongoClient: true };
const bluebirdOptions = {
  warnings: { // Enables all warnings except forgotten return statements.
    wForgottenReturn: false // The corresponding environmental variable key is BLUEBIRD_W_FORGOTTEN_RETURN.
  }
  // longStackTraces: true, // Enable long stack traces
  // cancellation: true, // Enable cancellation
  // monitoring: true // Enable monitoring
};

module.exports = {
  port,
  env,
  dbURI,
  secret,
  google,
  mongoOptions,
  bluebirdOptions
};
