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