// add your JavaScript/D3 to this file
d3.csv("https://raw.githubusercontent.com/yuhe6/meat_dairy_production/main/global-meat-production.csv").then(function(data) {
    const years = Array.from(new Set(data.map(d => d.Year)));

    d3.select("#yearSelect")
        .selectAll("option")
        .data(years)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    const initialYear = years[0];

    updateChart(initialYear);

    function updateChart(selectedYear) {
        const filteredData = data.filter(d => d.Year == selectedYear);

        // Sort data by meat consumption in descending order
        filteredData.sort((a, b) => b.Meat - a.Meat);

        // Select the top 5 countries
        const topCountries = filteredData.slice(0, 10);

        const margin = { top: 20, right: 20, bottom: 50, left: 60 };
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        d3.select("#chart").selectAll("*").remove();

        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(topCountries.map(d => d.Entity))
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(topCountries, d => +d.Meat)])
            .range([height, 0]);

        // Add some color to the bars
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        svg.selectAll(".bar")
            .data(topCountries)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.Entity))
            .attr("width", x.bandwidth())
            .attr("y", d => y(+d.Meat))
            .attr("height", d => height - y(+d.Meat))
            .attr("fill", d => colorScale(d.Entity))
            .on("mouseover", function (event, d) {
                // Add a tooltip on mouseover
                d3.select(this).attr("fill", "orange");
                const tooltip = d3.select("#chart").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`<strong>${d.Entity}</strong><br/>Meat: ${d.Meat}`)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                // Remove the tooltip on mouseout
                d3.select(this).attr("fill", d => colorScale(d.Entity));
                d3.select(".tooltip").remove();
            });

        const xAxis = d3.axisBottom(x);
        const yAxis = d3.axisLeft(y);

        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", "-.15em")
            .attr("transform", "rotate(-45)");

        svg.append("g")
            .attr("class", "y-axis")
            .call(yAxis);

        svg.append("text")
            .attr("class", "chart-title")
            .attr("x", width / 2)
            .attr("y", -margin.top / 2)
            .text(`Top 10 Meat Consumers in ${selectedYear}`);
    }

    d3.select("#yearSelect").on("change", function () {
        const selectedYear = this.value;
        updateChart(selectedYear);
    });
});
