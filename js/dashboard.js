const DB_COLOR = '#474f5c';
const DB_CLUSTER_COLORS = ['#bd24a0', '#ff9b00', '#ce0a0a', '#08c9c2'];
const DB_NEIGHBORHOOD_COLORS = ['#bbe7d2', '#83b0a6', '#374749', '#3d9674', '#182f2d',
                                '#3999a1', '#4fc5e7', '#aafff9', '#4f8fbf', '#073749',
                                '#fa7268', '#eb5757', '#e61e50', '#e01e5a', '#e53974',
                                '#f2ce76', '#ecbb45', '#bf9d34', '#a97524', '#a15421',
                                '#004c97', '#ff9e15', '#e61e50', '#4cb04f', '#00bcd4']
const DB_NEIGHBORHOOD_LIST = ['CollgCr', 'Veenker', 'NoRidge', 'Mitchel', 'Somerst', 'NWAmes',
                               'BrkSide', 'Sawyer', 'NAmes', 'SawyerW', 'IDOTRR', 'MeadowV',
                               'NridgHt', 'Timber', 'Gilbert', 'OldTown', 'ClearCr', 'Crawfor',
                               'Edwards', 'NPkVill', 'StoneBr', 'BrDale', 'Blmngtn', 'SWISU',
                               'Blueste']

var clusterFilter = 'Agglomerative';
var barchartSingleColor = true;

var allFilter = {};

function resetFilter() {
  clusterFilter = 'Agglomerative';
  barchartSingleColor = true;
  allFilter = {};

  db_clusterFilterChanges();
}

function applyFilter() {
  db_scatter1();
  db_scatter2();
  if (clusterFilter === 'Neighborhood') {
    db_barchartSingleColorChanges(false);
  } else {
    db_barchartSingleColorChanges(true);
  }
}

function db_clusterFilterChanges() {
  clusterFilter = 'None';
  for (var i = 1; i <= 5; i++) {
    var id = 'clusterFilter' + i;
    if (document.getElementById(id).checked) {
      clusterFilter = document.getElementById(id).value;
    }
  }
  applyFilter();
}

