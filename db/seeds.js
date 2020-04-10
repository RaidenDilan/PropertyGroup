const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const { dbURI, mongoOptions } = require('../config/environment');
mongoose.connect(dbURI, mongoOptions);
const User = require('../models/user');
const Group = require('../models/group');

User.collection.drop();
Group.collection.drop();

User
  .create([
    { username: 'Frederick', email: 'frederick@me.com', budget: 3000, password: 'p', passwordConfirmation: 'p', profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png' },
    { username: 'Lanja', email: 'lanja@me.com', budget: 2000, password: 'p', passwordConfirmation: 'p', profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png' },
    { username: 'Luca', email: 'luca@me.com', budget: 1600, password: 'p', passwordConfirmation: 'p', profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png' },
    { username: 'Omario', email: 'omario@me.com', budget: 2000, password: 'p', passwordConfirmation: 'p', profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png' },
    { username: 'Raiden', email: 'raiden@me.com', budget: 1800, password: 'p', passwordConfirmation: 'p', profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png' },
    { username: 'Rawand', email: 'rawand@me.com', budget: 1100, password: 'p', passwordConfirmation: 'p', profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png' },
    { username: 'Ranja', email: 'ranja@me.com', budget: 1200, password: 'p', passwordConfirmation: 'p', profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png' },
    { username: 'Ty', email: 'ty@me.com', budget: 2500, password: 'p', passwordConfirmation: 'p', profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png' },
    { username: 'Billie', email: 'billie@me.com', budget: 1500, password: 'p', passwordConfirmation: 'p', profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png' },
    { username: 'Edwin', email: 'edwin@me.com', budget: 1700, password: 'p', passwordConfirmation: 'p', profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png' }
  ])
  .then((users) => {
    console.log(`${users.length} Users(s) created`);

    return Group
      .create([{
        groupName: 'Kings & Queens',
        createdBy: users[4],
        users: [users[4], users[7], users[8]],
        properties: [{ createdBy: users[4], listingId: '52509811' }]
      }]);
  })
  .then((groups) => console.log(`${groups.length} Group(s) created`))
  .catch((err) => console.log('seeds err --->', err))
  .finally(() => mongoose.connection.close());
