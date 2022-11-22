const express = require("express");
const app = express();
const pgp = require("pg-promise")();
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");



/*
  NOTES FOR EDITING INDEX JS:
    - All pages that should be able to be accessed need to be placed before the app.use(auth) statement.
    - Any changes to the db Create or Insert files will require a postgres shell inserts to take effect.
*/



const dbConfig = {
  host: "db",
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};


const db = pgp(dbConfig);


db.connect()
  .then((obj) => {
    // Can check the server version here (pg-promise v10.1.0+):
    console.log("Database connection successful");
    obj.done(); // success, release the connection;
  })
  .catch((error) => {
    console.log("ERROR:", error.message || error);
  });

app.set("view engine", "ejs");
app.use(bodyParser.json());


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


app.get("/", (req, res) => {
  res.render("pages/home.ejs");
});


app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/logout.ejs");
});


app.get("/login", (req, res) => {
  res.render("pages/login.ejs");
});


/* TODO:
    - Make register page
*/
app.get("/register", (req, res) => {
  res.render("pages/register.ejs");
});


app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  var query = "select * from users where username = '" + username + "';";
  console.log(query);
  db.any(query)
    .then(async function (data) {
      if (data.length == 0) {
        res.redirect("/login");
      } else {
        let match = await bcrypt.compare(password, data[0].password);
        match = true; // TEMP CHANGE THIS --------------------------------------------
        if (match) {
          req.session.user = {
            username: username,
            user_id: data[0]["user_id"],
            housing_id: data[0]["housing_id"],
            graduation_year: data[0]["graduation_year"],
            graduation_season_id: data[0]["graduation_season_id"],
            min_rent: data[0]["min_rent"],
            max_rent: data[0]["max_rent"],
            about_me: data[0]["about_me"],
            foundUsers: [],
          };
          console.log("login successful");
          console.log(req.session.user);
          req.session.save();
          res.redirect("/");
        } else {
          res.redirect("/login");
        }
      }
    })
    .catch(function (err) {
      console.log(err);
      res.redirect("/register");
    });
});


app.get("/login", (req, res) => {
  res.render("pages/login.ejs");
});


app.post("/register", async (req, res) => {
  /*
      (is_admin, username, password, dorm_id, preferences, about_me)

      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY NOT NULL,
        is_admin boolean NOT NULL,
        username VARCHAR(100) NOT NULL,
        password VARCHAR(100) NOT NULL,
        housing_id integer,
        graduation_year integer,
        graduation_season_id integer,
        min_rent integer,
        max_rent integer,
        about_me VARCHAR(500)
      );
  */
  const is_admin = false;
  const username = req.body.username;
  const housing_id = req.body.housing_id;
  const graduation_year = req.body.graduation_year;
  const graduation_season_id = req.body.graduation_season_id;
  const min_rent = req.body.min_rent;
  const max_rent = req.body.max_rent;
  const about_me = req.body.about_me;
  const hash = await bcrypt.hash(req.body.password, 10);
  var query = 'insert into users (is_admin, username, password, housing_id, graduation_year, graduation_season_id, min_rent, max_rent, about_me) values ' + 
              '(False, \'' + req.body.username + '\', \'' + hash + '\', ' + housing_id + ', ' + graduation_year + ', 0, ' +
              min_rent + ', ' + max_rent + ', \'' + about_me + '\')';

  console.log(query);
  db.any(query)
      .then(function (data) {
          console.log(data);
          res.redirect('/login');
      })
      .catch(function (err) {
          console.log(err);
          res.redirect('/register');
      });
});


app.get("/register", (req, res) => {
  res.render("views/pages/register.ejs");
});


// Authentication middleware.
const auth = (req, res, next) => {
  if (!req.session.user) {
    console.log("not logged in");
    return res.redirect("/login");
  }
  next();
};






