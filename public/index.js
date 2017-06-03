$('#submit-button').on('click', event => {
  const name = $('#name-search').val()
  const year = $('#year-search').val()
  const gender = $('#gender').val()

  getNames(name, year, gender)
})

const getNames = (name, year, gender) => {
  if (gender === 'All' || gender === 'hide') {
    if (name && !year) {
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
    } else if (name && year) {
      fetch(`/api/v1/names?name=${name}&year=${year}`, {
        method: 'GET',
      }).then(response => {
        return response.json()
      }).then(json => {
        console.log(json)
      }).catch(error => console.log(error))
    } else {
      // FIX ADD ERROR HTML element somewhere. Need to enter at least one
      console.error('no data')
    }
  } else if (gender === 'M' || gender === 'F') {
    if (name && year && gender) {
      fetch(`/api/v1/names?name=${name}&year=${year}&gender=${gender}`, {
        method: 'GET',
      }).then(response => {
        return response.json()
      }).then(json => {
        console.log(json)
      }).catch(error => console.log(error))
    } else if (name && !year && gender) {
      fetch(`/api/v1/names?name=${name}&gender=${gender}`, {
        method: 'GET',
      }).then(response => {
        return response.json()
      }).then(json => {
        console.log(json)
      }).catch(error => console.log(error))
    } else if (!name && year && gender) {
      fetch(`/api/v1/names?gender=${gender}&year=${year}`, {
        method: 'GET',
      }).then(response => {
        return response.json()
      }).then(json => {
        console.log(json)
      }).catch(error => console.log(error))
    } else if (!name && !year && gender) {
      fetch(`/api/v1/names?year=${year}`, {
        method: 'GET',
      }).then(response => {
        return response.json()
      }).then(json => {
        console.log(json)
      }).catch(error => console.log(error))
    }
  }
}

// d3 but not our data - just example for future use?
let data = [4, 8, 15, 16, 23, 42]

let x = d3.scale.linear()
    .domain([0, d3.max(data)])
    .range([0, 420])

d3.select('.chart')
  .selectAll('div')
    .data(data)
  .enter().append('div')
    .style('width', function (d) { return x(d) + 'px' })
    .text(function (d) { return d })
