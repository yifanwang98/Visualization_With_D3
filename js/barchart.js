
const DEFAULT_BAR_COLOR = "#69b3a2";
const HOVERED_BAR_COLOR = "#326f61";
const DEFAULT_BAR_BIN = 50;

function changeBin(diff) {
  var newVal = parseInt(document.getElementById('barchart-nBin').value) + parseInt(diff);
  if (0 < newVal && newVal <= parseInt(document.getElementById('barchart-nBin').max)) {
    document.getElementById('barchart-nBin').value = newVal;
    document.getElementById('barchart-nBin').dispatchEvent(new Event('input', { bubbles: true }));
    document.getElementById('barchart-bin-number').innerHTML = newVal;
  }
}

function setUpDropdown() {
  var select = document.getElementById('barchart-attribute');
  var e = document.getElementById('barchart-dropdown');
  d3.csv("data/train.csv", function(data) {
    var headerNames = d3.keys(data[0]);
    console.log(headerNames);
    var i = 0
    for (; i < headerNames.length; i++) {
      if (headerNames[i] == 'SalePrice') {
        select.innerHTML += "<option value=\""+ headerNames[i]+ "\" selected>" + headerNames[i] + "</option>"
      } else {
        select.innerHTML += "<option value=\""+ headerNames[i]+ "\">" + headerNames[i] + "</option>"
      }
      e.innerHTML += "<div class=\"dropdown-content\"><a onclick =\"histogramHelper(this)\">" + headerNames[i] + "</a></div>";
    }
  });
}

function histogramHelper(e) {
  var select = document.getElementById('barchart-attribute');
  select.value = e.innerHTML;
  histogram(e.innerHTML);
}

function histogram(key=null) {
  if (key == null) {
    var e = document.getElementById('barchart-attribute');
    key = e.options[e.selectedIndex].text;
    console.log("Selected: " + key);
  }
  var catagorical = ['MSZoning', 'Street', 'Alley', 'LotShape', 'LandContour', 'Utilities', 'LotConfig', 'LandSlope', 'Neighborhood', 'Condition1', 'Condition2', 'BldgType', 'HouseStyle', 'RoofStyle', 'RoofMatl', 'Exterior1st', 'Exterior2nd', 'MasVnrType', 'ExterQual', 'ExterCond', 'Foundation', 'BsmtQual', 'BsmtCond', 'BsmtExposure', 'BsmtFinType1', 'BsmtFinType2', 'Heating', 'HeatingQC', 'CentralAir', 'Electrical', 'KitchenQual', 'Functional', 'FireplaceQu', 'GarageType', 'GarageFinish', 'GarageQual', 'GarageCond', 'PavedDrive', 'PoolQC', 'Fence', 'MiscFeature', 'SaleType', 'SaleCondition'];
  var showHistogram = document.getElementById('showHistogram').checked;//showHistogram
  if (catagorical.includes(key)) {
    histogramCatogorical(key, showHistogram);
    document.getElementById('barchart-bin-info').style.display = 'none'
  } else {
    histogramLinear(key, showHistogram);
    document.getElementById('barchart-bin-info').style.display = ''
  }

  var e = document.getElementById('barchart-title');
  e.innerHTML = key;
}

