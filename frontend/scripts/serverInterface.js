// HTTP Request //
function postRequest(url, data) {
  return new Promise((resolve) => {
    let xmlHttp = new XMLHttpRequest();

    xmlHttp.open("POST", url, true);
    xmlHttp.setRequestHeader("Content-type", "application/json");

    xmlHttp.onload = function () {
      resolve(xmlHttp.response);
    };

    xmlHttp.send(JSON.stringify(data));
  });
}

function getRequest(url) {
  return new Promise((resolve) => {
    let xmlHttp = new XMLHttpRequest();

    xmlHttp.open("GET", url, true);
    xmlHttp.onload = function () {
      resolve(xmlHttp.response);
    };

    xmlHttp.send(null);
  });
}

// END: HTTP Request //

// Server interface//
async function login(username = "testuser") {
  let res = await postRequest("/api/login", {
    password: "testPass",
    username: username,
  });
  console.log(res);
}

async function logout() {
  let res = await getRequest("/api/logout");
  console.log(res);
}

async function getUserInfo() {
  let res = await getRequest("/api/getUserInfo");
  console.log(res);
  return res;
}

async function getOtherUserInfo(id) {
  let res = await getRequest(`/api/getUserInfo?uid=${id}`);
  console.log(res);
  return res;
}

async function getOtherUserInfoByName(username) {
  let res = await getRequest(`/api/getUserInfo?username=${username}`);
  console.log(res);
  return res;
}

async function getChallengeInfo(challengeID) {
  let res = await getRequest(
    `/api/getChallengeInfo?challengeId=${challengeID}`
  );
  console.log(res);
  return res;
}

async function createProgress(userId, challenge_id, target) {
  let res = await postRequest("/api/createProgress", {
    userId: userId,
    challenge_id: challenge_id,
    target: target,
  });
  console.log(res);
}

// @param completed_amount should be total amount of the day (not updated amount)
async function updateProgress(progress_id, completed_amount) {
  let res = await postRequest("/api/updateProgress", {
    progress_id: progress_id,
    completed_amount: completed_amount,
  });
  console.log(res);
}

async function getProgress(progress_id) {
  let res = await getRequest(`/api/getProgress?progress_id=${progress_id}`);
  console.log(res);
  return res;
}

async function getQuote() {
  let res = await getRequest(`/api/getQuote`);
  console.log(res);
  return res;
}

// rewardStatus (userId)
// return {reward: apple, quantity: 2}
// Note: First, Calculate the PercentageCompleteByDay*10. Then find the Max(Required_points). and divide to get the floor(quantity) and reward item. E.g. on 3rd day, user drink the 6th cup, he drank 8 + 8 + 6 = 22 cup,  PercentageCompleteByDay = 22*10 = 220, Max of reward is apple, quantity = floor(220/80) = 2

// SELECT
// 	user_id AS userId,
// 	(
// 		SUM(completed_amount / target >= 0.8 AND completed_amount / target < 1) * 0.5 +
// 		SUM(completed_amount / target = 1)
// 	) % 10 AS apple,
//     FLOOR((
// 		SUM(completed_amount / target >= 0.8 AND completed_amount / target < 1) * 0.5 +
// 		sum(completed_amount / target = 1)
// 	) / 10) AS applePie
// FROM progress
// WHERE user_id = 1
// GROUP BY user_id;
// setComments{comment_id, content}
// return success/fail

// INSERT INTO comment (
// progress_id,
// content,
// commentor_id,
// creation_date
// )
// VALUES ('1', 'Wow', '2', NOW());

// getComments{comment_id}
// return content

// SELECT c.progress_id AS progressId, c.content, c.commentor_id AS commentorID, u.username, c.creation_date AS creationDate
// FROM comment AS c
// JOIN user AS u
// ON c.commentor_id = u.user_id
// WHERE c.comment_id = 1;
