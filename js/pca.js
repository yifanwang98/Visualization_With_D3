
function pcaPlot() {
  var attribute1 = "Component 1";
  var attribute2 = "Component 2";
  console.log(attribute1, attribute2);

  // set the dimensions and margins of the graph
  var w = document.documentElement.clientWidth;
  var margin = {top:50, right: 100, bottom: 50, left: 100};
  if (w < 600) {
    margin = {top: 30, right: 60, bottom: 50, left: 60};
  }
  var width = Math.min(650, w);
  var height = Math.min(500, w);
  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;

  // append the svg object to the body of the page
  d3.select("#pcaPlot").selectAll("*").remove();
  var svg = d3.select("#pcaPlot")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("font-family", "Avenir")
      .attr("y", 6)
      .attr("dy", "-1em")
      .attr("dx", "5em")
      .text(attribute2);
  svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("font-family", "Avenir")
      .attr("x", 6)
      .attr("dy", "" + (height + 35) + "px")
      .attr("dx", "" + (width) + "px")
      .text(attribute1);

  //Read the data
  d3.csv("data/PCA/pca_data.csv", function(data) {
    // Add X axis
    var x_domainMax = d3.max(data, function(d) { return +d[attribute1] });
    var x_domainMin = d3.min(data, function(d) { return +d[attribute1] });
    var x = d3.scaleLinear()
              .domain([x_domainMin, x_domainMax])
              .range([0, width])
              .nice();
    svg.append("g")
      .attr("transform", "translate(0," + (height) + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y_domainMax = d3.max(data, function(d) { return +d[attribute2] });
    var y_domainMin = d3.min(data, function(d) { return +d[attribute2] });
    var y = d3.scaleLinear()
              .domain([y_domainMin, y_domainMax])
              .range([height, 0])
              .nice();
    svg.append("g")
      .call(d3.axisLeft(y));

    // Add dots
    svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
          .attr("cx", function (d) { return x(d[attribute1]); } )
          .attr("cy", function (d) { return y(d[attribute2]); } )
          .attr("r", 1.75)
          .style("fill", "#113863");

  })
}
