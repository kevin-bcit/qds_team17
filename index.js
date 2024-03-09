require("./utils");
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");
saltRounds = 12;

const { printMySQLVersion } = include("database/db_utils");
const { createUser, getUser } = include("database/users");
printMySQLVersion();

const app = express();
const port = process.env.PORT || 3000;
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

const expireTime = 60 * 60 * 1000;
const picURL = {
  0: "lakeLouise.jpg",
  1: "mountain.jpg",
  2: "sunrise.jpg",
};
const getRandomPicIndex = () => {
  return Math.floor(Math.random() * 2);
};

// MongoDB setup
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
var mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@assignment1-v1.o5clsqp.mongodb.net/sessions`,
  crypto: {
    secret: mongodb_session_secret,
  },
});

// Session setup
const node_session_secret = process.env.NODE_SESSION_SECRET;
app.use(
  session({
    secret: node_session_secret,
    store: mongoStore,
    saveUninitialized: false,
    resave: true,
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

function sessionValidation(req, res, next) {
  if (!isValidSession(req)) {
    req.session.destroy();
    res.redirect("/");
    return;
  } else {
    next();
  }
}

app.use("/members", sessionValidation);

// Routes
app.get("/", (req, res) => {
  if (isValidSession(req)) {
    res.render("index", {
      username:
        req.session.username.charAt(0).toUpperCase() +
        req.session.username.slice(1),
    });
  } else {
    req.session.destroy();
    res.render("index", {
      username: null,
    });
  }
});

app.get("/signup", (req, res) => {
  var missingUsername = req.query.missingUsername;
  var missingPassword = req.query.missingPassword;
  res.render("signup", {
    missingUsername: missingUsername,
    missingPassword: missingPassword,
  });
});

app.post("/signingUp", async (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
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
    });

    if (success) {
      req.session.authenticated = true;
      req.session.username = username;
      req.session.cookie.maxAge = expireTime;
      res.render("members", {
        username:
          req.session.username.charAt(0).toUpperCase() +
          req.session.username.slice(1),
        picURL: picURL[getRandomPicIndex()],
      });
      return;
    } else {
      res.render("errorMessage", { error: "Failed to create user." });
      return;
    }
  }
});

app.get("/login", (req, res) => {
  var missingUsername = req.query.missingUsername;
  var missingPassword = req.query.missingPassword;
  var incorrectUsername = req.query.incorrectUsername;
  var incorrectPassword = req.query.incorrectPassword;
  res.render("login", {
    missingUsername: missingUsername,
    missingPassword: missingPassword,
    incorrectUsername: incorrectUsername,
    incorrectPassword: incorrectPassword,
  });
});

app.post("/loggingIn", async (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  if (!username && !password) {
    res.redirect("/login?missingUsername=1&missingPassword=1");
    return;
  } else if (!username) {
    res.redirect("/login?missingUsername=1");
    return;
  } else if (!password) {
    res.redirect("/login?missingPassword=1");
    return;
  } else {
    var results = await getUser({
      user: username,
      hashedPassword: password,
    });

    if (results) {
      if (results.length == 1) {
        if (bcrypt.compareSync(password, results[0].password)) {
          req.session.authenticated = true;
          req.session.username = username;
          req.session.cookie.maxAge = expireTime;
          res.redirect("/members");
          return;
        } else {
          res.redirect("/login?incorrectPassword=1");
          return;
        }
      } else {
        res.redirect("/login?incorrectUsername=1");
        return;
      }
    } else {
      res.redirect("/login?incorrectUsername=1");
      return;
    }
  }
});

app.get("/members", (req, res) => {
  if (!req.session.authenticated) {
    res.redirect("/");
    return;
  }

  res.render("members", {
    username:
      req.session.username.charAt(0).toUpperCase() +
      req.session.username.slice(1),
    picURL: picURL[getRandomPicIndex()],
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
  return;
});

app.get("*", (req, res) => {
  res.status(404);
  res.send("Page not found - 404");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
