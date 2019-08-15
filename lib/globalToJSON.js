function globalToJSON(schema) {
  schema.set('toJSON', {
    virtuals: true,
    transform(obj, json) {
      delete json._id; // replaces mongoose ObjectId from _id: to id:
      delete json.__v; // replaces mongoose VirtualId from _v: to v:
    }
  });
}

module.exports = globalToJSON;
