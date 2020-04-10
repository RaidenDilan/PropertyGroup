const s3 = require('./s3');
const uuid = require('uuid');

// Store infomation about file ont req.file, similar to malta, can handle the file in the controller. Also adds
function imageUpload(req, res, next) {
  if (!req.body.base64) return next();

  const base64Data = req.body.base64.match(/base64,(.*)$/)[1]; // capture everything after the base b4 until the end of the string
  const mimeType = req.body.base64.match(/^data:(.*);/)[1];

  const extention = mimeType.replace('image/', '');
  const filename = `${uuid.v1()}.${extention}`;

  s3.upload({
    // Bucket: 'swishlist-bucket',
    Key: filename,
    Body: new Buffer(base64Data, 'base64'), // new buffer - takes string and turns it back into an img
    ContentType: mimeType
  },
  (err) => {
    if (err) return next(err);

    req.file = {
      filename,
      mimeType
    };

    next();
  });
}

module.exports = imageUpload;
