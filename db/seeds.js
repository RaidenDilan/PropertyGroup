const mongoose   = require('mongoose');
mongoose.Promise = require('bluebird');
// const async      = require('async');
const User       = require('../models/user');
const Group      = require('../models/group');
// const Property   = require('../models/property');
// const Like       = require('../models/vote');
const { dbURI, mongoOptions } = require('../config/environment');

mongoose.connect(dbURI, mongoOptions);

User.collection.drop();
Group.collection.drop();
// Property.collection.drop();
// Like.collection.drop();

User
  .create([
    { firstname: 'Raiden', username: 'raidendilan', email: 'raiden18@me.com', budget: 1000, password: 'p', passwordConfirmation: 'p', profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png' },
    { firstname: 'Luca', username: 'lucaancelotti', email: 'luca@me.com', budget: 1500, password: 'p', passwordConfirmation: 'p', profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png' },
    { firstname: 'Rawand', username: 'rawanddilan', email: 'rawand@me.com', budget: 2000, password: 'p', passwordConfirmation: 'p', profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png' },
    { firstname: 'Omario', username: 'omariojones', email: 'omario@me.com', budget: 2000, password: 'p', passwordConfirmation: 'p', profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png' },
    { firstname: 'Frederick', username: 'frederickroshandel', email: 'frederick@me.com', budget: 3000, password: 'p', passwordConfirmation: 'p', profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png' }
  ])
  .then((users) => {
    console.log(`${users.length} Users(s) created`);

    return Group
      .create([{
        groupName: 'The Boys',
        createdBy: users[0],
        users: [ users[0] ],
        properties: [{
          createdBy: users[0],
          listingId: '52509811',
          ratings: [{ stars: 5, createdBy: users[0] }],
          comments: [{ text: 'YOYO!', createdBy: users[0] }]
        }]
      }]);
  })
  .then((groups) => console.log(`${groups.length} Group(s) created`))
  .catch((err) => console.log('seeds err --->', err))
  .finally(() => mongoose.connection.close());

  // .then((users) => {
  //   console.log(`${users.length} Users(s) created`);
  //   return Property
  //     .create([{
  //       createdBy: users[0],
  //       listingId: '52509811',
  //       ratings: [{ stars: 5, createdBy: users[0] }],
  //       comments: [{ text: 'MEOW!', createdBy: users[0] }],
  //       images: [{ file: 'https://www.searchpng.com/wp-content/uploads/2019/02/Profile-ICon.png', createdBy: users[0] }]
  //     }]);
  // })
