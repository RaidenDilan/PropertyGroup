const port         = process.env.PORT || 4000;
const env          = process.env.NODE_ENV || 'development';
const dbURI        = process.env.MONGODB_URI || `mongodb://localhost/project-3-${env}`;
const secret       = process.env.SECRET || 'I bet you never even look at this!';
const mongoOptions = {
  useMongoClient: true
  // useCreateIndex: true,
  // useNewUrlParser: true
  // autoIndex: false, // Don't build indexes
  // reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  // reconnectInterval: 500, // Reconnect every 500ms
  // poolSize: 10, // Maintain up to 10 socket connections
  // // If not connected, return errors immediately rather than waiting for reconnect
  // bufferMaxEntries: 0
};
// const bluebirdConfig = process.env.BLUEBIRD_W_FORGOTTEN_RETURN = 0;

module.exports = { port, env, dbURI, secret, mongoOptions };
