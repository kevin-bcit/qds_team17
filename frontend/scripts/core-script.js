const apiUrl = 'http://localhost:3000';
const endpointUserInfo = '/api/getUserInfo';



// fetch(apiUrl + endpointLogin, {
//   method: 'POST',
//   headers: {
//     'Accept': 'application/json, text/plain, */*',
//     'Content-Type': 'application/json'
//   },
//   body: JSON.stringify({"username": username, "password": password})
// }).then(res => res.json()).then(res => 
    
//     console.log(res)

// ).catch(err => console.log(err));


// fetch(apiUrl + endpoint).then(response => response.json()).then(data => {
        
//     document.getElementById("nav_item1").innerHTML = `Welcome ${data.message}`;
//     console.log(data);
// })
// .catch(error =>console.error(error))



;(async ()=> {

    // headers = {
    //     'Accept': 'application/json, text/plain, */*',
    //     'Content-Type': 'application/json'
    // }
    // body = JSON.stringify({"username": username, "password": password})

    // const login = await fetch(apiUrl + endpointLogin, {method: 'POST', headers: headers, body:body})
    // res = await login.json()
    // console.log(res)

    const response = await fetch(apiUrl + endpointUserInfo);
    const data = await response.json();
    console.log(data);

    const res2 = await getRequest(`/api/getChallengeInfo?challengeId=${challengeID}`);
    console.log(res2);



})()
    


// {
//     "result": "Success",
//     "msg": "Sucessfully found progress.",
//     "challengeId": 1,
//     "percentageCompleteByDay": 1
// }