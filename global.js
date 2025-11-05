import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height);

const projection = d3.geoMercator()
    .scale(150)
    .center([0, 0])
    .translate([width / 2, height / 2]);

const path = d3.geoPath()
    .projection(projection);

// Load world map GeoJSON
d3.json("data/custom.geo.json").then(function(world) {
    svg.selectAll(".country")
        .data(world.features)
        .enter().append("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("fill", "grey");

    // Call function to load and plot CSV data after map is rendered
    loadAndPlotCSVData();
});

let year = 2000;

function loadAndPlotCSVData() {
    d3.csv("data/data.csv").then(function(data) {
        // Filter out invalid data points if necessary
        const validData = data.filter(d => d['yyyy'] == year);
        validData.sort((a,b) => b['so2(kt)']-a['so2(kt)']);
        console.log(validData);

        var svg = d3.select("svg");
        svg.selectAll(".data-point").remove();

        // Plot the data points
        svg.selectAll(".data-point")
            .data(validData)
            .enter().append("circle")
            .attr("class", "data-point")
            .attr("fill", "green")
            .attr("fill-opacity", 0.6)
            .attr("r", d => Math.sqrt(d['so2(kt)'])) // Radius of the circle
            .attr("transform", function(d) {
                // Project latitude and longitude to screen coordinates
                const coords = projection([+d.lon, +d.lat]);
                return `translate(${coords[0]},${coords[1]})`;
            })
            .attr("data-info", d => d);
    })

    const hoverBox = document.getElementById('hoverBox');

    d3.selectAll("circle")
            .on('mouseover', (event) => {
                const circleInfo = event.target.getAttribute('data-info');
                    if (circleInfo) {
                        hoverBox.innerHTML = circleInfo;
                        hoverBox.style.display = 'block';

                        // Position the hover box near the mouse or circle
                        // Adjust offsets as needed for desired positioning
                        hoverBox.style.left = (event.pageX + 10) + 'px';
                        hoverBox.style.top = (event.pageY + 10) + 'px';
                    }
            })
            .on('mouseout', () => {
                hoverBox.style.display = 'none';
            });
}

var slider = document.getElementById("myRange");
var output = document.getElementById("demo");

// Display the default slider value
output.innerHTML = slider.value;

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  output.innerHTML = this.value;
  year = this.value;
  loadAndPlotCSVData();
};