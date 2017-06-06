const $error = $('#error-msg')

$(document).ready(() => {
  bubbles()
})

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
  }).catch(error => {
    $error.text('Error: No Matches')
    console.error(error)
  })
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
    $('#chart2').empty()
    console.log(json)
    queryBubble(json)
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
  }).catch(error => {
    $error.text('Error: No Matches')
    console.error(error)
  })
}

const fetchNameGender = (name, gender) => {
  fetch(`/api/v1/names?name=${name}&gender=${gender}`, {
    method: 'GET',
  }).then(response => {
    return response.json()
  }).then(json => {
    console.log(json)
  }).catch(error => {
    $error.text('Error: No Matches')
    console.error(error)
  })
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
  }).catch(error => {
    $error.text('Error: No Matches')
    console.error(error)
  })
}

const submitData = (name, year, gender) => {
  // IF ALL GENDERS
  if (gender === 'All' || gender === 'hide') {
    if (name && !year) {
      $error.empty()
      fetchName(name)
    } else if (year && !name) {
      $error.empty()
      $('#chart').hide()
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

const bubbles = () => {
  console.log('in bubbles')
  let width = 1000
  let height = 1000

  let margin = { top: 20 }

  let svg = d3.select('#chart')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
    .append('g')
    .attr('transform', 'translate(0,0)')

  let toolTip = d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0)

  const ready = (error, datapoints) => {
    datapoints = datapoints.filter(entry => {
      return entry.count > 1000
    })

    let countRange = d3.extent(datapoints, d => d.count)

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.top)
      .attr('text-anchor', 'middle')
      .attr('class', 'title')
      .text(datapoints.year)
      .style('fill', 'white')

    let radiusScale = d3.scaleSqrt().domain(countRange).range([5, 30])

    let simulation = d3.forceSimulation()
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05))
      .force('collide', d3.forceCollide(function (d) {
        return radiusScale(d.count) + 2
      }))

    let circles = svg.selectAll('.people')
        .data(datapoints)
        .enter()
        .append('circle')
        .attr('class', 'people')
        .attr('r', function (d) {
          return radiusScale(d.count)
        })
        .each(function (d) {
          let circle = d3.select(this)
          if (d.gender === 'M') {
            circle.attr('fill', '#91bdcf')
          } else if (d.gender === 'F') {
            circle.attr('fill', '#f79f9d')
          }
        })
        .on('mouseover', d => {
          toolTip.transition()
          .duration(200)
          .style('opacity', 0.9)
          toolTip.html(`${d.name}, ${d.gender} <br/>count: ${d.count}`)
          .style('left', (d3.event.pageX) + 'px')
          .style('top', (d3.event.pageY) + 'px')
        })
        .on('mouseout', d => {
          toolTip.transition()
            .duration(500)
            .style('opacity', 0)
        })

    const ticked = () => {
      circles
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
    }

    simulation.nodes(datapoints)
      .on('tick', ticked)
  }
  d3.queue()
  .defer(d3.csv, 'people.csv')
  .await(ready)
}

const queryBubble = (datapoints) => {
  console.log(datapoints)
  console.log('in bubbles2')
  let width = 1000
  let height = 1000

  let margin = { top: 20 }

  let svg = d3.select('#chart2')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
    .append('g')
    .attr('transform', 'translate(0,0)')

  let toolTip = d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0)

  let min = 1000
  if (datapoints[0].year < 1980) {
    min = 30
  }

  datapoints = datapoints.filter(entry => {
    return entry.count > min
  })

  let countRange = d3.extent(datapoints, d => d.count)

  svg.append('text')
    .attr('x', width / 2)
    .attr('y', margin.top)
    .attr('text-anchor', 'middle')
    .attr('class', 'title')
    .text(datapoints.year)
    .style('fill', 'white')

  let radiusScale = d3.scaleSqrt().domain(countRange).range([5, 40])

  let simulation = d3.forceSimulation()
    .force('x', d3.forceX(width / 2).strength(0.05))
    .force('y', d3.forceY(height / 2).strength(0.05))
    .force('collide', d3.forceCollide(function (d) {
      return radiusScale(d.count) + 2
    }))

  let circles = svg.selectAll('.people')
      .data(datapoints)
      .enter()
      .append('circle')
      .attr('class', 'people')
      .attr('r', function (d) {
        return radiusScale(d.count)
      })
      .each(function (d) {
        let circle = d3.select(this)
        if (d.gender === 'M') {
          circle.attr('fill', '#91bdcf')
        } else if (d.gender === 'F') {
          circle.attr('fill', '#f79f9d')
        }
      })
      .on('mouseover', d => {
        toolTip.transition()
        .duration(200)
        .style('opacity', 0.9)
        toolTip.html(`${d.name}, ${d.gender} <br/>count: ${d.count}`)
        .style('left', (d3.event.pageX) + 'px')
        .style('top', (d3.event.pageY) + 'px')
      })
      .on('mouseout', d => {
        toolTip.transition()
          .duration(500)
          .style('opacity', 0)
      })

  const ticked = () => {
    circles
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
  }

  simulation.nodes(datapoints)
    .on('tick', ticked)
}
