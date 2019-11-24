const DB_COLOR = '#474f5c';
const DB_CLUSTER_COLORS = ['#db9f1d', '#0193bd', '#129793', '#374749'];
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
const DB_SCATTER_LIST = ['PC1', 'PC2', 'GrLivArea', 'SalePrice', 'YearBuilt', 'MDS1', 'MDS2'];
const DB_DOMAINS = {};
const DB_CLUSTER_SELECTION = [true, true, true, true];

var clusterFilter = 'Agglomerative';
var barchartSingleColor = true;

var allFilter = {};

function resetFilter() {
  for (var i = 1; i <= 4; i++) {
    DB_CLUSTER_SELECTION[i - 1] = true;
    document.getElementById('clusterSelection' + i).checked = true;
  }
  clusterFilter = 'Agglomerative';
  barchartSingleColor = true;
  allFilter = {};
  resetNeighborhood();
  resetOverallQual();
  resetScatter();
  db_clusterFilterChanges();
}

function resetNeighborhood() {
  allFilter['Neighborhood'] = new Set();
  for (var i = 0; i < DB_NEIGHBORHOOD_LIST.length; i++) {
    allFilter['Neighborhood'].add(DB_NEIGHBORHOOD_LIST[i]);
  }
}

function resetOverallQual() {
  allFilter['OverallQual'] = new Set();
  for (var i = 1; i <= 10; i++) {
    allFilter['OverallQual'].add("" + (i));
  }
}

function resetScatter() {
  allFilter['GrLivArea'] = null;
  allFilter['SalePrice'] = null;
  allFilter['PC1'] = null;
  allFilter['PC2'] = null;
  allFilter['MDS1'] = null;
  allFilter['MDS2'] = null;
}

function applyFilter() {
  db_scatter1();
  db_scatter2();
  db_scatter3(document.getElementById('pcaOrMDS_mds').checked);
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
  if (clusterFilter == 'Agglomerative' || clusterFilter == 'KMeans') {
    document.getElementById('clusterSelectionSection').style.display = 'block';
    for (var i = 1; i <= 4; i++) {
      document.getElementById('l_clusterSelection' + i).style.color = DB_CLUSTER_COLORS[i - 1];
      document.getElementById('l_clusterSelection' + i).style.backgroundColor = DB_CLUSTER_COLORS[i - 1];
    }
  } else {
    document.getElementById('clusterSelectionSection').style.display = 'none';
  }
  applyFilter();
}

function db_clusterSelectionChanges() {
  for (var i = 1; i <= 4; i++) {
    DB_CLUSTER_SELECTION[i - 1] = document.getElementById('clusterSelection' + i).checked;
  }
  applyFilter();
}

