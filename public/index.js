$('#submit-button').on('click', event => {
  const name = $('#name-search').val()
  const year = $('#year-search').val()

  getNames(name, year)
})

const getNames = (name, year) => {
  if (name && year) {
    fetch(`/api/v1/names?name=${name}&year=${year}`, {
      method: 'GET',
    }).then(response => {
      return response.json()
    }).then(json => {
      console.log(json)
    }).catch(error => console.log(error))
  } else if (name && !year) {
    fetch(`/api/v1/names?name=${name}`, {
      method: 'GET',
    }).then(response => {
      return response.json()
    }).then(json => {
      console.log(json)
    }).catch(error => console.log(error))
  } else if (year && !name) {
    fetch(`/api/v1/names?year=${year}`, {
      method: 'GET',
    }).then(response => {
      return response.json()
    }).then(json => {
      console.log(json)
    }).catch(error => console.log(error))
  } else {
    console.log('no data')
  }
}