function db_barchartSingleColorChanges(value) {
  barchartSingleColor = value
  db_barchart1();
  db_barchart2();
}

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
              // .domain(data.map(function(d) { return d[xAttr]; }))
              .range([1, width]);
    if (xLabel === 'OverallQual') {
      x.domain(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
    } else {
      x.domain(['NoRidge', 'NridgHt', 'StoneBr', 'OldTown', 'Veenker', 'Crawfor', 'Timber',
                 'Gilbert', 'NAmes', 'Somerst', 'ClearCr', 'Edwards', 'SawyerW', 'CollgCr',
                 'NWAmes', 'Mitchel', 'Blmngtn', 'BrkSide', 'SWISU', 'Sawyer', 'IDOTRR',
                 'NPkVill', 'MeadowV', 'Blueste', 'BrDale']);
    }

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Y axis: initialization
    var y = d3.scaleLinear()
              .domain([0, d3.max(data, function(d) {return +d[yAttr];})])
              .range([height, 0]).nice();
    var yAxis = svg.append("g");

    data = data.filter(function(d){
      var shouldDisplay = true;
      for (var k in allFilter) {
        if (allFilter.hasOwnProperty(k)) {
          if (allFilter[k].size == 0) {
            continue;
          }
          if (allFilter[k].has(d[k])) {
            shouldDisplay = shouldDisplay & true;
          } else {
            shouldDisplay = false;
          }
        }
      }
      return shouldDisplay;
    });


    var tempDic = [];
    for (var i = 0; i < x.domain().length; i++) {
      var tempX = x.domain()[i];
      var tmpData = data.filter(function(d){ return d[xAttr] === tempX; });
      var tempY = d3.max(tmpData, function(d) { return parseFloat(d[yAttr]); });
      tempDic.push({x: tempX, y: tempY})
    }

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
          .value(function(d) { return d.x; })   // I need to give the vector of value
          .domain(x.domain());  // then the domain of the graphic
      // Y axis: update now that we know the domain
      // yAxis.transition().duration(1000).call(d3.axisLeft(y));
      yAxis.call(d3.axisLeft(y));

      // Join the rect with the bins data
      var u = svg.selectAll(null)
                  .data(tempDic)
                  .attr("class", "barchart-bar");
      // Manage the existing bars and eventually the new ones:
      u.enter()
        .append("rect") // Add a new rect for each new elements
        .on('mouseover', function(d) {
              // d3.select(this).style("fill", '#a3a7ad');
          })
        .on('mouseout', function(d) {
          if (!barchartSingleColor && xLabel === 'Neighborhood') {
            for (var i = 0; i < DB_NEIGHBORHOOD_LIST.length; i++) {
              if (d.x === DB_NEIGHBORHOOD_LIST[i]) {
                d3.select(this).style("fill", DB_NEIGHBORHOOD_COLORS[i]);
              }
            }
          } else if (xLabel === 'OverallQual' && clusterFilter === 'OverallQual') {
            d3.select(this).style("fill", DB_NEIGHBORHOOD_COLORS[d.x - 1]);
          } else {
            d3.select(this).style("fill", DB_COLOR);
          }
        })
        .on('mousedown',function(d) {
            if (allFilter[xLabel] == null) {
              allFilter[xLabel] = new Set();
            }
            if (allFilter[xLabel].has(d.x)) {
              allFilter[xLabel].delete(d.x);
            } else {
              allFilter[xLabel].add(d.x);
            }
            applyFilter();
          })
        // .merge(u) // get the already existing elements as well
        // .transition() // and apply changes to all of them
        // .duration(1000)
          .attr("x", function(d) { return x(d.x); })
          .attr("width", function(d) {
            var w = x.bandwidth() - 1;
            if (w < 0) { return 0;}
            return w;
          })
          .attr("y", function(d) { return y(d.y);})
          .attr("height", function(d) { return height - y(d.y);})
          // .attr("opacity", function(d) {
          //   if (allFilter[xLabel] == null || allFilter[xLabel].size == 0) {
          //     return 1.0;
          //   }
          //   if (allFilter[xLabel].has(d.x)) {
          //     return 1.0;
          //   }
          //   return 0.25;
          // })
          .call(d3.axisBottom(x))
          .style("fill", function(d) {
            if (xLabel === 'Neighborhood') {
              if (!barchartSingleColor) {
                for (var i = 0; i < DB_NEIGHBORHOOD_LIST.length; i++) {
                  if (d.x === DB_NEIGHBORHOOD_LIST[i]) {
                    return DB_NEIGHBORHOOD_COLORS[i];
                  }
                }
              }
            } else if (xLabel === 'OverallQual') {
              if (clusterFilter === 'OverallQual') {
                return DB_NEIGHBORHOOD_COLORS[d.x - 1];
              }
            }
            return DB_COLOR;
          });
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

    // Add Y axis
    var y_domainMax = d3.max(data, function(d) { return +d[attribute2] });
    var y_domainMin = d3.min(data, function(d) { return +d[attribute2] });
    var y = d3.scaleLinear()
              .domain([y_domainMin, y_domainMax])
              .range([height - 0, 0])
              .nice();
    svg.append("g")
      .call(d3.axisLeft(y));

    data = data.filter(function(d){
      var shouldDisplay = true;
      for (var k in allFilter) {
        if (allFilter.hasOwnProperty(k)) {
          if (allFilter[k].size == 0) {
            continue;
          }
          if (allFilter[k].has(d[k])) {
            shouldDisplay = shouldDisplay & true;
          } else {
            shouldDisplay = false;
          }
        }
      }
      return shouldDisplay;
    });

    // Add dots
    svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
          .attr("cx", function (d) { return x(d[attribute1]); } )
          .attr("cy", function (d) { return y(d[attribute2]); } )
          .attr("r", 1.75)
          .style("fill", function (d) {
            if (clusterFilter === 'None') {
              return DB_COLOR;
            } else if (clusterFilter === 'Neighborhood') {
              for (var i = 0; i < DB_NEIGHBORHOOD_LIST.length; i++) {
                if (d['Neighborhood'] === DB_NEIGHBORHOOD_LIST[i]) {
                  return DB_NEIGHBORHOOD_COLORS[i];
                }
              }
            } else if (clusterFilter === 'OverallQual') {
              return DB_NEIGHBORHOOD_COLORS[d[clusterFilter] - 1];
            }
            return DB_CLUSTER_COLORS[d[clusterFilter]];
          } );

  })
}


function db_barchart1() {
  // set the dimensions and margins of the graph
  var w = document.documentElement.clientWidth;
  console.log("document.documentElement.clientWidth: " + w);
  var margin = {top: 20, right: 90, bottom: 50, left: 90};
  if (w < 600) {
    margin = {top: 20, right: 40, bottom: 50, left: 40};
  }
  var width = w - margin.left - margin.right;
  var h = document.documentElement.clientHeight * 0.35;
  var height = h - margin.top - margin.bottom;

  // var filename = 'data/DB_Neighborhood.csv';
  //
  // db_barchart(width, height, margin, '#barchart', filename, 'Neighborhood', 'SalePrice', 'key', 'price');
  var filename = 'data/processedData.csv';
  db_barchart(width, height, margin, '#barchart', filename, 'Neighborhood', 'SalePrice', 'Neighborhood', 'SalePrice');
}

function db_barchart2() {
  // set the dimensions and margins of the graph
  var w = document.documentElement.clientWidth;
  var margin = {top:20, right: 10, bottom: 50, left: 90};
  if (w < 600) {
    margin = {top: 20, right: 10, bottom: 50, left: 40};
  }
  var width = w / 3;
  var height = w / 3 - 50;
  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;

  // var filename = 'data/DB_OverallQual.csv';
  var filename = 'data/processedData.csv';
  db_barchart(width, height, margin, '#barchart2', filename, 'OverallQual', 'SalePrice', 'OverallQual', 'SalePrice');
  // db_barchart(width, height, margin, '#barchart2', filename, 'OverallQual', 'SalePrice', 'key', 'price');
}

function db_scatter1() {
  var attribute1 = 'GrLivArea';
  var attribute2 = 'SalePrice';
  console.log(attribute1, attribute2);

  // set the dimensions and margins of the graph
  var w = document.documentElement.clientWidth;
  var margin = {top:20, right: 10, bottom: 50, left: 90};
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
