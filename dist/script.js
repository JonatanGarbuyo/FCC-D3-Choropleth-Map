const path = d3.geoPath();

// request data //
const files = ["https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json",
"https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"];

Promise.all(files.map(url => d3.json(url))).then(function (data) {

  const edu = data[0];
  const us = data[1];

  const min = d3.min(data[0], d => d.bachelorsOrHigher);
  const max = d3.max(data[0], d => d.bachelorsOrHigher);

  // scales //
  const colorScale = d3.scaleThreshold().
  domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8)).
  range(d3.schemeGreens[9]);


  // chart //
  const svg = d3.select("svg");

  // Choropleth Map //
  svg.append("g").
  attr("class", "counties").
  selectAll("path").
  data(topojson.feature(us, us.objects.counties).features).
  enter().
  append("path").
  attr("class", "county").
  attr("data-fips", d => d.id).
  attr("data-education", d => {
    const result = edu.filter(obj => obj.fips == d.id);
    return result[0] ? result[0].bachelorsOrHigher : 0;
  }).
  attr("d", path).
  attr("fill", d => {
    const result = edu.filter(obj => obj.fips == d.id);
    return result[0] ? colorScale(result[0].bachelorsOrHigher) : colorScale(0);
  }).

  on('mouseover', (d, i) => {
    tooltip.transition().
    duration(200).
    style('opacity', .9);

    const result = edu.filter(obj => obj.fips == d.id);

    tooltip.html(() => {
      const result = edu.filter(obj => {
        return obj.fips == d.id;
      });
      if (result[0]) {
        return `<div>${result[0]['area_name']}, ${result[0]['state']}: ${result[0].bachelorsOrHigher}'%' </div>`;
      }
      return 0;
    }).
    attr('data-education', () => {
      return result[0] ? result[0].bachelorsOrHigher : 0;
    }).
    style("left", d3.event.pageX + 10 + "px").
    style("top", d3.event.pageY - 28 + "px");
  }).

  on('mouseout', d => {
    tooltip.transition().
    duration(200).
    style('opacity', 0);
  });

  const tooltip = d3.select(".main").
  append("div").
  attr("id", "tooltip").
  style("opacity", 0);


  //legend
  legendValues = colorScale.domain().map(c => c);

  const x = d3.scaleLinear().
  domain([0, 100]).
  range([0, 300]);

  const xAxisLegend = d3.axisBottom(x).
  tickValues(legendValues);

  svg.append("g").
  attr("transform", "translate(300,24)").
  call(xAxisLegend);

  svg.append("g").
  attr("id", "legend").
  attr("transform", "translate(300,0)").
  selectAll("rect").
  data(legendValues).
  enter().
  append("rect").
  attr("x", (d, i) => x(d)).
  attr("y", d => 0).
  attr("width", d => d + 15).
  attr("height", d => 20).
  attr("fill", d => colorScale(d));

});