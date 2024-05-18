async function getUser() {
    return fetch('https://jsonplaceholder.typicode.com/todos/1')
        .then(response => response.json());
}
module.exports.getUser = getUser; 