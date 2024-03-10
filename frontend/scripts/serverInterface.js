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

async function getRewardStatus(userId) {
  let res = await getRequest(`/api/getRewardStatus?userId=${userId}`);
  console.log(res);
  return res;
}

async function setComment(progress_id, content) {
  let res = await postRequest("/api/setComment", {
    progress_id: progress_id,
    content: content,
  });
  console.log(res);
}

async function getComment(progress_id) {
  let res = await getRequest(`/api/getComment?progress_id=${progress_id}`);
  console.log(res);
  return res;
}

async function getTodayProgress() {
  let res = await getRequest(`/api/getTodayProgress`);
  console.log(res);
  return res;
}
