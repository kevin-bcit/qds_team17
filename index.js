require("./utils");
require("dotenv").config();
const express = require("express");
const app = express();
const session = require("express-session");
const mySqlStore = require("express-mysql-session")(session);
const bcrypt = require("bcrypt");
const cors = require("cors");
const fs = require("fs");
saltRounds = 12;

const database = require("./databaseConnection");
const { createUser, getUser } = include("database/users");

const port = process.env.PORT || 3000;
app.use(express.static(__dirname + "/frontend"));

app.use(cors());

// Session setup
const expireTime = 1000 * 60 * 60 * 2;
const options = {
  connectionLimit: 10,
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  createDatabaseTable: true,
};
const sessionStore = new mySqlStore(options);
app.use(
  session({
    name: "QDSTeam17Session",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: expireTime,
      sameSite: true,
      secure: true,
    },
  })
);

// Middlewares
app.use(express.urlencoded({ extended: false }));

function isValidSession(req) {
  if (req.session.authenticated) {
    return true;
  }
  return false;
}

function reqLogin(req, res, next) {
  if (isValidSession(req)) {
    next();
  } else {
    req.session.destroy();
    res.redirect("/");
    return;
  }
}

app.use("/dashboard", reqLogin);

//#region PUBLIC PAGES
//todo: change all route routes
app.get("/", function (req, res) {
  let doc;
  if (!req.session.loggedIn) {
    doc = fs.readFileSync("./frontend/dashboard.html", "utf8");
  } else {
    doc = fs.readFileSync("./frontend/dashboard.html", "utf8");
  }
  res.send(doc);
});

app.get("/login", function (req, res) {
  let doc = fs.readFileSync("./frontend/login.html", "utf8");
  res.send(doc);
});

app.get("/signup", function (req, res) {
  let doc = fs.readFileSync("./frontend/signup.html", "utf8");
  res.send(doc);
});

app.post("/signingUp", async (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var gender = req.body.gender;
  var location = req.body.location;
  var quote = req.body.quote;
  if (!username && !password) {
    res.redirect("/signup?missingUsername=1&missingPassword=1");
    return;
  } else if (!username) {
    res.redirect("/signup?missingUsername=1");
    return;
  } else if (!password) {
    res.redirect("/signup?missingPassword=1");
    return;
  } else {
    var hashedPassword = bcrypt.hashSync(password, saltRounds);
    var success = await createUser({
      user: username,
      hashedPassword: hashedPassword,
      firstName: firstName,
      lastName: lastName,
      gender: gender,
      location: location,
      quote: quote,
    });
    if (success) {
      req.session.authenticated = true;
      req.session.username = username;
      req.session.cookie.maxAge = expireTime;
      res.redirect("/dashboard");
      return;
    } else {
      res.redirect("/signup");
      return;
    }
  }
});

app.get("/dashboard", reqLogin, function (req, res) {
  let doc = fs.readFileSync("./frontend/dashboard.html", "utf8");
  res.send(doc);
});

app.get("/community", function (req, res) {
  let doc = fs.readFileSync("./frontend/community.html", "utf8");
  res.send(doc);
});

//#end region route

//#region API

//#end region API
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
