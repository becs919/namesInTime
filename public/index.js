const $error = $('#error-msg')

let chartExists = false

$(document).ready(() => {
  bubbles()
})

$('#submit-button').on('click', event => {
  const name = $('#name-search').val()
  const year = $('#year-search').val()
  const gender = $('#gender').val()

  $('#name-data').css('display', 'none')
  $('#chart').hide()

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

const displayNameData = (data) => {
  $('#name-data').css('display', 'flex')
  $('#chart2').hide()
  $('#chart3').hide()

  let gender = 'Female'
  let gender2 = 'Female'

  if (data[0][0].gender === 'M') {
    gender = 'Male'
  }

  if (!data[1]) {
    $('.second-count').hide()
  }

  if (data[1]) {
    $('.second-count').show()
    if (data[1][0].gender === 'M') {
      gender2 = 'Male'
    }
    $('.second-count').html(gender2 + ' ' + data[1][0].count)
  }

  $('.single-name').html(data[0][0].name)
  $('.single-year').html(data[0][0].year)
  $('.single-count').html(gender + ': ' + data[0][0].count)
}

const timeOut = () => {
  $('.spinner').show()
}

const hideAnimation = () => {
  $('.spinner').hide()
}

const fetchAllParams = (name, year, gender) => {
  fetch(`/api/v1/names?name=${name}&year=${year}&gender=${gender}`, {
    method: 'GET',
  }).then(response => {
    return response.json()
  }).then(json => {
    if (!json.length) {
      $error.text('Error: No Matches')
    }
    displayNameData(json)
  }).catch(error => {
    $error.text('Error: No Matches')
    console.error(error)
  })
}

const fetchName = (name) => {
  $('#chart3').empty()
  $('#chart2').hide()
  fetch(`/api/v1/names?name=${name}`, {
    method: 'GET',
  }).then(response => {
    return response.json()
  }).then(json => {
    if (!json.length) {
      $error.text('Error: Invalid Name')
    }
    // WAITING TO USE CHART HERE FROM ERIC
    let cleanData = json.reduce((a, b) => {
      return a.concat(b)
    }, [])
    queryBubbleAllYears(cleanData)
  }).catch(error => {
    $error.text('Error: No Matching Name')
    console.error(error)
  })
}

const fetchYear = (year) => {
  $('#chart2').empty()
  fetch(`/api/v1/names?year=${year}`, {
    method: 'GET',
  }).then(response => {
    return response.json()
  }).then(json => {
    queryBubble(json)
  }).catch(error => $error.text(error))
}

const fetchYearName = (year, name) => {
  $('#chart2').hide()
  $('#chart3').hide()
  fetch(`/api/v1/names?name=${name}&year=${year}`, {
    method: 'GET',
  }).then(response => {
    return response.json()
  }).then(json => {
    if (!json.length) {
      $error.text('Error: Invalid Name')
    }
    displayNameData(json)
  }).catch(error => {
    $error.text('Error: No Matches')
    console.error(error)
  })
}

const fetchNameGender = (name, gender) => {
  $('#chart3').empty()
  $('#chart2').hide()
  fetch(`/api/v1/names?name=${name}&gender=${gender}`, {
    method: 'GET',
  }).then(response => {
    return response.json()
  }).then(json => {
    let cleanData = json.reduce((a, b) => {
      return a.concat(b)
    }, [])
    chartExists = chartExists ? updateLineChart(cleanData) : makeLineChart(cleanData)
  }).catch(error => {
    $error.text('Error: No Matches')
    console.error(error)
  })
}

const fetchYearGender = (year, gender) => {
  $('#chart2').empty()
  fetch(`/api/v1/names?gender=${gender}&year=${year}`, {
    method: 'GET',
  }).then(response => {
    return response.json()
  }).then(json => {
    if (!json.length) {
      $error.text('Error: No Matches')
    }
    let cleanData = json.reduce((a, b) => {
      return a.concat(b)
    }, [])
    queryBubble(cleanData)
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
      timeOut()
      fetchYearGender(year, gender)
    } else if (!name && !year && gender) {
      $error.text('Error: Please Enter A Name or Year')
    } else {
      $error.text('Error: Please Enter A Name, Year, or Gender')
    }
  }
}

const bubbles = () => {
  let width = 1024
  let height = 1024

  let margin = { top: 30 }

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
      .text('Top Names of 2016')
      .style('fill', 'white')
      .style('font-size', '20px')

    let radiusScale = d3.scaleSqrt().domain(countRange).range([5, 30])

    let simulation = d3.forceSimulation()
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.06))
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
            circle.attr('fill', '#d3e3ef')
          } else if (d.gender === 'F') {
            circle.attr('fill', '#eb96c1')
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
  $('#chart2').show()
  hideAnimation()

  let width = 1024
  let height = 1024

  let margin = { top: 30 }

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
    .attr('class', 'title-2')
    .text(`Top Names of ${datapoints[0].year}`)
    .style('fill', 'white')
    .style('font-size', '20px')

  let radiusScale = d3.scaleSqrt().domain(countRange).range([5, 40])

  let simulation = d3.forceSimulation()
    .force('x', d3.forceX(width / 2).strength(0.05))
    .force('y', d3.forceY(height / 2).strength(0.06))
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
          circle.attr('fill', '#d3e3ef')
        } else if (d.gender === 'F') {
          circle.attr('fill', '#eb96c1')
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
const queryBubbleAllYears = (datapoints) => {
  $('#chart3').show()
  $('#chart2').hide()
  hideAnimation()

  let width = 1024
  let height = 1024

  let margin = { top: 30 }

  let svg = d3.select('#chart3')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
    .append('g')
    .attr('transform', 'translate(0,0)')

  let toolTip = d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0)

  let countRange = d3.extent(datapoints, d => d.count)

  svg.append('text')
    .attr('x', width / 2)
    .attr('y', margin.top)
    .attr('text-anchor', 'middle')
    .attr('class', 'title-3')
    .text(`1880-2016 ${datapoints[0].name}`)
    .style('fill', 'white')
    .style('font-size', '20px')

  let radiusScale = d3.scaleSqrt().domain(countRange).range([5, 40])

  let simulation = d3.forceSimulation()
    .force('x', d3.forceX(width / 2).strength(0.05))
    .force('y', d3.forceY(height / 2).strength(0.06))
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
          circle.attr('fill', '#d3e3ef')
        } else if (d.gender === 'F') {
          circle.attr('fill', '#eb96c1')
        }
      })
      .on('mouseover', d => {
        toolTip.transition()
        .duration(200)
        .style('opacity', 0.9)
        toolTip.html(`year: ${d.year} <br/>count: ${d.count}`)
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

const makeLineChart = incomingData => {
  let data = incomingData

  let margin = { top: 30, right: 20, bottom: 30, left: 50 }
  let width = 960 - margin.left - margin.right
  let height = 500 - margin.top - margin.bottom

  let xScale = d3
    .scaleLinear()
    .domain(d3.extent(data, d => d.year))
    .range([0, width])

  let yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.count)])
    .range([height, 0])

  let line = d3.line().x(d => xScale(d.year)).y(d => yScale(d.count))

  var svg = d3
    .select('body')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .attr('class', 'svg-chart')
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  svg.append('path').data([data]).attr('class', 'line').attr('d', line)
  svg.append('text')
        .attr('x', (width / 2))
        .attr('y', 0 - (margin.top / 2))
        .attr('class', 'chart-title')
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('text-decoration', 'underline')
        .style('fill', 'black')
        .text(data[0].name + ',   ' + data[0].gender)

  svg
    .append('g')
    .attr('class', 'bottom-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(xScale).tickFormat(d3.format('d')))

  svg.append('g')
    .attr('class', 'left-axis')
    .call(d3.axisLeft(yScale))

  return true
}

const updateLineChart = (data) => {
  let margin = { top: 30, right: 20, bottom: 30, left: 50 }
  let width = 960 - margin.left - margin.right
  let height = 500 - margin.top - margin.bottom

  let xScale = d3
    .scaleLinear()
    .domain(d3.extent(data, d => d.year))
    .range([0, width])

  let yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.count)])
    .range([height, 0])

  let line = d3.line().x(d => xScale(d.year)).y(d => yScale(d.count))

  const svg = d3.select('.svg-chart')
    .transition()

  svg.select('.line')
    .duration(750)
    .attr('d', line(data))
  svg.select('.bottom-axis')
    .duration(750)
    .call(d3.axisBottom(xScale).tickFormat(d3.format('d')))
  svg.select('.left-axis')
    .duration(750)
    .call(d3.axisLeft(yScale))
  svg.select('.chart-title')
    .duration(750)
    .text(data[0].name + ',   ' + data[0].gender)

  return true
}
