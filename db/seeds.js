const mongoose   = require('mongoose');
mongoose.Promise = require('bluebird');
// const async      = require('async');
const Group      = require('../models/group');
const User       = require('../models/user');
const { dbURI, mongoOptions } = require('../config/environment');

mongoose.connect(dbURI, mongoOptions);

Group.collection.drop();
User.collection.drop();

User
  .create([{
    firstname: 'Raiden',
    username: 'raidendilan',
    email: 'raiden18@me.com',
    budget: 1000,
    // group: null,
    password: 'p',
    passwordConfirmation: 'p',
    profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png'
  },{
    firstname: 'Luca',
    username: 'lucaancelotti',
    email: 'luca@me.com',
    budget: 1500,
    // group: null,
    password: 'p',
    passwordConfirmation: 'p',
    profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png'
  },{
    firstname: 'Rawand',
    username: 'rawanddilan',
    email: 'rawand@me.com',
    budget: 2000,
    // group: null,
    password: 'p',
    passwordConfirmation: 'p',
    profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png'
  },{
    firstname: 'Omario',
    username: 'omariojones',
    email: 'omario@me.com',
    budget: 2000,
    // group: null,
    password: 'p',
    passwordConfirmation: 'p',
    profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png'
  },{
    firstname: 'Frederick',
    username: 'frederickroshandel',
    email: 'frederick@me.com',
    budget: 3000,
    // group: null,
    password: 'p',
    passwordConfirmation: 'p',
    profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png'
  }])
  .then((users) => {
    console.log(`${users.length} User(s) created`);

    return Group
      .create([{
        groupName: 'The Boys',
        owner: users[0],
        properties: [{
          listingId: '52693074',
          createdBy: users[0]
			  },{
          listingId: '52637876',
          createdBy: users[0]
        },{
          listingId: '52314423',
          createdBy: users[0]
        },{
          listingId: '52509811',
          createdBy: users[0]
          // ratings: [{
          //   stars: 5,
          //   createdBy: users[0]
          // }],
  				// notes: [{
          //   text: 'MEOW!',
          //   createdBy: users[1]
          // }],
  				// images: [{
          //   file: 'https://www.searchpng.com/wp-content/uploads/2019/02/Profile-ICon.png',
          //   createdBy: users[1]
          // }],
          // upvotes: [
          //   users[1],
          //   users[2]
          // ],
          // downvotes: [
          //   users[3],
          //   users[4]
          // ],
        }],
        users: [users[0]]
      }]);
  })
  .then((groups) => console.log(`${groups.length} Group(s) created`))
  .catch((err) => {
    if (err) return console.log('seeds err --->', err);
  })
  .finally(() => mongoose.connection.close());

// async.waterfall([createUsers, createGroups], (err) => {
//   if (err) console.log(err);
//   console.log('Seeding is complete');
//   return process.exit();
// });
//
// function createGroups(done) {
//   Group.find((err, users) => {
//     console.log('users ---***--->', users);
//     if (err) return done(err);
//
//     const groups = [
//       {
//         groupName: 'Group One',
//         owner: users[0],
//         properties: [{
//   				listingId: '50639974',
//   				ratings: [{
//             opinion: 5,
//             createdBy: users[0]
//           }],
//   				notes: [{
//             text: 'MEOW!',
//             createdBy: users[0]
//           }],
//   				images: [],
//           createdBy: users[0]
// 			  }],
//         users: [
//           users[0],
//           users[1],
//           users[2]
//         ]
//       }
//     ];
//
//     mongoose.Promise.map(groups, group => {
//       console.log('groups ---***--->', groups);
//       return Group.create(group);
//     }).then(() => {
//       done(null);
//     });
//   });
// }
//
// function createUsers(done) {
//   const users = [
//     {
//       firstname: 'Raiden',
//       username: 'raidendilan',
//       email: 'raiden18@me.com',
//       budget: 1000,
//       password: 'p',
//       passwordConfirmation: 'p',
//       profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png'
//     },
//     {
//       firstname: 'Luca',
//       username: 'lucaancelotti',
//       email: 'luca@me.com',
//       budget: 1500,
//       password: 'p',
//       passwordConfirmation: 'p',
//       profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png'
//     },
//     {
//       firstname: 'Rawand',
//       username: 'rawanddilan',
//       email: 'rawand@me.com',
//       budget: 2000,
//       password: 'p',
//       passwordConfirmation: 'p',
//       profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png'
//     },
//     {
//       firstname: 'Omario',
//       username: 'omariojones',
//       email: 'omario@me.com',
//       budget: 2000,
//       password: 'p',
//       passwordConfirmation: 'p',
//       profileImage: 'http://cdn.onlinewebfonts.com/svg/img_568656.png'
//     }
//   ];
//
//   mongoose.Promise.map(users, user => {
//     return User.create(user);
//   }).then(() => {
//     done(null);
//   });
// }
