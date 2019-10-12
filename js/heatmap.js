function plotHeatmap() {
  // set the dimensions and margins of the graph
  var w = document.documentElement.clientWidth;
  var margin = {top:30, right: 100, bottom: 50, left: 100};
  if (w < 600) {
    margin = {top: 30, right: 75, bottom: 50, left: 75};
  }
  var width = Math.min(640, w);
  var height = Math.min(550, w);
  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;

  // append the svg object to the body of the page
  d3.select("#heatmap").selectAll("*").remove();
  var svg = d3.select("#heatmap")
              .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform",
                      "translate(" + margin.left + "," + margin.top + ")");

  // Build X scales and axis:
  var x = d3.scaleBand()
            .range([0, width])
            .domain(SCATTER_ATTRIBUTES)
            .padding(0.01);
  svg.append("g")
      .attr("transform", "translate(0," + (height - 30) + ")")
      .attr("class", "heatmapXAxis")
      .call(d3.axisBottom(x))
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

  var domainY = SCATTER_ATTRIBUTES.reverse();
  // Build X scales and axis:
  var y = d3.scaleBand()
            .range([height - 30, 0 ])
            .domain(domainY)
            .padding(0.01);
  svg.append("g")
      .attr("class", "heatmapYAxis")
      .call(d3.axisLeft(y));

  // Build color scale
  //var colorRange = ["#253ce7", "#fff", "#f00c00"];
  var colorRange = ["#253ce7", "#fff", "#c90000"];
  var myColor = d3.scaleLinear()
                  .range(colorRange)
                  .domain([-1.0, 0, 1.0]);

  //Read the data
  d3.csv("data/heatmap.csv", function(data) {
    console.log("Start rendering heatmap;");
    // add the squares
    svg.selectAll()
      .data(data, function(d) { return ""+d.x+':'+d.y;})
      .enter()
      .append("rect")
        .attr("x", function(d) { return x(d.x) })
        .attr("y", function(d) { return y(d.y) })
        .attr("width", x.bandwidth() )
        .attr("height", y.bandwidth() )
        .style("fill", function(d) {return myColor(d.corr)} );
  });

  // legend scale
  var legend_top = 15;
  var legend_height = 15;

  d3.select("#heatmapLegend").selectAll("*").remove();
  var legend_svg = d3.select("#heatmapLegend").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", legend_height + legend_top)
    .append("g")
      .attr("transform", "translate(" + margin.left + ", " + legend_top + ")");

  var defs = legend_svg.append("defs");

  var gradient = defs.append("linearGradient")
      .attr("id", "linear-gradient");

  var stops = [{offset: 0, color: colorRange[0], value: -1},
               {offset: .5, color: colorRange[1], value: 0},
               {offset: 1, color: colorRange[2], value: 1}];

  gradient.selectAll("stop")
      .data(stops)
    .enter().append("stop")
      .attr("offset", function(d){ return (100 * d.offset) + "%"; })
      .attr("stop-color", function(d){ return d.color; });

  legend_svg.append("rect")
            .attr("width", width)
            .attr("height", legend_height)
            .style("fill", "url(#linear-gradient)");

  legend_svg.selectAll("text").data(stops)
              .enter()
              .append("text")
                .attr("class", "heatmapLegendText")
                .attr("x", function(d){ return width * d.offset; })
                .attr("dy", -3)
                .style("text-anchor", function(d, i){ return i == 0 ? "start" : i == 1 ? "middle" : "end"; })
                .text(function(d, i){ return d.value.toFixed(2); });

}
