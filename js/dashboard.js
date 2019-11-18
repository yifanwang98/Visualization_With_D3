function db_barchart(width, height, margin, id, filename, xLabel, yLabel, xAttr, yAttr) {
  // append the svg object to the body of the page
  d3.select(id).selectAll("*").remove();
  var svg = d3.select(id)
              .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("font-family", "Avenir")
      .attr("font-size", "14px")
      .attr("y", 6)
      .attr("dy", "-1em")
      .attr("dx", "1.2em")
      .text(yLabel);

  d3.csv(filename, function(data) {
    // X axis: scale and draw:
    var x = d3.scaleBand()
              .domain(data.map(function(d) { return d[xAttr]; }))
              .range([1, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Y axis: initialization
    var y = d3.scaleLinear()
              .domain([0, d3.max(data, function(d) {return +d[yAttr];})])
              .range([height, 0]).nice();
    var yAxis = svg.append("g");

    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("font-family", "Avenir")
        .attr("font-size", "14px")
        .attr("x", 6)
        .attr("dy", "" + (height + 30) + "px")
        .attr("dx", "" + (width - 5) + "px")
        .text(xLabel);

    // A function that builds the graph for a specific value of bin
    function update() {
      // set the parameters for the histogram
      var histogram = d3.histogram()
          .value(function(d) { return d[xAttr]; })   // I need to give the vector of value
          .domain(x.domain());  // then the domain of the graphic
      // Y axis: update now that we know the domain
      yAxis.transition().duration(1000).call(d3.axisLeft(y));

      // Join the rect with the bins data
      var u = svg.selectAll(null)
                  .data(data)
                  .attr("class", "barchart-bar");
      // Manage the existing bars and eventually the new ones:
      u.enter()
        .append("rect") // Add a new rect for each new elements
        .on('mouseover', function(d) {
              d3.select(this).style("fill", HOVERED_BAR_COLOR);
          })
        .on('mouseout', function(d) {
            d3.select(this).style("fill", DEFAULT_BAR_COLOR);
        })
        .merge(u) // get the already existing elements as well
        .transition() // and apply changes to all of them
        .duration(1000)
          .attr("x", function(d) { return x(d[xAttr]); })
          .attr("width", function(d) {
            var w = x.bandwidth() - 1;
            if (w < 0) { return 0;}
            return w;
          })
          .attr("y", function(d) { return y(d[yAttr]);})
          .attr("height", function(d) { return height - y(d[yAttr]);})
          .call(d3.axisBottom(x))
          .style("fill", "#69b3a2");
      // If less bar in the new histogram, I delete the ones not in use anymore
      u.exit().remove()
    }

    // Initialize with 20 bins
    update()
  });

}



function db_scatter(width, height, margin, id, filename, xLabel, yLabel, attribute1, attribute2) {
  // append the svg object to the body of the page
  d3.select(id).selectAll("*").remove();
  var svg = d3.select(id)
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
      .attr("font-size", "14px")
      .attr("y", 6)
      .attr("dy", "-1em")
      .attr("dx", "1.2em")
      .text(yLabel);
  svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("font-family", "Avenir")
      .attr("font-size", "14px")
      .attr("x", 6)
      .attr("dy", "" + (height + 30) + "px")
      .attr("dx", "" + (width - 5) + "px")
      .text(xLabel);

  //Read the data
  d3.csv(filename, function(data) {
    // Add X axis
    var x_domainMax = d3.max(data, function(d) { return +d[attribute1] });
    var x_domainMin = d3.min(data, function(d) { return +d[attribute1] });
    var x = d3.scaleLinear()
              .domain([x_domainMin, x_domainMax])
              .range([0, width])
              .nice();
    svg.append("g")
      .attr("transform", "translate(0," + (height - 0) + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
        .style("text-anchor", "end");
        // .attr("dx", "-.8em")
        // .attr("dy", ".15em");
        // .attr("transform", "rotate(-45)");;

    // Add Y axis
    var y_domainMax = d3.max(data, function(d) { return +d[attribute2] });
    var y_domainMin = d3.min(data, function(d) { return +d[attribute2] });
    var y = d3.scaleLinear()
              .domain([y_domainMin, y_domainMax])
              .range([height - 0, 0])
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
          .style("fill", SCATTER_DOT_COLOUR);

  })
}


function db_barchart1() {
  // set the dimensions and margins of the graph
  var w = document.documentElement.clientWidth;
  console.log("document.documentElement.clientWidth: " + w);
  var margin = {top: 20, right: 100, bottom: 50, left: 100};
  if (w < 600) {
    margin = {top: 20, right: 40, bottom: 50, left: 40};
  }
  var width = w - margin.left - margin.right;
  var h = document.documentElement.clientHeight * 0.35;
  var height = h - margin.top - margin.bottom;

  var filename = 'data/DB_Neighborhood.csv';

  db_barchart(width, height, margin, '#barchart', filename, 'Neighborhood', 'SalePrice', 'key', 'price');
}

function db_barchart2() {
  // set the dimensions and margins of the graph
  var w = document.documentElement.clientWidth;
  var margin = {top:20, right: 10, bottom: 50, left: 100};
  if (w < 600) {
    margin = {top: 20, right: 10, bottom: 50, left: 40};
  }
  var width = w / 3;
  var height = w / 3 - 50;
  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;

  var filename = 'data/DB_OverallQual.csv';
  db_barchart(width, height, margin, '#barchart2', filename, 'OverallQual', 'SalePrice', 'key', 'price');
}

function db_scatter1() {
  var attribute1 = 'GrLivArea';
  var attribute2 = 'SalePrice';
  console.log(attribute1, attribute2);

  // set the dimensions and margins of the graph
  var w = document.documentElement.clientWidth;
  var margin = {top:20, right: 10, bottom: 50, left: 100};
  if (w < 600) {
    margin = {top: 20, right: 10, bottom: 50, left: 40};
  }
  var width = w / 3;
  var height = w / 3 - 50;
  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;


  var filename = 'data/processedData.csv';
  db_scatter(width, height, margin, '#scatterPlot', filename, attribute1, attribute2, attribute1, attribute2);
}

function db_scatter2() {
  var attribute1 = 'PC1';
  var attribute2 = 'PC2';
  console.log(attribute1, attribute2);

  // set the dimensions and margins of the graph
  var w = document.documentElement.clientWidth;
  var margin = {top:20, right: 10, bottom: 50, left: 100};
  if (w < 600) {
    margin = {top: 20, right: 10, bottom: 50, left: 40};
  }
  var width = w / 3;
  var height = w / 3 - 50;
  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;


  var filename = 'data/processedData.csv';
  db_scatter(width, height, margin, '#pcaPlot', filename, attribute1, attribute2, attribute1, attribute2);
}
