const apiUrl = 'http://localhost:3000';
const endpoint = '/test'

fetch(apiUrl + endpoint)
    .then(response => response.json())
    .then(data => {
        // Handle the response data here
        document.getElementById('test').innerHTML = data.message;
        console.log(data);
    })
    .catch(error => {

        console.error(error);
    });