const s3 = require('./s3');
const uuid = require('uuid');

function imageUpload(req, res, next) {
  if(!req.body.base64) return next();
  const base64Data = req.body.base64.match(/base64,(.*)$/)[1];
  const mimeType = req.body.base64.match(/^data:(.*);/)[1];
  const extention = mimeType.replace('image/', '');
  const filename = `${uuid.v1()}.${extention}`;

  s3.upload({
    Key: filename,
    Body: new Buffer(base64Data, 'base64'),
    ContentType: mimeType
  },
  (err) => {
    if(err) return next(err);

    req.file = {
      filename,
      mimeType
    };
    
    next();
  });
}

module.exports = imageUpload;
