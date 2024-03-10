const database = include("databaseConnection");

async function createUser(postData) {
  let createUserSQL = `
		INSERT INTO user
		(username, password, first_name, last_name, gender, location, quote)
		VALUES
		(:user, :passwordHash, :firstName, :lastName, :gender, :location, :quote);
	`;

  let params = {
    user: postData.user,
    passwordHash: postData.hashedPassword,
    firstName: postData.firstName,
    lastName: postData.lastName,
    gender: postData.gender,
    location: postData.location,
    quote: postData.quote,
  };

  try {
    const results = await database.query(createUserSQL, params);

    console.log("Successfully created user");
    console.log(results[0]);
    return true;
  } catch (err) {
    console.log("Error inserting user");
    console.log(err);
    return false;
  }
}

async function getUser(postData) {
  let getUserSQL = `
		SELECT user_id, username, password
		FROM user
		WHERE username = :user;
	`;

  let params = {
    user: postData.user,
  };

  try {
    const results = await database.query(getUserSQL, params);
    console.log("Successfully found user");
    console.log(results[0]);
    return results[0];
  } catch (err) {
    console.log("Error trying to find user");
    console.log(err);
    return false;
  }
}

module.exports = { createUser, getUser };
