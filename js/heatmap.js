function plotHeatmap() {
  // set the dimensions and margins of the graph
  var w = document.documentElement.clientWidth;
  var margin = {top:50, right: 100, bottom: 50, left: 100};
  if (w < 600) {
    margin = {top: 30, right: 75, bottom: 50, left: 75};
  }
  var width = Math.min(700, w);
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
}
