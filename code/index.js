const express = require("express");
const app = express();
const pgp = require("pg-promise")();
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require('bcrypt');

// db config
const dbConfig = {
  host: "db",
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};

const db = pgp(dbConfig);

// db test
db.connect()
  .then((obj) => {
    // Can check the server version here (pg-promise v10.1.0+):
    console.log("Database connection successful");
    obj.done(); // success, release the connection;
  })
  .catch((error) => {
    console.log("ERROR:", error.message || error);
  });

// set the view engine to ejs
app.set("view engine", "ejs");
app.use(bodyParser.json());

// set session
app.use(
  session({
    secret: "XASDASDA",
    saveUninitialized: true,
    resave: true,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// Login submission
app.post("/login", async (req, res) => {
  /*
    NOTE:
      - I think that the username could be either a traditional username, or an email.
      - We could modify the db to store emails and usernames, however for our purpose I dont think emails would be that useful.
  */
  const username = req.body.username;
  const password = req.body.password;
  console.log("Attempting to login as " + req.body.username + ".");

  var query = 'select * from users where username = \'' + username + '\';';
  console.log(query);
  db.any(query)
      .then(async function (data) {
          if (data.length == 0) {
            console.log("data length was 0.");
            res.redirect('/login');
          }
          else
          {
            let match = await bcrypt.compare(password, data[0].password);
            match = true; // TEMP CHANGE THIS --------------------------------------------
            if (match) {
              console.log('matched!');
              req.session.user = {
                username: username,
                user_id: data[0]['user_id'],
                housing_id: data[0]['housing_id'],
                graduation_year: data[0]['graduation_year'],
                graduation_season_id: data[0]['graduation_season_id'],
                min_rent: data[0]['min_rent'],
                max_rent: data[0]['max_rent'],
                about_me: data[0]['about_me'],
              };
              console.log('login successful');
              console.log(req.session.user);
              req.session.save();
              res.redirect('/');
            } else {
              console.log('no match.');
              res.redirect('/login');
            }
          }

      })
      .catch(function (err) {
          console.log(err);
          res.redirect('/register');
      });
});

app.get("/login", (req, res) => {
  res.render("pages/login.ejs");
});

app.post('/register', async (req, res) => {
  /*
    TODO:
      - Registration needs a further process for inputting preferences, can also be submitted in the post request form.
      - Change sql query to input those values into the db on post.
      (is_admin, username, password, dorm_id, preferences, about_me)
  */
  const hash = await bcrypt.hash(req.body.password, 10);
  var query = 'insert into users(is_admin, username, password, dorm_id, preferences, about_me) values (false, \'' + req.body.username + '\', \'' + hash + '\', 0, {0,0,0,0,0}, "testing");';
  db.any(query)
      .then(function (data) {
          res.redirect('/login');
      })
      .catch(function (err) {
          res.redirect('/register');
      });
});

app.get("/register", (req, res) => {
  res.render('views/pages/register.ejs');
});

// Authentication middleware.
const auth = (req, res, next) => {
  if (!req.session.user) {
    console.log('not logged in');
    return res.redirect("/login");
  }
  next();
};

app.use(auth);
// All pages which can be accessed without logging in must be above this app.use statement or it will just continuously redirect the user






app.get("/", (req, res) => {
  res.render("pages/home.ejs");
});



app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/logout.ejs");
});



app.get("/roommates", (req, res) => {
  res.render("pages/roommates.ejs");
});



app.post('/discover', (req, res) => {
  const numPreferences = 5;
  /*
    TODO:
     - Return json data containing information for users who the user might be interested in
     - Compare user preferences
     - Implement error message for invalid db queries

    POST REQUEST:
      REQ:
       - Expects no data in body
      RES:
       - Returns no data, stores discovery data at req.session.user[1]
  */

  const finduserquery = 'select * from users where username = \'' + req.session.user.username + '\';';

  // EXECUTE FIRST QUERY
  db.any(finduserquery)
    .then(function (userreqdata) {

      const getusersquery = 'select username, dorm_id, preferences, about_me from users;';

      // EXECUTE SECOND QUERY
      db.any(getusersquery)
        .then(function (allusers) {

          // At this point, we have the info of the user who requested data, and the info of all users in the table.
          // getusersquery should return users in json format as an array
          let foundUsers = [];
          let numFoundUsers = 0;

          allusers.forEach(element => {
            for (let i = 0; i < numPreferences; i++) {
              if (element['preferences'][i] == userreqdata[0]['preferences'][i]) {
                if (!foundUsers.includes(element)) {
                  console.log('potential roommate located: ', element.username);
                  foundUsers[numFoundUsers] = element;
                  numFoundUsers++;
                } 
              }
            }
          });

          //I assemble the discovered users into an array.
          //This array can be directly passed on to the ejs for assembly into the page.
          //I will store the json data in the req.session.user object for easy use.

          req.session.user[1] = foundUsers;
          res.redirect('/'); // CHANGE TO SOMEWHERE ELSE IF NEEDED.

        })
        .catch(function (err) {
          console.log(err);
          console.log('ERROR WITHIN SECOND QUERY');
          res.redirect('/');
        });
    })
    .catch(function (err) {
      console.log(err);
      console.log('ERROR WITHIN FIRST QUERY');
      res.redirect('/');
    });
});



app.post('/getmessages', async (req, res) => {
  /*
    TODO:
     - Move this code around as needed, this is just a proof of concept for the db queries.
       If this code needs to be within a different request to make things work, that is okay.
    POST REQUEST:
     REQ:
      - Send nothing, user ID will be pulled from the current session
     RES:
      - Returns a list of messages as json for displaying in ejs.
      - Format of response:
        [
          {message: 'mes1', username: 'person who sent the message'},
          {message: 'mes2', username: 'sender'},
          etc...
        ]
        This should be accessed in the form res[index]['message'] for the message itself or res[index]['username'] for the sender username
  */

  // First I am gathering the important stuff, being the message text and the username, which is the data to be displayed to the user.
  var query = 'select message, username from messages' +
              // This is going to match the messages to their senders
              ' inner join user_to_messages on messages.message_id=user_to_messages.message_id' +
              // This matches the sender to the messages they sent
              ' inner join users on messages.sender_id=users.user_id' +
              // Then this only will pull the messages with the current logged in user's id as the recipient.
              ' where user_to_messages.recipient_id=' + req.session.user['user_id'] + ';';
  db.any(query)
      .then(function (data) {
          // This should be changed when the inbox has been figured out.
          console.log(data);
          //res.render('/views/pages/inbox.ejs', data);
      })
      .catch(function (err) {
          res.redirect('/inbox');
      });

});



app.post('/sendmessage', async (req, res) => {
  /*
    TODO:
     - 
    POST REQUEST:
     REQ:
      - Send username of recipient as 'recipient' in post request body
      - Send message as 'message' in post request body
     RES:
      - Sends message and returns status response in json format.
  */

  // This query returns the recipient's user_id from the db.
  var query1 = 'select user_id from users where username=\'' + req.body.recipient + '\';';
  // Gathers the sender_id from the user's saved session data, populated on login.
  var senderId = req.session.user['user_id']; 
  db.any(query1)
      .then(async function (data) {
          // This next line extracts the recipient's id from the data returned by the db.
          var recipientID = data[0]['user_id'];
          // This next query will insert the message data into the 'messages' table of the db, and return the serialized message_id primary key for inserting into the user_to_messages relation.
          var messagequery = await db.any('insert into messages (sender_id, message) values (' + senderId + ', \'' + req.body.message + '\') returning message_id;');
          // This next query will use the serialized primary key to link the recipient to the message sent.
          var linkmessage = await db.any('insert into user_to_messages (recipient_id, message_id) values ('+ recipientID +', ' + messagequery[0]['message_id'] + ');');

          // Change as needed.
          res.render('/views/pages/inbox.ejs', {"status":"Message has been sent!"});
      })
      .catch(function (err) {
          console.log(err);
          res.redirect('/inbox');
      });

});

app.get("/", (req, res) => {
  res.render("pages/home.ejs", {
    username: req.session.user.username,
    housing_id: req.session.user.housing_id,
    graduation_year: req.session.user.graduation_year,
    graduation_season_id: req.session.user.graduation_season_id,
    min_rent: req.session.user.min_rent,
    max_rent: req.session.user.max_rent,
    about_me: req.session.user.about_me,
  });
});



app.get("/profile", (req, res) => {
  res.render("pages/profile.ejs", {
    username: req.session.user.username,
    housing_id: req.session.user.housing_id,
    graduation_year: req.session.user.graduation_year,
    graduation_season_id: req.session.user.graduation_season_id,
    min_rent: req.session.user.min_rent,
    max_rent: req.session.user.max_rent,
    about_me: req.session.user.about_me,
  });
});



app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/logout.ejs");
});





app.listen(3000);
console.log("Server is listening on port 3000");
