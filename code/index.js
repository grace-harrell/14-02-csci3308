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
app.post("/login", (req, res) => {
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
          console.log(data);
          const match = await bcrypt.compare(password, data[0].password);
          console.log(match);
          if(match) {
            console.log('login successful');
            req.session.save();
            res.redirect('/home');
          } else {
              res.redirect('/login');
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
  */
  const hash = await bcrypt.hash(req.body.password, 10);
  var query = 'insert into users(username, password) values (\'' + req.body.username + '\', \'' + hash + '\');';
  db.any(query)
      .then(function (data) {
          res.redirect('/login');
      })
      .catch(function (err) {
          res.redirect('/register');
      });
});





// Authentication middleware.
const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};

app.use(auth);
app.listen(80);
console.log("Server is listening on port 80");
