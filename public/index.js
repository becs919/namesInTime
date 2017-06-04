const $error = $('#error-msg')

$('#submit-button').on('click', event => {
  const name = $('#name-search').val()
  const year = $('#year-search').val()
  const gender = $('#gender').val()

  getNames(name, year, gender)
})

const getNames = (name, year, gender) => {
  // IF ALL GENDERS
  if (gender === 'All' || gender === 'hide') {
    if (name && !year) {
      $error.empty()
      fetch(`/api/v1/names?name=${name}`, {
        method: 'GET',
      }).then(response => {
        return response.json()
      }).then(json => {
        console.log(json)
      }).catch(error => {
        $error.text('Error: No Matching Name')
        console.error(error)
      })
    } else if (year && !name) {
      $error.empty()
      fetch(`/api/v1/names?year=${year}`, {
        method: 'GET',
      }).then(response => {
        return response.json()
      }).then(json => {
        console.log(json)
      }).catch(error => $error.text(error))
    } else if (name && year) {
      $error.empty()
      fetch(`/api/v1/names?name=${name}&year=${year}`, {
        method: 'GET',
      }).then(response => {
        return response.json()
      }).then(json => {
        console.log(json)
      }).catch(error => $error.text(error))
    } else if (!name && !year && gender === 'All') {
      $error.text('Error: Please Enter a Name or Year')
    } else if (!name && !year && gender === 'hide') {
      $error.text('Error: Please Enter A Name, Year, or Gender')
    } else {
      $error.text('Error: Please Enter A Name, Year, or Gender')
    }
    // IF EITHER M OR F
  } else if (gender === 'M' || gender === 'F') {
    if (name && year && gender) {
      $error.empty()
      fetch(`/api/v1/names?name=${name}&year=${year}&gender=${gender}`, {
        method: 'GET',
      }).then(response => {
        return response.json()
      }).then(json => {
        console.log(json)
      }).catch(error => $error.text(error))
    } else if (name && !year && gender) {
      $error.empty()
      fetch(`/api/v1/names?name=${name}&gender=${gender}`, {
        method: 'GET',
      }).then(response => {
        return response.json()
      }).then(json => {
        console.log(json)
      }).catch(error => $error.text(error))
    } else if (!name && year && gender) {
      $error.empty()
      fetch(`/api/v1/names?gender=${gender}&year=${year}`, {
        method: 'GET',
      }).then(response => {
        if (response.okay) {
          return response.json()
        } else {
          $error.text('Error: No Matches')
        }
      }).then(json => {
        console.log(json)
      }).catch(error => $error.text(error))
    } else if (!name && !year && gender) {
      $error.empty()
      fetch(`/api/v1/names?gender=${gender}`, {
        method: 'GET',
      }).then(response => {
        return response.json()
      }).then(json => {
        console.log(json)
      }).catch(error => $error.text(error))
    } else {
      $error.text('Error: Please Enter A Name, Year, or Gender')
    }
  }
}
