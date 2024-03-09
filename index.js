require("./utils");
require("dotenv").config();
const express = require("express");
const app = express();
const session = require("express-session");
const bcrypt = require("bcrypt");
const cors = require("cors");
const fs = require("fs");

const database = require("./databaseConnection");
// const { printMySQLVersion } = include("database/db_utils");
// const { createUser, getUser } = include("database/users");
// printMySQLVersion();

const port = process.env.PORT || 3000;
app.use(express.static(__dirname + "/frontend"));

app.use(cors());

// Session setup
// todo: Change this one (or not...)
const node_session_secret = process.env.NODE_SESSION_SECRET;
app.use(
  session({
    secret: process.env.NODE_SESSION_SECRET,
    name: "SWSession",
    resave: false,
    saveUninitialized: false,
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

//#region PUBLIC PAGES
//todo: change all route routes
app.get("/", (req, res) => {
  let doc;
  if (!req.session.loggedIn) {
    doc = fs.readFileSync("home.html", "utf8");
  } else {
    doc = fs.readFileSync("dashboard.html", "utf8");
  }
  res.send(doc);
});

app.get("/login", function (req, res) {
  let doc = fs.readFileSync("login.html", "utf8");
  res.send(doc);
});

app.get("/signup", function (req, res) {
  let doc = fs.readFileSync("signup.html", "utf8");
  res.send(doc);
});

app.get("/dashboard", reqLogin, function (req, res) {
  let doc = fs.readFileSync("dashboard.html", "utf8");
  res.send(doc);
});

app.get("/community", reqLogin, function (req, res) {
  let doc = fs.readFileSync("community.html", "utf8");
  res.send(doc);
});

//#end region route

//#region API

//#end region API
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
