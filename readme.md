<center><h1>GA WDI London - Project 3 March 2017</h1></center>

<center><h1>Project 3: propertyGroup</h1></center>

<center>[Launch Application!](https://property-group.herokuapp.com)</center>

![Imgur](http://i.imgur.com/mzEeGwI.png)

#####Team: Raiden Dilan, Mark Davis & Omar Harvey-Phillips

propertyGroup is a RESTful MEAN stack app which allows users to create a group and talk to each other. The users are able to search for properties using the Zoopla API and store them in the group they're in. Users are able to upload images of the properties they visited, give feedback and view crime statistics provided by the Police API. In this project myself and my two teammates predominantly pair-coded the front-end and sorted out the numerous requests that were being sent to the zoopla API.

The app has been built following the RESTful model in both the back end, which was built in Express, and the Front end, built in AngularJS. Several APIs have been consumed in order to add functionality to the app, these are Google Maps, Autocomplete, Google Places, Zoople API and Police Crime API to provide the informations required by this app. The app requires the users to register and log in and uses JWT to complete the authentication, additionally OAuth is available via Github. Image upload has been implemented using AWS.

<center><h1>Wireframe</h1></center>

Wire framing was done in Balsamiq

![Imgur](http://i.imgur.com/gFqp6aw.png)

The end app is very close to the wireframing, and this was an essential step in planning the routes.

In addition to wire framing, planning each of the tasks was done in Trello in order to keep track of project timings. Trello was an essential part of ensuring the group project ran smoothly.

<center><h1>Technologies used</h1></center>

* propertyGroup is a MEAN stack application.
* The API is built in Node.js with Express.
* A mongo database was used to store the data, with mongoose used to create models within express.
* Pictures are base64 encoded and stored using the AWS S3 service.
* Authentication uses JWT with Satellizer and BCrypt.
* OAuth via Github was implemented using Satellizer.
* AngularJS was used on the front end to direct the API data and render the views.
* UI Router was used to build multiple pages.
* Google's autocomplete, Maps and Places APIs were consumed, as was Zoople API and Police Crime API.
* UI Bootstrap was used to provide grid layouts and additional functionality including Modals.
* Styles were written in SASS.
* Gulp was used as taskrunner.
* The google web fonts 'Raleway'was used to style the app.
* Babel is used minify and convert the Javascript to ES5.


<center><h1>User Journey and Site Functionality</h1></center>

The user flow through the site is as follows;

The homepage is a login page, from here the user can either login is already registered or click on register to use the site. Registration

Once logged in, or registered the the user is redirected to their User profile page.

Now the user click on the 'Find Properties' in the nav to search and view properties provided by the Zoopla API. If the user wants to store a property, a group must be created.

The user can click on 'New Group' to create a group and add their friends if they are registered and looking to use the app. Once a group has been created the user can now search, view and store properties.

When a user is searching for properties, they will see 10 listings and if the user wants to view more, there is a click more button at the bottom of the properties search page. The user can click on a property and see information inside a modal, if the property is right the user can click on store property button.

While in 'My Group' the user can see all the properties stored and view them further from there and all the users that's in that group.

When viewing a chosen property inside 'My Group', the user can see all the information about the property that's provided by the Zoopla API.

A Users can upload images from the property they viewed, give star ratings and write comments for the group users to see and communicate. There is a map displayed where the property is located and next to it a chart that displays all the crimes that's currently provided by the Police Crime API.

<center><h1>Unsolved Problems</h1></center>

* The only problem we as a group didn't get to fix was editing the users group. We had a weeek for the project and didn't have any time left to fix it, so we took group editting out and left it to go back to it later.

<center><h1>Challenges & Problems</h1></center>

Writing the group function for creating a group and populating it users was very challenging. my team mates and I pair coded for this particular function. After many console logs and checking the the back end from terminal, we were finally able to populate a group with users.

<h3>Project Forking</h3>

<h5>In Terminal</h5>
* npm i && bower i

<br>
<br>

<center><strong>Copyright © propertyGroup</strong></center>
