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
