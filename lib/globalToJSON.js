function globalToJSON(schema) {
  schema
    // .set('toObject', { virtuals: true })
    .set('toJSON', {
      virtuals: true, // true => shows virtual users
      // getters: true,
      transform(obj, json) {
        delete json._id; // replaces mongoose ObjectId from _id: to id:
        delete json.__v; // replaces mongoose VirtualId from _v: to v:
      }
    });
}

module.exports = globalToJSON;
