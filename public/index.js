const $error = $('#error-msg')

$('#submit-button').on('click', event => {
  const name = $('#name-search').val()
  const year = $('#year-search').val()
  const gender = $('#gender').val()

  if (year) {
    if (year <= 2016 && year >= 1880) {
      submitData(name, year, gender)
    } else {
      $error.text('Error: Enter a year between 1880-2016')
    }
  } else if (!year) {
    submitData(name, year, gender)
  }
})

const fetchAllParams = (name, year, gender) => {
  fetch(`/api/v1/names?name=${name}&year=${year}&gender=${gender}`, {
    method: 'GET',
  }).then(response => {
    return response.json()
  }).then(json => {
    if (!json.length) {
      $error.text('Error: No Matches')
    }
    console.log(json)
  }).catch(error => $error.text(error))
}

const fetchName = (name) => {
  fetch(`/api/v1/names?name=${name}`, {
    method: 'GET',
  }).then(response => {
    return response.json()
  }).then(json => {
    if (!json.length) {
      $error.text('Error: Invalid Name')
    }
    console.log(json)
  }).catch(error => {
    $error.text('Error: No Matching Name')
    console.error(error)
  })
}

const fetchYear = (year) => {
  fetch(`/api/v1/names?year=${year}`, {
    method: 'GET',
  }).then(response => {
    return response.json()
  }).then(json => {
    console.log(json)
  }).catch(error => $error.text(error))
}

const fetchGender = (gender) => {
  fetch(`/api/v1/names?gender=${gender}`, {
    method: 'GET',
  }).then(response => {
    return response.json()
  }).then(json => {
    console.log(json)
  }).catch(error => $error.text(error))
}

const fetchYearName = (year, name) => {
  fetch(`/api/v1/names?name=${name}&year=${year}`, {
    method: 'GET',
  }).then(response => {
    return response.json()
  }).then(json => {
    if (!json.length) {
      $error.text('Error: Invalid Name')
    }
    console.log(json)
  }).catch(error => $error.text(error))
}

const fetchNameGender = (name, gender) => {
  fetch(`/api/v1/names?name=${name}&gender=${gender}`, {
    method: 'GET',
  }).then(response => {
    return response.json()
  }).then(json => {
    console.log(json)
  }).catch(error => $error.text(error))
}

const fetchYearGender = (year, gender) => {
  fetch(`/api/v1/names?gender=${gender}&year=${year}`, {
    method: 'GET',
  }).then(response => {
    return response.json()
  }).then(json => {
    if (!json.length) {
      $error.text('Error: No Matches')
    }
    console.log(json)
  }).catch(error => $error.text(error))
}

const submitData = (name, year, gender) => {
  // IF ALL GENDERS
  if (gender === 'All' || gender === 'hide') {
    if (name && !year) {
      $error.empty()
      fetchName(name)
    } else if (year && !name) {
      $error.empty()
      fetchYear(year)
    } else if (name && year) {
      $error.empty()
      fetchYearName(year, name)
    } else if (!name && !year && gender === 'All') {
      $error.text('Error: Please Enter a Name or Year')
    } else {
      $error.text('Error: Please Enter A Name, Year, or Gender')
    }
    // IF EITHER MALE OR FEMALE
  } else if (gender === 'M' || gender === 'F') {
    if (name && year && gender) {
      $error.empty()
      fetchAllParams(name, year, gender)
    } else if (name && !year && gender) {
      $error.empty()
      fetchNameGender(name, gender)
    } else if (!name && year && gender) {
      $error.empty()
      fetchYearGender(year, gender)
    } else if (!name && !year && gender) {
      $error.empty()
      fetchGender(gender)
    } else {
      $error.text('Error: Please Enter A Name, Year, or Gender')
    }
  }
}
