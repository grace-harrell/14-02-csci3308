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

// Login submission
app.post("/login", async (req, res) => {
  /*
    NOTE:
      - I think that the username could be either a traditional username, or an email.
      - We could modify the db to store emails and usernames, however for our purpose I dont think emails would be that useful.
  */
  const username = req.body.username;
  const password = req.body.password;

  var query = 'select * from users where username = \'' + username + '\';';
  console.log(query);
  db.any(query)
      .then(async function (data) {
          if (data.length == 0) {
            res.redirect('/login');
          
          } else {
            let match = await bcrypt.compare(password, data[0].password);
            match = true; // TEMP CHANGE THIS --------------------------------------------
            if (match) {
              req.session.user = {
                username: username,
              };
              console.log('login successful');
              req.session.save();
              res.redirect('/home');
            } else {
              res.redirect('/login');
            }
          }

      })
      .catch(function (err) {
          console.log(err);
          res.redirect('/register');
      });
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





// Authentication middleware.
const auth = (req, res, next) => {
  if (!req.session.user) {
    console.log('not logged in');
    return res.redirect("/login");
  }
  next();
};

app.use(auth);
app.listen(80);
console.log("Server is listening on port 80");
