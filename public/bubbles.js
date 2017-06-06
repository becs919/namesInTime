(function () {
  let width = 1400,
    height = 1400

  let margin = { top: 20 }

  let svg = d3.select('#chart')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
    .append('g')
    .attr('transform', 'translate(0,0)')

  let toolTip = d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0)

  d3.queue()
    .defer(d3.csv, 'people.csv')
    .await(ready)

  function ready(error, datapoints) {

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
          var circle = d3.select(this)
          if (d.gender === 'M') {
            circle.attr('fill', '#91bdcf')
          } else if (d.gender === 'F') {
            circle.attr('fill', '#f79f9d')
          }
        })
        .on('mouseover', (d) => {
          toolTip.transition()
          .duration(200)
          .style('opacity', .9)
          toolTip.html(`${d.name}, ${d.gender} <br/>count: ${d.count}`)
          .style('left', (d3.event.pageX) + 'px')
          .style('top', (d3.event.pageY) + 'px')
        })
        .on('mouseout', d => {
          toolTip.transition()
            .duration(500)
            .style('opacity', 0)
        })

    simulation.nodes(datapoints)
      .on('tick', ticked)

    function ticked() {
      circles
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
    }
  }
})()