// --------------------------------------------------------------------------------------------------------------------------------------
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
  const finduserquery =
    "select * from users where username = '" + req.session.user.username + "';";

  // EXECUTE FIRST QUERY
  db.any(finduserquery)
    .then(function (userreqdata) {


      const getusersquery = 'select username, housing_id, graduation_year, min_rent, max_rent, about_me from users;';


      // EXECUTE SECOND QUERY
      db.any(getusersquery)
        .then(function (allusers) {
          // At this point, we have the info of the user who requested data, and the info of all users in the table.
          // getusersquery should return users in json format as an array
          let foundUsers = [];
          let numFoundUsers = 0;

          allusers.forEach(element => {
            if(userreqdata[0]['graduation_year'] == element['graduation_year']) {
              if(userreqdata[0]['min_rent'] > (element['min_rent'] - 200) && userreqdata[0]['min_rent'] < (element['min_rent'] + 200)) {
                if(userreqdata[0]['min_rent'] > (element['min_rent'] - 200) && userreqdata[0]['min_rent'] < (element['min_rent'] + 200)) {
                  if (!foundUsers.includes(element) && !(element['username'] == req.session.user.username)) {
                    foundUsers[numFoundUsers] = element;
                    numFoundUsers++;
                  }
                  
                }
              }
            }
          });

          //I assemble the discovered users into an array.
          //This array can be directly passed on to the ejs for assembly into the page.
          //I will store the json data in the req.session.user object for easy use.

          req.session.user['foundUsers'] = foundUsers;
          res.render("pages/roommates.ejs", {foundUsers: req.session.user['foundUsers']});
        })
        .catch(function (err) {
          console.log(err);
          console.log("ERROR WITHIN SECOND QUERY");
        });
    })
    .catch(function (err) {
      console.log(err);
      console.log("ERROR WITHIN FIRST QUERY");
    });
});


app.post("/getmessages", async (req, res) => {
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
  var query =
    "select message, username from messages" +
    // This is going to match the messages to their senders
    " inner join user_to_messages on messages.message_id=user_to_messages.message_id" +
    // This matches the sender to the messages they sent
    " inner join users on messages.sender_id=users.user_id" +
    // Then this only will pull the messages with the current logged in user's id as the recipient.
    " where user_to_messages.recipient_id=" +
    req.session.user["user_id"] +
    ";";
  db.any(query)
    .then(function (data) {
      // This should be changed when the inbox has been figured out.
      console.log(data);
      //res.render('/views/pages/inbox.ejs', data);
    })
    .catch(function (err) {
      res.redirect("/inbox");
    });
});

app.post("/sendmessage", async (req, res) => {
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
  var query1 =
    "select user_id from users where username='" + req.body.recipient + "';";
  // Gathers the sender_id from the user's saved session data, populated on login.
  var senderId = req.session.user["user_id"];
  db.any(query1)
    .then(async function (data) {
      // This next line extracts the recipient's id from the data returned by the db.
      var recipientID = data[0]["user_id"];
      // This next query will insert the message data into the 'messages' table of the db, and return the serialized message_id primary key for inserting into the user_to_messages relation.
      var messagequery = await db.any(
        "insert into messages (sender_id, message) values (" +
          senderId +
          ", '" +
          req.body.message +
          "') returning message_id;"
      );
      // This next query will use the serialized primary key to link the recipient to the message sent.
      var linkmessage = await db.any(
        "insert into user_to_messages (recipient_id, message_id) values (" +
          recipientID +
          ", " +
          messagequery[0]["message_id"] +
          ");"
      );

      // Change as needed.
      res.render("/views/pages/inbox.ejs", {
        status: "Message has been sent!",
      });
    })
    .catch(function (err) {
      console.log(err);
      res.redirect("/inbox");
    });
});


app.post("/updateprofile", (req, res) => {
  var query = 'update users set about_me = \'' + req.body.about_me + '\', housing_id = ' +
              req.body.housing_id + ', graduation_year = ' + req.body.graduation_year + ', min_rent = ' +
              req.body.min_rent + ', max_rent = ' + req.body.max_rent + ' where username = \'' + req.session.user.username + '\';';
  
  db.any(query)
    .then(function (data) {
      var query = "select * from users where username = '" + req.session.user.username + "';";
      db.any(query)
        .then(async function (data) {
          if (data.length == 0) {
            res.redirect("/login");
          } else {
            req.session.user = {
              username: data[0]['username'],
              user_id: data[0]["user_id"],
              housing_id: data[0]["housing_id"],
              graduation_year: data[0]["graduation_year"],
              graduation_season_id: data[0]["graduation_season_id"],
              min_rent: data[0]["min_rent"],
              max_rent: data[0]["max_rent"],
              about_me: data[0]["about_me"],
              foundUsers: [],
            };
            console.log("session struct refreshed with new information.");
            req.session.save();
          }
        })
        .then(function (data) {
          res.redirect("/profile");
        });
    })
    .catch(function (err) {
      console.log("Error in updateprofile db query.");
      res.redirect("/");
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

app.get("/profile", async (req, res) => {
  console.log("profile", {
    username: req.session.user.username,
    housing_id: req.session.user.housing_id,
    graduation_year: req.session.user.graduation_year,
    graduation_season_id: req.session.user.graduation_season_id,
    min_rent: req.session.user.min_rent,
    max_rent: req.session.user.max_rent,
    about_me: req.session.user.about_me,
  });
  await res.render("pages/profile", {
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
