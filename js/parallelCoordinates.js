
const PARALLEL_ATTRIBUTES = ['1stFlrSF', 'TotalBsmtSF', 'SalePrice', 'OverallQual', 'GrLivArea', 'GarageArea', 'YearBuilt', 'MasVnrArea', 'LotFrontage', 'LotArea'];

function parallelCoordinates() {
  var w = document.documentElement.clientWidth;
  var margin = {top:50, right: 50, bottom: 50, left: 50};
  if (w < 600) {
    margin = {top: 50, right: 75, bottom: 50, left: 75};
  }
  var width = w - margin.left - margin.right;
  var height = 600 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#parallelCoordinates")
              .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform",
                      "translate(" + margin.left + "," + margin.top + ")");
  d3.csv("data/parallelData.csv", function(data) {
    // For each dimension, I build a linear scale. I store all in a y object
    var y = {};
    for (i in PARALLEL_ATTRIBUTES) {
      name = PARALLEL_ATTRIBUTES[i]
      y[name] = d3.scaleLinear()
                  .domain( d3.extent(data, function(d) { return +d[name]; }) )
                  .range([height, 0])
    }

    // Build the X scale -> it find the best position for each Y axis
    x = d3.scalePoint()
            .range([0, width])
            .padding(1)
            .domain(PARALLEL_ATTRIBUTES);

    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    function path(d) {
        return d3.line()(PARALLEL_ATTRIBUTES.map(function(p) { return [x(p), y[p](d[p])]; }));
    }

    // Draw the lines
    svg.selectAll("myPath")
        .data(data)
        .enter().append("path")
        .attr("d",  path)
        .style("fill", "none")
        .style("stroke", "#69b3a2")
        .style("opacity", 0.5)

    // Draw the axis:
    svg.selectAll("myAxis")
        // For each dimension of the dataset I add a 'g' element:
        .data(PARALLEL_ATTRIBUTES).enter()
        .append("g")
        // I translate this element to its right position on the x axis
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        // And I build the axis with the call function
        .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
        // Add axis title
        .append("text")
          .style("text-anchor", "middle")
          .attr("y", -9)
          .text(function(d) { return d; })
          .style("fill", "#f2f4f5")

  })
}