function histogramLinear(key = "Id", hist=false) {
  // set the dimensions and margins of the graph
  var w = document.documentElement.clientWidth;
  console.log("document.documentElement.clientWidth: " + w);
  var margin = {top: 30, right: 100, bottom: 30, left: 100};
  if (w < 600) {
    margin = {top: 30, right: 60, bottom: 30, left: 60};
  }
  var width = w - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  d3.select("#barchart").selectAll("*").remove();
  var svg = d3.select("#barchart")
              .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // get the data
  d3.csv("data/train.csv", function(data) {
    // X axis: scale and draw:
    var domainMax = d3.max(data, function(d) { return +d[key] });
    var domainMin = d3.min(data, function(d) { return +d[key] })
    var x = d3.scaleLinear()
        .domain([domainMin, domainMax])
        .range([0, width]).nice();

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
    if (hist) {
      svg.append("text")
          .attr("class", "y label")
          .attr("text-anchor", "end")
          .attr("font-family", "Avenir")
          .attr("y", 6)
          .attr("dy", "-1em")
          .attr("dx", "1.2em")
          .text("Frequency");
    } else {
      svg.append("text")
          .attr("class", "y label")
          .attr("text-anchor", "end")
          .attr("font-family", "Avenir")
          .attr("y", 6)
          .attr("dy", "-1em")
          .attr("dx", "1.2em")
          .text("SalePrice");
    }


    // Y axis: initialization
    var y = d3.scaleLinear().range([height, 0]).nice();
    var yAxis = svg.append("g")

    // A function that builds the graph for a specific value of bin
    function update(nBin) {

      // Try to do bins by hand
      var actualBins = [];
      var step = (domainMax - domainMin) / (nBin);
      var i = domainMin;
      while (i < domainMax - step + 0.0001) {
        actualBins.push(i);
        i += step;
      }
      actualBins.push(domainMax + 1);

      // set the parameters for the histogram
      var histogram = d3.histogram()
          .value(function(d) { return +d[key]; })   // I need to give the vector of value
          .domain(x.domain())  // then the domain of the graphic
          .thresholds(actualBins); // then the numbers of bins

      // And apply this function to data to get the bins
      var bins = histogram(data);
      console.log(bins);

      // Y axis: update now that we know the domain
      if (hist) {
        y.domain([0, d3.max(bins, function(d) { return +d.length; })]);
      } else {
        y.domain([0, 800000]);
      }
      yAxis.transition().duration(1000).call(d3.axisLeft(y));

      // Join the rect with the bins data
      var u = svg.selectAll("rect")
                  .data(bins)
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
        .on("mousedown", function() {
          var div = d3.select(this).classed("active", true);
          var w = d3.select(window).on("mousemove", mousemove).on("mouseup", mouseup);
          d3.event.preventDefault();
          var original = document.getElementById('barchart-nBin').value;
          function mousemove() {
            console.log(d3.mouse(div.node()));
            if (d3.mouse(div.node())[0] < -20.0) {
              var newVal = parseInt(document.getElementById('barchart-nBin').value) - 1;
              if (0 < newVal) {
                document.getElementById('barchart-nBin').value = newVal;
                document.getElementById('barchart-bin-number').innerHTML = newVal;
              }
            } else if (d3.mouse(div.node())[0] > 20.0) {
              var newVal = parseInt(document.getElementById('barchart-nBin').value) + 1;
              if (newVal <= parseInt(document.getElementById('barchart-nBin').max)) {
                document.getElementById('barchart-nBin').value = newVal;
                document.getElementById('barchart-bin-number').innerHTML = newVal;
              }
            }

          }
          function mouseup() {
            update(document.getElementById('barchart-nBin').value);
            div.classed("active", false);
            w.on("mousemove", null).on("mouseup", null);
          }
        })
        .merge(u) // get the already existing elements as well
        .transition() // and apply changes to all of them
        .duration(1000)
          .attr("x", 1)
          .attr("width", function(d) {
            var val = x(d.x1) - x(d.x0) - 1;
            if (val < 0) { return 0; }
            return x(d.x1) - x(d.x0) - 1 ; })
          .attr("transform", function(d) {
            if (hist) {
              return "translate(" + x(d.x0) + "," + y(d.length) + ")";
            }
            return "translate(" + x(d.x0) + "," + y(d3.max(d, function(d) { return +d.SalePrice; })) + ")"; })
          .attr("height", function(d) {
            if (hist) {
              return height - y(d.length);;
            }
            var yyy = d3.max(d, function(d) {
              return +d.SalePrice; })
            if (yyy) {
              return height - y(yyy);
            }
            return 0;
          })
          .style("fill", "#69b3a2");
      // If less bar in the new histogram, I delete the ones not in use anymore
      u.exit().remove()
    }

    // Initialize with 20 bins
    update(parseInt(document.getElementById('barchart-nBin').value))

    // Listen to the button -> update if user change it
    d3.select("#barchart-nBin").on("input", function() {
      update(+this.value);
    });

  });

}

