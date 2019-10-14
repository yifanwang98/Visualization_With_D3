
const DEFAULT_SCREE_BAR_COLOR = "#44c0db";
const HOVERED_SCREE_BAR_COLOR = "#3b9eb4";

function pcaPlot() {
  var attribute1 = "Component 1";
  var attribute2 = "Component 2";
  console.log(attribute1, attribute2);

  // set the dimensions and margins of the graph
  var w = document.documentElement.clientWidth;
  var margin = {top:50, right: 100, bottom: 75, left: 100};
  if (w < 600) {
    margin = {top: 30, right: 60, bottom: 50, left: 60};
  }
  var width = Math.min(650, w);
  var height = 550;
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


function screePlot() {
  // set the dimensions and margins of the graph
  var w = document.documentElement.clientWidth;
  console.log("document.documentElement.clientWidth: " + w);
  var margin = {top: 30, right: 100, bottom: 50, left: 100};
  if (w < 600) {
    margin = {top: 30, right: 40, bottom: 50, left: 40};
  }
  var width = Math.min(850, w) - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  d3.select("#screePlot").selectAll("*").remove();
  var svg = d3.select("#screePlot")
              .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("font-family", "Avenir")
      .attr("y", 6)
      .attr("dy", "-1em")
      .attr("dx", "10em")
      .text("Explained Variance Ratio")
      .style("fill", "#eaeaea");

  svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("font-family", "Avenir")
      .attr("x", 6)
      .attr("dy", "" + (height + 35) + "px")
      .attr("dx", "" + (width) + "px")
      .text("# of Attributes")
      .style("fill", "#eaeaea");;

  // get the data
  var filename = "data/PCA/scree_data.csv"
  d3.csv(filename, function(data) {
    // X axis: scale and draw:
    var x = d3.scaleBand()
        .domain(data.map(function(d) {
          return d["# of Features"];
        }))
        .range([1, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "heatmapXAxis")
        .call(d3.axisBottom(x));

    // Y axis: initialization
    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) {
          return +d["Explained Variance Ratio"];
        })])
        .range([height, 0]).nice();
    var yAxis = svg.append("g");

    // A function that builds the graph for a specific value of bin
    function update() {
      // set the parameters for the histogram
      var histogram = d3.histogram()
          .value(function(d) { return d["# of Features"]; })   // I need to give the vector of value
          .domain(x.domain())  // then the domain of the graphic
          ; // then the numbers of bins

      // Y axis: update now that we know the domain
      yAxis.transition().duration(1000)
            .call(d3.axisLeft(y))
            .attr("class", "heatmapYAxis");

      // Join the rect with the bins data
      var u = svg.selectAll(null)
                  .data(data)
                  .attr("class", "barchart-bar");
      // Manage the existing bars and eventually the new ones:
      u.enter()
        .append("rect") // Add a new rect for each new elements
        .on('mouseover', function(d) {
              d3.select(this).style("fill", HOVERED_SCREE_BAR_COLOR);
          })
        .on('mouseout', function(d) {
            d3.select(this).style("fill", DEFAULT_SCREE_BAR_COLOR);
        })
        .merge(u) // get the already existing elements as well
        .transition() // and apply changes to all of them
        .duration(1000)
          .attr("x", function(d) { return x(d["# of Features"]); })
          .attr("width", function(d) {
            var w = x.bandwidth() - 1;
            if (w < 0) { return 0;}
            return w;
          })
          .attr("y", function(d) { return y(d["Explained Variance Ratio"]);})
          .attr("height", function(d) { return height - y(d["Explained Variance Ratio"]);})
          .call(d3.axisBottom(x))
          .style("fill", DEFAULT_SCREE_BAR_COLOR);
      // If less bar in the new histogram, I delete the ones not in use anymore
      u.exit().remove()
    }

    // Initialize with 20 bins
    update()

  });
}

function pcaBiplot() {
  var attribute1 = "Component 1";
  var attribute2 = "Component 2";
  console.log(attribute1, attribute2);

  // set the dimensions and margins of the graph
  var w = document.documentElement.clientWidth;
  var margin = {top:50, right: 100, bottom: 75, left: 100};
  if (w < 600) {
    margin = {top: 30, right: 60, bottom: 50, left: 60};
  }
  var width = Math.min(650, w);
  var height = 550;
  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;

  // append the svg object to the body of the page
  d3.select("#pcaBiplot").selectAll("*").remove();
  var svg = d3.select("#pcaBiplot")
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
      .attr("dy", "-2em")
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
    svg.append("g").call(d3.axisLeft(y));

    // Add dots
    svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
          .attr("cx", function (d) { return x(d[attribute1]); } )
          .attr("cy", function (d) { return y(d[attribute2]); } )
          .attr("r", 1.75)
          .style("fill", "#3e3e3e");

    // Biplot
    d3.csv("data/PCA/pca_components.csv", function(data) {
      var xx = d3.scaleLinear()
                .domain([x.domain()[0] / 10, x.domain()[1] / 10])
                .range([0, width])
                .nice();
      svg.append("g")
          .call(d3.axisTop(xx))
          .attr("class", "pcaBiplotYAxis");

      var y_ratio = 8;
      var yy = d3.scaleLinear()
                .domain([y.domain()[0] / y_ratio, y.domain()[1] / y_ratio])
                .range([height, 0]);
      svg.append("g")
          .attr("transform", "translate(" + (width) + ", 0)")
          .call(d3.axisRight(yy))
          .attr("class", "pcaBiplotYAxis");
      svg.append("g")
          .selectAll("stroke")
          .data(data)
          .enter()
            .append("line")
            .attr("x1", x(0))
            .attr("y1", y(0))
            .attr("x2", function (d) { return xx(d[attribute1]); })
            .attr("y2", function (d) { return yy(d[attribute2]); })
            .attr("stroke-width", 1.5)
            .attr("stroke", "#f20000");

    });
  });

}
