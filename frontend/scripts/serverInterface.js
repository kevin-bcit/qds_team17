// HTTP Request //
function postRequest(url, data) {
    return new Promise(resolve => {
        let xmlHttp = new XMLHttpRequest();

        xmlHttp.open("POST", url, true);
        xmlHttp.setRequestHeader('Content-type', 'application/json');

        xmlHttp.onload = function() {
            resolve(xmlHttp.response);
        }

        xmlHttp.send(JSON.stringify(data));
    });
}

function getRequest(url) {
    return new Promise(resolve => {
        let xmlHttp = new XMLHttpRequest();

        xmlHttp.open("GET", url, true);
        xmlHttp.onload = function() {
            resolve(xmlHttp.response);
        }

        xmlHttp.send(null);
    });
}

// END: HTTP Request //


// Server interface//
async function login(username = "testuser") {
    let res = await postRequest("/api/login", {
        password: "testPass",
        username: username
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