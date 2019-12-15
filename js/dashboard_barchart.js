
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
    if (xLabel === 'OverallQual' || xLabel === 'OverallCond') {
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
      if (!allFilter['OverallCond'].has(d['OverallCond'])) {
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
                return DB_GRADIENT_COLORS[d.x - 1];
              }
            } else if (xLabel === 'OverallCond') {
              if (clusterFilter === 'OverallCond') {
                return DB_GRADIENT_COLORS[d.x - 1];
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




function db_barchart1() {
  // set the dimensions and margins of the graph
  var w = document.documentElement.clientWidth - 100;
  if (w < DB_MIN_WIDTH) {
    w = DB_MIN_WIDTH;
  }
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

function db_barchart2(cond = false) {
  // set the dimensions and margins of the graph
  var w = document.documentElement.clientWidth - 100;
  if (w < DB_MIN_WIDTH) {
    w = DB_MIN_WIDTH;
  }
  var margin = {top:20, right: 50, bottom: 50, left: 48};
  var width = w / 3;
  var height = w / 3 - 50;
  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;
  var h = document.documentElement.clientHeight * 0.4;
  height = h - margin.top - margin.bottom;

  // var filename = 'data/DB_OverallQual.csv';
  var filename = 'data/processedData.csv';
  if (cond) {
    db_barchart(width, height, margin, '#barchart2', filename, 'OverallCond', 'SalePrice', 'OverallCond', 'SalePrice');
  } else {
    db_barchart(width, height, margin, '#barchart2', filename, 'OverallQual', 'SalePrice', 'OverallQual', 'SalePrice');
  }
}
