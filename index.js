require("./utils");
require("dotenv").config();
const express = require("express");
const app = express();
const session = require("express-session");
const bcrypt = require("bcrypt");
const cors = require("cors");
const fs = require("fs");
const bodyParser = require("body-parser");
var urlencodedParser = bodyParser.json({
  extended: false,
});
const saltRounds = 12;

const databasePool = require("./databaseConnection");
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

function reqLogin(req, res, next) {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
    return;
  }
}

//#region PUBLIC PAGES
//todo: change all route routes
app.get("/", function (req, res) {
  let doc;
  if (!req.session.loggedIn) {
    doc = fs.readFileSync("./frontend/login.html", "utf8");
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

app.get("/dashboard", reqLogin, function (req, res) {
  let doc = fs.readFileSync("./frontend/dashboard.html", "utf8");
  res.send(doc);
});

app.get("/community", function (req, res) {
  let doc = fs.readFileSync("./frontend/community.html", "utf8");
  res.send(doc);
});

app.get("/comment", function (req, res) {
  let doc = fs.readFileSync("./frontend/comment.html", "utf8");
  res.send(doc);
});

app.get("/details", function (req, res) {
  let doc = fs.readFileSync("./frontend/details.html", "utf8");
  res.send(doc);
});

//#end region route

//#region API

//todo: create/ delete/ edit account

app.post("/api/signup", urlencodedParser, function (req, res) {
  res.setHeader("Content-Type", "application/json");
  const param = {
    username: req.body.username,
    password: bcrypt.hashSync(req.body.password, saltRounds),
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    birthDate: req.body.birthDate,
    gender: req.body.gender,
    location: req.body.location,
    quote: req.body.quote,
  };

  let query = `
  INSERT INTO user
  (username, password, first_name, last_name, birth_date, gender, location, quote)
  VALUES
  (:username, :password, :firstName, :lastName, :birthDate, :gender, :location, :quote);
  `;

  databasePool.query(query, param, (err, result) => {
    if (err) {
      res.status(400).send({
        result: "Failed",
        msg: "Failed to create account.",
      });
    } else {
      res.status(200).send({
        result: "Success",
        msg: "Successfully created account.",
      });
    }
  });
});

app.post("/api/login", urlencodedParser, function (req, res) {
  res.setHeader("Content-Type", "application/json");
  const password = req.body.password;
  const user = req.body.username ? req.body.username : req.body.email;

  //TODO: Make authentication system
  authenticate(user, password, (result) => {
    if (result.status == 200) {
      req.session.loggedIn = true;
      req.session.user_id = result.user.user_id;
      req.session.username = result.user.username;
      req.session.first_name = result.user.first_name;
      req.session.last_name = result.user.last_name;
      req.session.birth_date = result.user.birth_date;
      req.session.gender = result.user.gender;
      req.session.location = result.user.location;
      req.session.quote = result.user.quote;

      req.session.save(function (err) {
        //console.log(err);
      });
      res.status(200).send({
        result: "Successfully logged in.",
      });
    } else {
      res.status(400).send({
        result: "Failed to log in.",
      });
    }
  });
});

app.get("/api/logout", function (req, res) {
  if (req.session) {
    req.session.destroy(function (error) {
      if (error) {
        res.status(400).send({
          result: "Failed",
          msg: "Could not log out.",
        });
      } else {
        res.status(200).send({
          result: "Succeeded",
          msg: "Successfully logged out.",
        });
      }
    });
  }
});

app.get("/api/getUserInfo", urlencodedParser, function (req, res) {
  if (
    (req.query.uid == undefined && req.query.username == undefined) ||
    (req.query.uid == null && req.query.username == null)
  ) {
    if (req.session.loggedIn) {
      //console.log(req.session)
      res.send({
        loggedIn: true,
        userID: req.session.user_id,
        username: req.session.username,
        firstName: req.session.first_name,
        lastName: req.session.first_name,
        birthDate: req.session.birth_date,
        gender: req.session.gender,
        location: req.session.location,
        quote: req.session.quote,
      });
    } else {
      res.send({
        loggedIn: false,
      });
    }
  } else {
    let checkIfExists = `
      SELECT
        user_id,
        username,
        first_name,
        last_name,
        birth_date,
        gender,
        location,
        quote
      FROM user
      WHERE username = :username OR user_id = :userId;
      `;
    let params = {
      username: req.query.username,
      userId: parseInt(req.query.uid ? req.query.uid : -1),
    };
    databasePool.query(checkIfExists, params, (err, result) => {
      if (result != null && result.length > 0) {
        res.status(200).send({
          result: "Success",
          msg: "Sucessfully found user.",
          userID: result[0].user_id,
          username: result[0].username,
          firstName: result[0].first_name,
          lastName: result[0].first_name,
          birthDate: result[0].birth_date,
          gender: result[0].gender,
          location: result[0].location,
          quote: result[0].quote,
        });
      } else {
        res.status(400).send({
          result: "Failed",
          msg: "User not found.",
        });
      }
    });
  }
});

// Challenge API
app.get("/api/getChallengeInfo", urlencodedParser, function (req, res) {
  let query = `SELECT challenge_id, item, title, description, default_target FROM challenge WHERE challenge_id = :challengeId;
      `;
  let params = {
    challengeId: req.query.challengeId,
  };
  databasePool.query(query, params, (err, result) => {
    if (result != null && result.length > 0) {
      res.status(200).send({
        result: "Success",
        msg: "Sucessfully found challenge.",
        challengeId: result[0].challenge_id,
        item: result[0].item,
        title: result[0].title,
        description: result[0].description,
        default_target: result[0].default_target,
      });
    } else {
      res.status(400).send({
        result: "Failed",
        msg: "Challenge not found.",
      });
    }
  });
});

// Prgress API
app.post("/api/createProgress", urlencodedParser, function (req, res) {
  res.setHeader("Content-Type", "application/json");
  if (!req.session.loggedIn) {
    const user_id = req.body.userId;
    const challenge_id = req.body.challenge_id;
    const target = req.body.target;
    const completed_amount = 0;
    const now = new Date();
    const creation_date = now.toISOString().slice(0, 10);
    const last_update_date = now.toISOString().slice(0, 19).replace("T", " ");

    let query =
      "INSERT INTO progress (user_id, challenge_id, target, completed_amount, creation_date, last_update_date) VALUES ?";
    let recordValues = [
      [
        user_id,
        challenge_id,
        target,
        completed_amount,
        creation_date,
        last_update_date,
      ],
    ];

    databasePool.query(query, recordValues);
    res.send({
      result: "Success",
      msg: "Progress saved.",
    });
  } else {
    res.send({
      result: "Failed",
      msg: "Not logged in.",
    });
  }
});

app.post("/api/updateProgress", urlencodedParser, function (req, res) {
  res.setHeader("Content-Type", "application/json");
  if (!req.session.loggedIn) {
    const now = new Date();

    let query =
      "UPDATE progress SET last_update_date = :last_update_date, completed_amount = :completed_amount WHERE progress_id = :progress_id";
    let params = {
      last_update_date: now.toISOString().slice(0, 19).replace("T", " "),
      completed_amount: req.body.completed_amount,
      progress_id: req.body.progress_id,
    };

    databasePool.query(query, params);
    res.send({
      result: "Success",
      msg: "Progress updated.",
    });
  } else {
    res.send({
      result: "Failed",
      msg: "Not logged in.",
    });
  }
});

app.get("/api/getProgress", urlencodedParser, function (req, res) {
  let query = `SELECT challenge_id, completed_amount, target FROM progress WHERE progress_id = :progress_id;`;
  let params = {
    progress_id: req.query.progress_id,
  };
  databasePool.query(query, params, (err, result) => {
    if (result != null && result.length > 0) {
      res.status(200).send({
        result: "Success",
        msg: "Sucessfully found progress.",
        challengeId: result[0].challenge_id,
        percentageCompleteByDay: result[0].completed_amount / result[0].target
      });
    } else {
      res.status(400).send({
        result: "Failed",
        msg: "Challenge not found.",
      });
    }
  });
});

//#end region API
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
