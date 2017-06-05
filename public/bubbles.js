(function () {
  let width = 800,
    height = 800

  let svg = d3.select('#chart')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
    .append('g')
    .attr('transform', 'translate(0,0)')

  let radiusScale = d3.scaleSqrt().domain([78, 9532]).range([10, 80])

  let simulation = d3.forceSimulation()
    .force('x', d3.forceX(width / 2).strength(0.05))
    .force('y', d3.forceY(height / 2).strength(0.05))
    .force('collide', d3.forceCollide(function(d) {
      return radiusScale(d.count) + 1
    }))

  d3.queue()
    .defer(d3.csv, '../data/csv/yob1880.txt')
    .await(ready)

  function ready(error, datapoints) {

    let circles = svg.selectAll('.people')
        .data(datapoints)
        .enter().append('circle')
        .attr('class', 'people')
        .attr('r', function (d) {
          return radiusScale(d.count)
        })
        .attr('fill', 'lightblue')
        .on('click', function (d) {
          console.log(d);
        })

    simulation.nodes(datapoints)
      .on('tick', ticked)

    function ticked() {
      circles
        .attr('cx', function (d) {
          return d.x
        })
        .attr('cy', function (d) {
          return d.y
        })
    }
  }
})()