function db_clusterSelectionChangesAll(val) {
  for (var i = 1; i <= 4; i++) {
    DB_CLUSTER_SELECTION[i - 1] = val;
    document.getElementById('clusterSelection' + i).checked = val;
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
    if (xLabel == 'Neighborhood') {
      svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x))
          .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.3em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-30)");
    } else {
      svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));
    }

    // Y axis: initialization
    var y = d3.scaleLinear()
              .domain([-1, d3.max(data, function(d) {return +d[yAttr];})])
              .range([height, 0]).nice();
    var yAxis = svg.append("g");

    data = data.filter(function(d){
      if (clusterFilter == 'Agglomerative' || clusterFilter == 'KMeans') {
        if (!DB_CLUSTER_SELECTION[d[clusterFilter]]) {
          return false;
        }
      }

      if (!allFilter['Neighborhood'].has(d['Neighborhood'])) {
        return false;
      }
      if (!allFilter['OverallQual'].has(d['OverallQual'])) {
        return false;
      }
      for (var i = 0; i < DB_SCATTER_LIST.length; i++) {
        var kkk = DB_SCATTER_LIST[i];
        if (allFilter[kkk] != null) {
          if (DB_DOMAINS[kkk](d[kkk]) < allFilter[kkk][0] || DB_DOMAINS[kkk](d[kkk]) > allFilter[kkk][1]) {
            return false;
          }
        }
      }
      return true;
    });


    var tempDic = [];
    for (var i = 0; i < x.domain().length; i++) {
      var tempX = x.domain()[i];
      var tmpData = data.filter(function(d){ return d[xAttr] === tempX; });
      var tempY = d3.max(tmpData, function(d) { return parseFloat(d[yAttr]); });
      if (tempY == null) {
        tempY = 0;
      }
      tempDic.push({x: tempX, y: tempY})
    }

    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("font-family", "Avenir")
        .attr("font-size", "14px")
        .attr("x", 6)
        .attr("dy", "" + (height + 40) + "px")
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
        .on('mousedown',function(d) {
            if (allFilter[xLabel].has(d.x)) {
              allFilter[xLabel].delete(d.x);
              if (allFilter[xLabel].size === 0) {
                if (xLabel == 'Neighborhood') {
                  resetNeighborhood();
                } else {
                  resetOverallQual();
                }
              }
            } else {
              allFilter[xLabel].add(d.x);
            }

            applyFilter();
          })
          .attr("x", function(d) { return x(d.x); })
          .attr("width", function(d) {
            var w = x.bandwidth() - 1;
            if (w < 0) { return 0;}
            return w;
          })
          .attr("y", function(d) { return y(d.y);})
          .attr("height", function(d) { return height - y(d.y);})
          .call(d3.axisBottom(x))
          .style("fill", function(d) {
            if (d.y <= 0) {
              return "#eeeeee";
            }
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
      .call( d3.brush() // Add the brush feature using the d3.brush function
          // initialise the brush area with the whole graph area
          .extent( [ [margin.left, margin.top], [width + margin.left + 1, height + margin.top + 1] ] )
          .on("end", function () {
            if (d3.event.selection == null) {
              allFilter[xLabel] = null;
              allFilter[yLabel] = null;
            } else {
              allFilter[xLabel] = [d3.event.selection[0][0] - margin.left, d3.event.selection[1][0] - margin.left];
              allFilter[yLabel] = [d3.event.selection[0][1] - margin.top, d3.event.selection[1][1] - margin.top];
            }
            applyFilter();
            console.log(allFilter);
          })
      )
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
  svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("font-family", "Avenir")
      .attr("font-size", "14px")
      .attr("fill", "black")
      .attr("y", 6)
      .attr("dy", "-1em")
      .attr("dx", "1.2em")
      .text(yLabel);
  svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("font-family", "Avenir")
      .attr("font-size", "14px")
      .attr("fill", "black")
      .attr("x", 6)
      .attr("dy", "" + (height + 35) + "px")
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
    DB_DOMAINS[xLabel] = x;
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
    DB_DOMAINS[yLabel] = y;
    svg.append("g")
      .call(d3.axisLeft(y));

    data = data.filter(function(d){
      if (clusterFilter == 'Agglomerative' || clusterFilter == 'KMeans') {
        if (!DB_CLUSTER_SELECTION[d[clusterFilter]]) {
          return false;
        }
      }

      if (!allFilter['Neighborhood'].has(d['Neighborhood'])) {
        return false;
      }
      if (!allFilter['OverallQual'].has(d['OverallQual'])) {
        return false;
      }
      for (var i = 0; i < DB_SCATTER_LIST.length; i++) {
        var kkk = DB_SCATTER_LIST[i];
        if (allFilter[kkk] != null) {
          if (DB_DOMAINS[kkk](d[kkk]) < allFilter[kkk][0] || DB_DOMAINS[kkk](d[kkk]) > allFilter[kkk][1]) {
            return false;
          }
        }
      }
      return true;
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

      if (xLabel === 'PC1') {
        d3.csv("data/DB_pca_components.csv", function(data) {
          var x_ratio = 45;
          var xx = d3.scaleLinear()
                    .domain([x.domain()[0] / x_ratio, x.domain()[1] / x_ratio])
                    .range([0, width])
                    .nice();
          svg.append("g")
              .call(d3.axisTop(xx))
              .attr("class", "db_pcaBiplotAxis");

          var y_ratio = 80;
          var yy = d3.scaleLinear()
                    .domain([y.domain()[0] / y_ratio, y.domain()[1] / y_ratio])
                    .range([height, 0]);
          svg.append("g")
              .attr("transform", "translate(" + (width) + ", 0)")
              .call(d3.axisRight(yy))
              .attr("class", "db_pcaBiplotAxis");
          svg.append("g")
              .selectAll("stroke")
              .data(data)
              .enter()
                .append("line")
                .attr("x1", x(0))
                .attr("y1", y(0))
                .attr("x2", function (d) { return xx(d['Component 1']); })
                .attr("y2", function (d) { return yy(d['Component 2']); })
                .attr("stroke-width", 1.75)
                .attr("stroke", "#b7293e");

          svg.append("g")
              .selectAll("text")
              .data(data)
              .enter()
                .append("text")
                .attr("x", function (d) {
                  if (d["Attribute"] === 'GrLivArea') {
                    return xx(d['Component 1']) - width * 0.137;
                  }
                  return xx(d['Component 1']) + 1; })
                .attr("y", function (d) {
                  if (d["Attribute"] === 'GrLivArea') {
                    return yy(d['Component 2']) - 1;
                  }
                  if (d["Attribute"] === 'OverallQual') {
                    return yy(d['Component 2']) + height * 0.02;
                  }
                  if (d["Attribute"] === 'YearBuilt') {
                    return yy(d['Component 2']) - height * 0.01;
                  }
                  return yy(d['Component 2']);
                })
                .text(function (d) { return d["Attribute"]; })
                .attr("font-family", "Avenir")
                .attr("font-size", "11px")
                .attr("font-weight", "500")
                .attr("fill", "#b7293e");

        });
      }
  });
}


function db_barchart1() {
  // set the dimensions and margins of the graph
  var w = document.documentElement.clientWidth - 100;
  // console.log("document.documentElement.clientWidth: " + w);
  var margin = {top: 20, right: 10, bottom: 50, left: 50};
  if (w < 600) {
    margin = {top: 20, right: 40, bottom: 50, left: 40};
  }
  var width = 2 * w / 3 - margin.left - margin.right;
  var h = document.documentElement.clientHeight * 0.4;
  var height = h - margin.top - margin.bottom;

  // var filename = 'data/DB_Neighborhood.csv';
  //
  // db_barchart(width, height, margin, '#barchart', filename, 'Neighborhood', 'SalePrice', 'key', 'price');
  var filename = 'data/processedData.csv';
  db_barchart(width, height, margin, '#barchart', filename, 'Neighborhood', 'SalePrice', 'Neighborhood', 'SalePrice');
}

function db_barchart2() {
  // set the dimensions and margins of the graph
  var w = document.documentElement.clientWidth - 100;
  var margin = {top:20, right: 50, bottom: 50, left: 48};
  var width = w / 3;
  var height = w / 3 - 50;
  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;
  var h = document.documentElement.clientHeight * 0.4;
  height = h - margin.top - margin.bottom;

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
  var w = document.documentElement.clientWidth - 100;
  var margin = {top:20, right: 40, bottom: 50, left: 50};
  var width = w / 3;
  var height = w / 3 - 50;
  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;

  var filename = 'data/processedData.csv';
  db_scatter(width, height, margin, '#scatterPlot1', filename, attribute1, attribute2, attribute1, attribute2);
  // Add brushing
  d3.select("#scatterPlot1")
    .call( d3.brush()                     // Add the brush feature using the d3.brush function
    .extent( [ [margin.left, margin.top], [width, height] ] )       // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
  )
}

function db_scatter2() {
  var attribute1 = 'GrLivArea';
  var attribute2 = 'YearBuilt';
  console.log(attribute1, attribute2);

  // set the dimensions and margins of the graph
  var w = document.documentElement.clientWidth - 100;
  var margin = {top:20, right: 40, bottom: 50, left: 40};
  var width = w / 3;
  var height = w / 3 - 50;
  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;


  var filename = 'data/processedData.csv';
  db_scatter(width, height, margin, '#scatterPlot2', filename, attribute1, attribute2, attribute1, attribute2);

  // Add brushing
  d3.select("#scatterPlot2")
    .call( d3.brush()                     // Add the brush feature using the d3.brush function
    .extent( [ [margin.left, margin.top], [width, height] ] )       // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
  )
}

function db_scatter3(mds = false) {
  var attribute1 = 'PC1';
  var attribute2 = 'PC2';
  if (mds) {
    attribute1 = 'MDS1';
    attribute2 = 'MDS2';
  }
  console.log(attribute1, attribute2);

  // set the dimensions and margins of the graph
  var w = document.documentElement.clientWidth - 100;
  var margin = {top:20, right: 40, bottom: 50, left: 40};
  var width = w / 3;
  var height = w / 3 - 50;
  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;


  var filename = 'data/processedData.csv';
  db_scatter(width, height, margin, '#scatterPlot3', filename, attribute1, attribute2, attribute1, attribute2);

  // Add brushing
  d3.select("#scatterPlot3")
    .call( d3.brush()                     // Add the brush feature using the d3.brush function
    .extent( [ [margin.left, margin.top], [width, height] ] )       // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
  )
}
