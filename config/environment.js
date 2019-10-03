const port         = process.env.PORT || 4000;
const env          = process.env.NODE_ENV || 'development';
const dbURI        = process.env.MONGODB_URI || `mongodb://localhost/propertyGroup-${env}`;
const secret       = process.env.SECRET || 'I bet you never even look at this!';
const google       = process.env.PR3_GOOGLE_MAP_KEY;
const mongoOptions = { useMongoClient: true };

module.exports = { port, env, dbURI, secret, google, mongoOptions };
