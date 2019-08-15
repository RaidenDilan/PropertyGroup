const S3 = require('aws-sdk/clients/s3');

module.exports = new S3({
  regions: 'eu-west-1',
  params: { Bucket: process.env.AWS_BUCKET_NAME },
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  }
});

// const AWS = require('aws-sdk');
//
// AWS.config.credentials = {
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
// };
//
// AWS.config.region = 'eu-west-1';
//
// module.exports = new AWS.S3();
