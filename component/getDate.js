// component/getAiResponse.js
async function getDate(query) {
  let date = await fetch('https://www.corezoid.com/api/2/json/public/1416443/8286c69bb2c23fb9e986a1e0587d6434a8c569bb', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(query) // Преобразование объекта в строку JSON
  })
    .then(res => res.json())
    .then(date => {
      return date
    })
    .catch(err => {
      return err
    })
    console.log(date);
}

module.exports = { getDate };
