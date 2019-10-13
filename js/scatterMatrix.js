
const SCATTER_MATRIX_ATTRIBUTES = ['GrLivArea', 'OverallQual', 'TotalBsmtSF', '1stFlrSF', 'SalePrice'];
const SCATTER_MATRIX_AGG_CORR = [5.047, 5.302, 5.321, 5.341, 5.959];

function setUpScatterMatrixHTML() {
  for (var i = 0; i < SCATTER_MATRIX_ATTRIBUTES.length; i++) {
    var div = document.getElementById('scatterPlotMatrix' + i);
    div.innerHTML = "<span class=\"scatterMatrixYAxis\">" + SCATTER_MATRIX_ATTRIBUTES[i] + "</span>";
    for (var j = 0; j < SCATTER_MATRIX_ATTRIBUTES.length; j++) {
      div.innerHTML += "<span id=\"scatterMatrixRow" + i + "" + j + "\" class=\"chart\"></span>";
    }
  }
  scatterMatrix();
}

function scatterMatrix() {
  // set the dimensions and margins of the graph
  var w = document.documentElement.clientWidth / 6;
  var margin = {top: 5, right: 5, bottom: 5, left: 5};
  var width = Math.min(120, w);
  var height = Math.min(120, w);
  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;

  var scatterPlotMatrixX = document.getElementById('scatterPlotMatrixX');
  var scatterPlotMatrixAggCorr = document.getElementById('scatterPlotMatrixAggCorr');
  scatterPlotMatrixX.innerHTML = "";
  scatterPlotMatrixAggCorr.innerHTML = "";
  for (var i = 0; i < SCATTER_MATRIX_ATTRIBUTES.length; i++) {
    for (var j = 0; j < SCATTER_MATRIX_ATTRIBUTES.length; j++) {
      scatterMatrixRow(i, j, SCATTER_MATRIX_ATTRIBUTES[i], width, height, margin);
    }
    scatterPlotMatrixX.innerHTML += "<span class=\"scatterMatrixXAxis\" style=\"width: " + Math.min(120, w) + "px;\">" + SCATTER_MATRIX_ATTRIBUTES[i] + "</span>";
    scatterPlotMatrixAggCorr.innerHTML += "<span class=\"scatterMatrixXAxis\" style=\"width: " + Math.min(120, w) + "px;\">" + SCATTER_MATRIX_AGG_CORR[i] + "</span>"
  }
}

function scatterMatrixRow(row, col, attribute, width, height, margin) {
  var attribute1 = SCATTER_MATRIX_ATTRIBUTES[col];
  d3.select("#scatterMatrixRow" + row + "" + col).selectAll("*").remove();
  var svg = d3.select("#scatterMatrixRow" + row + "" + col)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  if (col > row) {
    return
  }
  //Read the data
  d3.csv("data/train.csv", function(data) {
    // Add X axis
    var x_domainMax = d3.max(data, function(d) { return +d[attribute1] });
    var x_domainMin = d3.min(data, function(d) { return +d[attribute1] });
    var x = d3.scaleLinear()
              .domain([x_domainMin, x_domainMax])
              .range([0, width])
              .nice();
    svg.append("g")
      .attr("transform", "translate(0," + (height) + ")")
      .call(d3.axisBottom(x))
      .selectAll("text").remove();

    // Add Y axis
    var y_domainMax = d3.max(data, function(d) { return +d[attribute] });
    var y_domainMin = d3.min(data, function(d) { return +d[attribute] });
    var y = d3.scaleLinear()
              .domain([y_domainMin, y_domainMax])
              .range([height, 0])
              .nice();
    svg.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text").remove();

    // Add dots
    svg.append('g').selectAll("dot")
        .data(data).enter()
        .append("circle")
          .attr("cx", function (d) { return x(d[attribute1]); } )
          .attr("cy", function (d) { return y(d[attribute]); } )
          .attr("r", 1)
          .style("fill", SCATTER_DOT_COLOUR);

  })

}
