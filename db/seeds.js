const mongoose  = require('mongoose');
const { dbURI } = require('../config/environment');
const options = { useMongoClient: true };

mongoose.Promise = require('bluebird');
mongoose.connect(dbURI, options);

const Group = require('../models/group');
const User = require('../models/user');

Group.collection.drop();
User.collection.drop();

User
  .create([{
    firstname: 'Raiden',
    surname: 'Dilan',
    username: 'raidendilan',
    email: 'raiden18@me.com',
    password: 'password',
    passwordConfirmation: 'password',
    profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png'
  },{
    firstname: 'Luca',
    surname: 'Ancelotti',
    username: 'lucaancelotti',
    email: 'luca@me.com',
    password: 'password',
    passwordConfirmation: 'password',
    profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png'
  },{
    firstname: 'Rawand',
    surname: 'Dilan',
    username: 'rawanddilan',
    email: 'rawand@me.com',
    password: 'password',
    passwordConfirmation: 'password',
    profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png'
  },{
    firstname: 'Lanja',
    surname: 'Roshandel',
    username: 'lanjaroshandel',
    email: 'lanja@me.com',
    password: 'password',
    passwordConfirmation: 'password',
    profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png'
  },{
    firstname: 'Frederick',
    surname: 'Roshandel',
    username: 'fredroshandel',
    email: 'fred@me.com',
    password: 'password',
    passwordConfirmation: 'password',
    profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png'
  },{
    firstname: 'Ranja',
    surname: 'Dilan',
    username: 'ranjadilan',
    email: 'ranja@me.com',
    password: 'password',
    passwordConfirmation: 'password',
    profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png'
  },{
    firstname: 'Kany',
    surname: 'Dilan',
    username: 'kanydilan',
    email: 'kany@me.com',
    password: 'password',
    passwordConfirmation: 'password',
    profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png'
  },{
    firstname: 'Naz',
    surname: 'Dilan',
    username: 'nazdilan',
    email: 'naz@me.com',
    password: 'password',
    passwordConfirmation: 'password',
    profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png'
  },{
    firstname: 'Azad',
    surname: 'Dilan',
    username: 'azaddilan',
    email: 'azad@me.com',
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
						createdBy: "5d4740b6cdb106bfaffde981",
						id: "5d4740d79a13e5bfca7a41d8"
					}],
  				notes: [{
            text: "MEOW!",
						createdBy: "5d4740b6cdb106bfaffde981",
						id: "5d4740d59a13e5bfca7a41d7"
          }],
  				images: [],
          createdBy: "5d4740b6cdb106bfaffde981",
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
  .catch((err) => console.log('DB err --->', err))
  .finally(() => mongoose.connection.close());
