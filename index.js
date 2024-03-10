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
const saltRounds = 10;

const databasePool = require("./databaseConnection");
const e = require("express");

const port = process.env.PORT || 3000;
app.use(express.static(__dirname + "/frontend"));

app.use(cors());

// Session setup
const mySqlStore = require("express-mysql-session")(session);
const options = {
  connectionLimit: 10,
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  createDatabaseTable: true,
};
const sessionStore = new mySqlStore(options);
app.use(
  session({
    name: "QDSSession",
    secret: process.env.NODE_SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: false,
      sameSite: true,
    },
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
      res.redirect("/login");
    }
  });
});

app.post("/api/login", urlencodedParser, function (req, res) {
  res.setHeader("Content-Type", "application/json");
  const password = req.body.password;
  const username = req.body.username;

  let query = `
  SELECT user_id, username, password, first_name, last_name, birth_date, gender, location, quote
  FROM user
  WHERE username = :username;
  `;
  let params = {
    username: username,
  };

  databasePool.query(query, params, (err, queryResult) => {
    if (queryResult != null && queryResult.length > 0) {
      console.log(`user name: ${queryResult[0].username}`);
      bcrypt.compare(
        password,
        queryResult[0].password,
        (err, compareResult) => {
          if (compareResult) {
            console.log(`logged in: ${queryResult[0].username}`);
            req.session.loggedIn = true;
            req.session.user_id = queryResult[0].user_id;
            req.session.username = queryResult[0].username;
            req.session.first_name = queryResult[0].first_name;
            req.session.last_name = queryResult[0].last_name;
            req.session.birth_date = queryResult[0].birth_date;
            req.session.gender = queryResult[0].gender;
            req.session.location = queryResult[0].location;
            req.session.quote = queryResult[0].quote;
            console.log(`logged in: ${req.session.username}`);
            res.redirect("/dashboard");
          } else {
            res.status(400).send({
              result: "Failed",
              msg: "Password is incorrect.",
            });
          }
        }
      );
    } else {
      res.status(400).send({
        result: "Failed",
        msg: "Failed to fetch user info.",
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

app.get("/api/getRewardStatus", urlencodedParser, function (req, res) {
  let query = `
  SELECT
    user_id AS userId,
    (
      SUM(completed_amount / target >= 0.8 AND completed_amount / target < 1) * 0.5 +
      SUM(completed_amount / target = 1)
    ) % 10 AS numOfApple,
    FLOOR((
      SUM(completed_amount / target >= 0.8 AND completed_amount / target < 1) * 0.5 +
      SUM(completed_amount / target = 1)
    ) / 10) AS numOfApplePie
  FROM progress
  WHERE user_id = :userId
  GROUP BY user_id;
  `;
  let params = {
    userId: req.query.userId,
  };
  databasePool.query(query, params, (err, result) => {
    if (result != null && result.length > 0) {
      res.status(200).send({
        result: "Success",
        msg: "Successfully got reward status.",
        data: result[0],
      });
    } else {
      res.status(400).send({
        result: "Failed",
        msg: "Failed to get reward status.",
        data: undefined,
      });
    }
  });
});

// Challenge API
app.get("/api/getAllChallengeInfo", urlencodedParser, function (req, res) {
  let query = `SELECT * FROM challenge;`;
  databasePool.query(query, (err, result) => {
    if (result != null && result.length > 0) {
      res.status(200).send({
        result: "Success",
        msg: "Sucessfully found challenge.",
        data: result,
      });
    } else {
      res.status(400).send({
        result: "Failed",
        msg: "Challenge not found.",
      });
    }
  });
});

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
  if (req.session.loggedIn) {
    const user_id = req.body.userId;
    const challenge_id = req.body.challenge_id;
    const target = req.body.target;
    const completed_amount = 0;
    const now = new Date();
    const creation_date = now.toISOString().slice(0, 10);
    const last_update_date = now.toISOString().slice(0, 19).replace("T", " ");

    let query = `
      INSERT INTO progress (
        user_id,
        challenge_id,
        target,
        completed_amount,
        creation_date,
        last_update_date
      ) VALUES (
        :user_id,
        :challenge_id,
        :target,
        :completed_amount,
        :creation_date,
        :last_update_date
      );
      `;
    let params = {
      user_id: user_id,
      challenge_id: challenge_id,
      target: target,
      completed_amount: completed_amount,
      creation_date: creation_date,
      last_update_date: last_update_date,
    };

    databasePool.query(query, params, (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send({
          result: "Failed",
          msg: "Failed to create progress.",
        });
      } else {
        res.status(200).send({
          result: "Success",
          msg: "Progress created.",
        });
      }
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
  if (req.session.loggedIn) {
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
  let query = `
  SELECT p.challenge_id, p.completed_amount, p.target, u.user_id, u.username
  FROM progress AS p
  JOIN user AS u USING (user_id)
  WHERE progress_id = :progress_id;`;
  let params = {
    progress_id: req.query.progress_id,
  };
  databasePool.query(query, params, (err, result) => {
    if (result != null && result.length > 0) {
      res.status(200).send({
        result: "Success",
        msg: "Sucessfully found progress.",
        challengeId: result[0].challenge_id,
        percentageCompleteByDay: result[0].completed_amount / result[0].target,
        userId: result[0].user_id,
        username: result[0].username,
      });
    } else {
      res.status(400).send({
        result: "Failed",
        msg: "Progress not found.",
      });
    }
  });
});

app.get("/api/getTodayProgress", urlencodedParser, function (req, res) {
  let query = `
  SELECT p.*, c.title, c.item, u.unit
  FROM progress AS p
  JOIN challenge AS c USING (challenge_id)
  JOIN unit AS u USING (unit_id)
  WHERE creation_date >= ADDDATE(CURDATE(), INTERVAL -1 DAY)
  AND user_id = :userId;
  `;
  let params = { userId: req.session.user_id };
  databasePool.query(query, params, (err, result) => {
    if (result != null && result.length > 0) {
      res.status(200).send({
        result: "Success",
        msg: "Sucessfully found user's today progress.",
        data: result,
      });
    } else {
      res.status(400).send({
        result: "Failed",
        msg: "User's today progress not found.",
        data: undefined,
      });
    }
  });
});

app.get(
  "/api/getAllUserLastTwoDaysProgress",
  urlencodedParser,
  function (req, res) {
    let query = `
  SELECT p.*, c.title, c.item, u.unit
  FROM progress AS p
  JOIN challenge AS c USING (challenge_id)
  JOIN unit AS u USING (unit_id)
  WHERE creation_date >= ADDDATE(CURDATE(), INTERVAL -2 DAY);
  `;
    databasePool.query(query, (err, result) => {
      if (result != null && result.length > 0) {
        res.status(200).send({
          result: "Success",
          msg: "Sucessfully found all users progress in these 2 days.",
          data: result,
        });
      } else {
        res.status(400).send({
          result: "Failed",
          msg: "All users progress in these 2 days not found.",
          data: undefined,
        });
      }
    });
  }
);

// Comment API
app.post("/api/setComment", urlencodedParser, function (req, res) {
  res.setHeader("Content-Type", "application/json");
  if (req.session.loggedIn) {
    const now = new Date();
    const userID = req.session.user_id;
    let query =
      "INSERT INTO comment (progress_id, content, commentor_id, creation_date) VALUES?";
    let recordValues = [
      [
        req.body.progress_id,
        req.body.content,
        userID,
        now.toISOString().slice(0, 19).replace("T", " "),
      ],
    ];

    databasePool.query(query, recordValues);
    res.send({
      result: "Success",
      msg: "Comment updated.",
    });
  } else {
    res.send({
      result: "Failed",
      msg: "Not logged in.",
    });
  }
});

app.get("/api/getComment", urlencodedParser, function (req, res) {
  let query = `SELECT c.*, u.username 
  FROM comment c
  JOIN user u ON c.commentor_id = u.user_id
  WHERE c.progress_id = :progress_id;`;
  let params = {
    progress_id: req.query.progress_id,
  };
  databasePool.query(query, params, (err, result) => {
    if (result != null && result.length > 0) {
      res.status(200).send({
        result: "Success",
        msg: "Sucessfully found comments.",
        data: result,
      });
    } else {
      res.status(400).send({
        result: "Failed",
        msg: "Comment not found.",
      });
    }
  });
});

app.get("/api/getQuote", urlencodedParser, function (req, res) {
  let query = `
  SELECT user_id, username, quote
  FROM user
  ORDER BY RAND()
  LIMIT 1;
  `;
  databasePool.query(query, (err, result) => {
    if (result != null && result.length > 0) {
      res.status(200).send({
        result: "Success",
        msg: "Sucessfully got a quote.",
        userId: result[0].user_id,
        username: result[0].username,
        quote: result[0].quote,
      });
    } else {
      res.status(400).send({
        result: "Failed",
        msg: "Quote not found.",
      });
    }
  });
});

//#end region API
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
