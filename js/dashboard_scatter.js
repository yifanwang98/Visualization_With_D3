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
              return DB_GRADIENT_COLORS[d[clusterFilter] - 1];
            } else if (clusterFilter === 'OverallCond') {
              return DB_GRADIENT_COLORS[d[clusterFilter] - 1];
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

function db_scatter1() {
  var attribute1 = 'GrLivArea';
  var attribute2 = 'SalePrice';
  console.log(attribute1, attribute2);

  // set the dimensions and margins of the graph
  var w = document.documentElement.clientWidth - 100;
  if (w < DB_MIN_WIDTH) {
    w = DB_MIN_WIDTH;
  }
  var margin = {top:20, right: 40, bottom: 50, left: 50};
  var width = w / 3;
  var height = w / 3 - 50;
  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;

  var filename = 'data/processedData.csv';
  db_scatter(width, height, margin, '#scatterPlot1', filename, attribute1, attribute2, attribute1, attribute2);
}

function db_scatter2() {
  var attribute1 = 'GrLivArea';
  var attribute2 = 'YearBuilt';
  console.log(attribute1, attribute2);

  // set the dimensions and margins of the graph
  var w = document.documentElement.clientWidth - 100;
  if (w < DB_MIN_WIDTH) {
    w = DB_MIN_WIDTH;
  }
  var margin = {top:20, right: 40, bottom: 50, left: 40};
  var width = w / 3;
  var height = w / 3 - 50;
  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;

  var filename = 'data/processedData.csv';
  db_scatter(width, height, margin, '#scatterPlot2', filename, attribute1, attribute2, attribute1, attribute2);
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
  if (w < DB_MIN_WIDTH) {
    w = DB_MIN_WIDTH;
  }
  var margin = {top:20, right: 40, bottom: 50, left: 40};
  var width = w / 3;
  var height = w / 3 - 50;
  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;


  var filename = 'data/processedData.csv';
  db_scatter(width, height, margin, '#scatterPlot3', filename, attribute1, attribute2, attribute1, attribute2);
}
