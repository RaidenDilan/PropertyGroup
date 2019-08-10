const mongoose   = require('mongoose');
mongoose.Promise = require('bluebird');
const Group      = require('../models/group');
const User       = require('../models/user');
const { dbURI, mongoOptions } = require('../config/environment');

mongoose.connect(dbURI, mongoOptions);

Group.collection.drop();
User.collection.drop();

User
  .create([{
    firstname: 'Raiden',
    surname: 'Dilan',
    username: 'raidendilan',
    email: 'raiden18@me.com',
    budget: 1000,
    password: 'password',
    passwordConfirmation: 'password',
    profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png'
  },{
    firstname: 'Luca',
    surname: 'Ancelotti',
    username: 'lucaancelotti',
    email: 'luca@me.com',
    budget: 1500,
    password: 'password',
    passwordConfirmation: 'password',
    profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png'
  },{
    firstname: 'Rawand',
    surname: 'Dilan',
    username: 'rawanddilan',
    email: 'rawand@me.com',
    budget: 2000,
    password: 'password',
    passwordConfirmation: 'password',
    profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png'
  }])
  .then((users) => {
    console.log(`${users.length} User(s) created`);

    return Group
      .create([{
        groupName: 'Group One',
        createdBy: users[0],
        properties: [{
  				listingId: "50639974",
  				rating: [{
						opinion: 5,
						createdBy: users[0],
						id: "5d4740d79a13e5bfca7a41d8"
					}],
  				notes: [{
            text: "MEOW!",
						createdBy: users[0],
						id: "5d4740d59a13e5bfca7a41d7"
          }],
  				images: [],
          createdBy: users[0],
  				id: "5d474078d7e7cdbe47c2f006"
			}],
        users: [
          users[0],
          users[1],
          users[2]
        ]
      }]);
  })
  .then((groups) => console.log(`${groups.length} Group(s) created`))
  .catch((err) => {
    if (err) console.log('seeds err --->', err);
  })
  .finally(() => mongoose.connection.close());
