
const SCATTER_ATTRIBUTES = ['1stFlrSF', 'GarageArea', 'GrLivArea', 'LotArea',
                            'LotFrontage', 'MasVnrArea', 'OverallQual',
                            'SalePrice', 'TotalBsmtSF', 'YearBuilt'];
const SCATTER_DOT_COLOUR = "#1F616B";

function setUpDropdown_scatter() {
  var select = document.getElementById('scatter-attribute-1');
  var e = document.getElementById('scatter-dropdown-1');
  var i = 0
  for (; i < SCATTER_ATTRIBUTES.length; i++) {
    var name = SCATTER_ATTRIBUTES[i];
    if (SCATTER_ATTRIBUTES[i] == 'GrLivArea') {
      select.innerHTML += "<option value=\""+ name + "\" selected>" + name + "</option>"
    } else {
      select.innerHTML += "<option value=\""+ name+ "\">" + name + "</option>"
    }
    e.innerHTML += "<div class=\"dropdown-content\"><a onclick =\"scatterDropdownOnClick(this, 1)\">" + name + "</a></div>";
  }

  select = document.getElementById('scatter-attribute-2');
  e = document.getElementById('scatter-dropdown-2');
  i = 0
  for (; i < SCATTER_ATTRIBUTES.length; i++) {
    var name = SCATTER_ATTRIBUTES[i];
    if (SCATTER_ATTRIBUTES[i] == 'SalePrice') {
      select.innerHTML += "<option value=\""+ name + "\" selected>" + name + "</option>"
    } else {
      select.innerHTML += "<option value=\""+ name+ "\">" + name + "</option>"
    }
    e.innerHTML += "<div class=\"dropdown-content\"><a onclick =\"scatterDropdownOnClick(this, 2)\">" + name + "</a></div>";
  }
}

function scatterDropdownOnClick(e, i) {
  document.getElementById('scatter-attribute-' + i).value = e.innerHTML;
  document.getElementById('scatter-title-' + i).innerHTML = e.innerHTML;
  plotScatter();
}

function plotScatter() {
  var e = document.getElementById('scatter-attribute-1');
  var attribute1 = e.options[e.selectedIndex].text;
  e = document.getElementById('scatter-attribute-2');
  var attribute2 = e.options[e.selectedIndex].text;
  console.log(attribute1, attribute2);

  // set the dimensions and margins of the graph
  var w = document.documentElement.clientWidth;
  var margin = {top:50, right: 100, bottom: 50, left: 100};
  if (w < 600) {
    margin = {top: 30, right: 60, bottom: 30, left: 60};
  }
  var width = Math.min(650, w);
  var height = Math.min(500, w);
  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;

  // append the svg object to the body of the page
  d3.select("#scatterPlot").selectAll("*").remove();
  var svg = d3.select("#scatterPlot")
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
      .attr("dx", "1.2em")
      .text(attribute2);
  svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("font-family", "Avenir")
      .attr("x", 6)
      .attr("dy", "" + (height - 20) + "px")
      .attr("dx", "" + (width) + "px")
      .text(attribute1);

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
      .attr("transform", "translate(0," + (height - 15) + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");;

    // Add Y axis
    var y_domainMax = d3.max(data, function(d) { return +d[attribute2] });
    var y_domainMin = d3.min(data, function(d) { return +d[attribute2] });
    var y = d3.scaleLinear()
              .domain([y_domainMin, y_domainMax])
              .range([height - 15, 0])
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
