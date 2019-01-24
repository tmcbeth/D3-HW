var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.

var svg = d3
    .select(".chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append on SVG group

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params

var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";


// function used for updating x-scale var upon click on axis label

function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
  }

// function used for updating y-scale var upon click on axis label

function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
        d3.max(data, d => d[chosenYAxis]) * 1.2
      ])
      .range([0, width]);
  
    return yLinearScale;
  
  }

// function used for updating xAxis & yAxis vars upon click on axis label

function renderAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    
    return xAxis;

}

function renderAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);


    YAxis.transition()
        .duration(1000)
        .call(leftAxis);
    
    return yAxis;
}
    
// function used for updating circles group with a transition to
// new circles

function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
    
    return circlesGroup;
}








// function used for updating circles group with new tooltip

// NEED FOR Y UPDATES****************

function updateToolTip(chosenXAxis, circlesGroup) {
    
    if (chosenXAxis === "poverty") {
        var label = "In Poverty (%)";
    }
    else if (chosenXAxis === "age") {
        var label = "Age (Median)";
    }
    else {
        var label = "Household Income (Median)";
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.state}<br>${d[chosenXAxis]}<br>${d[chosenYAxis]}`)
        });
    
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data);
    });

    return circlesGroup;
}







// Retrieve data from the CSV file and execute everything below
d3.csv("data.csv", function (err, data) {
    if (err) throw err;
    
    // parse data
    data.forEach(function (data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.obesity = +data.obesity;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.smokes = +data.smokes;
    });


    // xLinearScale function above csv import
    var xLinearScale = xScale(data, chosenXAxis);

     // ylinearScale function from above csv import
    var yLinearScale = yScale(data, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    //append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    
    //append y axis
    var yAxis = chartGruop.append("g")
        .classed("y-axis", true)
        .attr("transform", `translate(${width},0)`)
        .call(leftAxis);
    
    //append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 20)
        .attr("fill", "blue")
        .attr("opacity", ".5");
    
    // Create group for 3 x-axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("inactive", true)
        .text("Household Income (Median)");
    
    // Create group for 3 y-axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(0, ${height / 2})`);
    
    var healthcareLabel = yLabelsGroup.append("text")
        .attr("x", 40)
        .attr("y", 0)
        .attr("value", "healthcare")
        .classed("active", true)
        .text("Lacks Healthcare (%)")
    
    var smokeLabel = yLabelsGroup.append("text")
        .attr("x", 20)
        .attr("y", 0)
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)")
    
    var obeseLabel = yLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("value", "obesity")
        .classed("inactive", true)
        .text("Obese (%)")
    
    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    
    // x axis labels event listener
    xLabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                console.log("chosen x axis:", chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(hairData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
      
      
      
      
    // y axis labels event listener
  yLabelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

      // replaces chosenXAxis with value
      chosenYAxis = value;

      console.log("chosen y axis:", chosenYAxis)

      // functions here found above csv import
      // updates x scale for new data
      yLinearScale = yScale(data, chosenYAxis);

      // updates x axis with transition
      yAxis = renderAxes(yLinearScale, yAxis);

      // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenYAxis === "healthcare") {
        healthcareLabel
          .classed("active", true)
          .classed("inactive", false);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        obesityLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if(chosenXAxis === "smokes") {
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", true)
          .classed("inactive", false);
        obesityLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        obesityLabel
          .classed("active", true)
          .classed("inactive", false);
        }
    }
  });
});