function histogramCatogorical(key = "MSZoning", hist=false) {
  // set the dimensions and margins of the graph
  var w = document.documentElement.clientWidth;
  console.log("document.documentElement.clientWidth: " + w);
  var margin = {top: 30, right: 100, bottom: 30, left: 100};
  if (w < 600) {
    margin = {top: 30, right: 40, bottom: 30, left: 40};
  }
  var width = w - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  d3.select("#barchart").selectAll("*").remove();
  var svg = d3.select("#barchart")
              .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  if (hist) {
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("font-family", "Avenir")
        .attr("y", 6)
        .attr("dy", "-1em")
        .attr("dx", "1.2em")
        .text("Frequency");
  } else {
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("font-family", "Avenir")
        .attr("y", 6)
        .attr("dy", "-1em")
        .attr("dx", "1.2em")
        .text("SalePrice");
  }

  // get the data
  if (hist) {
    var filename = 'data/Frequency/' + key + ".csv"
    d3.csv(filename, function(data) {
      // X axis: scale and draw:
      var x = d3.scaleBand()
          .domain(data.map(function(d) {
            return d.key;
          }))
          .range([1, width]);
      svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

      // Y axis: initialization
      var y = d3.scaleLinear()
          .domain([0, d3.max(data, function(d) {
            return +d.frequency;
          })])
          .range([height, 0]).nice();
      var yAxis = svg.append("g");

      // A function that builds the graph for a specific value of bin
      function update() {

        // set the parameters for the histogram
        var histogram = d3.histogram()
            .value(function(d) { return d.key; })   // I need to give the vector of value
            .domain(x.domain())  // then the domain of the graphic
            ; // then the numbers of bins

        // And apply this function to data to get the bins

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
            .attr("x", function(d) { return x(d.key); })
            .attr("width", function(d) {
              var w = x.bandwidth() - 1;
              if (w < 0) { return 0;}
              return w;
            })
            .attr("y", function(d) { return y(d.frequency);})
            .attr("height", function(d) { return height - y(d.frequency);})
            .call(d3.axisBottom(x))
            .style("fill", "#69b3a2");
        // If less bar in the new histogram, I delete the ones not in use anymore
        u.exit().remove()
      }

      // Initialize with 20 bins
      update()

    });
  } else {
    var filename = 'data/Frequency/' + key + ".csv"
    d3.csv(filename, function(data) {
      // X axis: scale and draw:
      var x = d3.scaleBand()
          .domain(data.map(function(d) {
            return d.key;
          }))
          .range([1, width]);
      svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

      // Y axis: initialization
      // var y = d3.scaleLinear().range([height, 0]).domain([0, 800000]).nice();
      var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) {
          return +d.price;
        })])
        .range([height, 0]).nice();
      var yAxis = svg.append("g");

      // A function that builds the graph for a specific value of bin
      function update() {

        // set the parameters for the histogram
        var histogram = d3.histogram()
            .value(function(d) { return d.key; })   // I need to give the vector of value
            .domain(x.domain())  // then the domain of the graphic
            ; // then the numbers of bins

        // And apply this function to data to get the bins

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
            .attr("x", function(d) { return x(d.key); })
            .attr("width", function(d) {
              var w = x.bandwidth() - 1;
              if (w < 0) { return 0;}
              return w;
            })
            .attr("y", function(d) { return y(d.price);})
            .attr("height", function(d) { return height - y(d.price);})
            .call(d3.axisBottom(x))
            .style("fill", "#69b3a2");
        // If less bar in the new histogram, I delete the ones not in use anymore
        u.exit().remove()
      }

      // Initialize with 20 bins
      update()

    });
  }

}
