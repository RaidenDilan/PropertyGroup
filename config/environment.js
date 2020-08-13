const port = process.env.PORT || 4000;
const env = process.env.NODE_ENV || 'development';
const dbURI = process.env.MONGODB_URI || `mongodb+srv://${ process.env.DB_USER }:${ process.env.DB_PASSWORD }@grouparty.c8bwk.mongodb.net/${ process.env.DB_NAME }-${ env }?retryWrites=true&w=majority`;
const dbOPS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
};
const secret = process.env.SECRET || 'I bet you never even look at this!';
const google = process.env.PR3_GOOGLE_MAP_KEY;
// const githubID     = process.env.PR3_GITHUB_CLIENT_ID;
// const githubSecret = process.env.PR3_GITHUB_CLIENT_SECRET;
// const mongoOptions = { useMongoClient: true };
const bluebirdOptions = {
  // Enables all warnings except forgotten return statements.
  warnings: { wForgottenReturn: false } // The corresponding environmental variable key is BLUEBIRD_W_FORGOTTEN_RETURN.
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
  dbOPS,
  bluebirdOptions
  // githubID,
  // githubSecret
};
