
// SVG drawing area

var margin = {top: 40, right: 40, bottom: 60, left: 60};

var width = 900 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;

var svg = d3.select("#chart-area").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var formatDate = d3.time.format("%Y");
loadData();
var data;
var original;

/* Initialize tooltip */
tip = d3.tip().attr('class', 'd3-tip').html(function(d) 
	{ return "<strong>Winner:</strong> <span style='color:yellow'>" + d.EDITION +
		"</span><p><strong>Goals:</strong> <span style='color:yellow'>" + d.GOALS; });
tip.offset([-20, -20])

function loadData() {

	d3.csv("data/fifa-world-cup.csv", function(error, csv) {
		csv.forEach(function(d){
			d.YEAR = formatDate.parse(d.YEAR);		
			d.TEAMS = +d.TEAMS;
			d.MATCHES = +d.MATCHES;
			d.GOALS = +d.GOALS;
			d.AVERAGE_GOALS = +d.AVERAGE_GOALS;
			d.AVERAGE_ATTENDANCE = +d.AVERAGE_ATTENDANCE;
		});
		data = csv;
		var temp = [data.length];
		var j = 19;
		for(i = 0; i< data.length; i++){
		    temp[j]=data[i];
		    j--;
		}
		data = temp;
		// reverse the order of input to put increasing order
		console.log("length", data.length)
		
		original = data;
		updateVisualization();
	});
}

// Render visualization
function updateVisualization() {
	console.log("data", data);
	 // scale time for x axis
    var x = d3.time.scale()
        .domain([data[0].YEAR, data[data.length - 1].YEAR])
        .rangeRound([0, width]);
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(d3.time.format("%B %Y"));

    // min and max for goals
    var max = d3.max(data, function (d) {return d.GOALS;});

    svg.call(tip);

    // scale for y axis
    var y = d3.scale.linear().domain([0, max]).range([height, 0]);
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var line = d3.svg.line()
	    .x(function(d) { return x(d.YEAR); })
	    .y(function(d) { return y(d.GOALS); })
	    .interpolate("linear");


	// trying things out
	var path = svg.selectAll('path').data(data);

    path.enter().append('svg:path').attr('d', line(data))
        .style('stroke-width', 1)
        .style('stroke', 'steelblue')
        .style("fill", "none");

    var circles = svg.selectAll('circle').data(data);

    circles.enter().append("circle")
		.attr("cx", function(d){ return x(d.YEAR)})
		.attr("cy", function(d){ return y(d.GOALS)})
		.attr("fill", "pink")
		.attr("r", 8)
		.on('mouseover', tip.show)
  		.on('mouseout', tip.hide)
  		.on('click', function(d){ showEdition(d)})

	svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .style("text-anchor", "end")
        .text("Date")
        .call(xAxis)
        .selectAll("text")
        .attr("transform", "rotate(15)");

    var group = svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
    var y_label = group.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Goals");



// ----------------------------------------------------
	var lower_years = [data.length];
	for(i = 0; i<data.length; i++){
	    lower_years[i] = data[i];
	}

	var select = d3.select(".lowerbound")
		.append('select')
		.attr('id', "lower")
		.attr('class','select')
	    .on('change', onchange)

	var options = select
	  .selectAll('option')
		.data(lower_years).enter()
		.append('option')
		.text(function (d) { return d.YEAR; });

	
	var upper_years = [data.length];
	var j = 19;
	for(i = 0; i<data.length; i++){
	    upper_years[j] = data[i];
	    j--;
	}

	var select = d3.select(".upperbound")
		.append('select')
		.attr('id', "upper")
		.attr('class','select')
	    .on('change',onchange)

	var options = select
	  .selectAll('option')
		.data(upper_years).enter()
		.append('option')
		.text(function (d) { return d.YEAR; });


	// option bar for the things
    var data1 = [ "Goals", "Teams", "Matches", "Average Goals", "Average Attendanace"];

	var select = d3.select(".select-box")
		.append('select')
		.attr('class','select')
	    .on('change',onchange)

	var options = select
	  .selectAll('option')
		.data(data1).enter()
		.append('option')
		.text(function (d) { return d; });


	function onchange() {
		svg.call(tip);
		path.remove();
		circles.remove();

		var selectValue_lower = d3.select('#lower').property('value');
		var selectValue_upper = d3.select('#upper').property('value');
		

		
		console.log("lower bound:", selectValue_lower);
		console.log("upper bound:", selectValue_upper);

		console.log(data[0].YEAR);

		var lower_i = 0;
		while(selectValue_lower != data[lower_i].YEAR)
		{
			lower_i++;
		}	
		var upper_i = 0;
		while(selectValue_upper != data[upper_i].YEAR)
		{
			upper_i++;
		}
		console.log(lower_i);
		console.log(upper_i);

		var temp = data.slice(lower_i, upper_i);
		circles = svg.selectAll('circle').data(temp);

		x = d3.time.scale()
	        .domain([data[lower_i].YEAR, data[upper_i].YEAR])
	        .rangeRound([0, width]);
	        
	   
	    xAxis.scale(x);

	    svg.select(".x.axis")
	    	.transition()
	    	.duration(800)
	    	.call(xAxis)
	    	.selectAll("text")
	    	.attr("transform", "rotate(15)");



		selectValue = d3.select('select').property('value')
		var min, max;
		var y_value;
		var label;
		// circles.transition
		if (selectValue == "Teams"){
		    max = d3.max(data, function (d) {return d.TEAMS;});
		    y.domain([0, max]);
		    label = "Teams";
		    tip.html(function(d){ return "<strong>Winner:</strong> <span style='color:yellow'>" + d.EDITION +
			"</span><p><strong>Teams:</strong> <span style='color:yellow'>" + d.TEAMS; });
		    circles.enter().append("circle")
				.attr("cx", function(d){ return x(d.YEAR)})
				.attr("cy", function(d){ return y(d.TEAMS)})
				.attr("fill", "pink")
				.on('mouseover', tip.show)
  				.on('mouseout', tip.hide)
  				.on('click', function(d){ showEdition(d)})
				.attr("r", 8); 
			line.y(function(d) { return y(d.TEAMS); });}
		else if (selectValue == "Matches"){
		    max = d3.max(data, function (d) {return d.MATCHES;});
			label = "Matches";
			y.domain([0, max]);
			tip.html(function(d){ return "<strong>Winner:</strong> <span style='color:yellow'>" + d.EDITION +
			"</span><p><strong>Matches:</strong> <span style='color:yellow'>" + d.MATCHES; });
			circles.enter().append("circle")
				.attr("cx", function(d){ return x(d.YEAR)})
				.attr("cy", function(d){ return y(d.MATCHES)})
				.attr("fill", "pink")
				.on('mouseover', tip.show)
  				.on('mouseout', tip.hide)
  				.on('click', function(d){ showEdition(d)})
				.attr("r", 8).transition().duration(800); 
			line.y(function(d) { return y(d.MATCHES); });}
		else if (selectValue == "Average Goals"){
		    max = d3.max(data, function (d) {return d.AVERAGE_GOALS;});
		    label = "Average Goals";
		    y.domain([0, max]);
		    tip.html(function(d){ return "<strong>Winner:</strong> <span style='color:yellow'>" + d.EDITION +
			"</span><p><strong>Average Goals:</strong> <span style='color:yellow'>" + d.AVERAGE_GOALS; });
		    circles.enter().append("circle")
				.attr("cx", function(d){ return x(d.YEAR)})
				.attr("cy", function(d){ return y(d.AVERAGE_GOALS)})
				.attr("fill", "pink")
				.on('mouseover', tip.show)
  				.on('mouseout', tip.hide)
  				.on('click', function(d){ showEdition(d)})
				.attr("r", 8).transition().duration(800); 
			line.y(function(d) { return y(d.AVERAGE_GOALS); });}
		else if (selectValue == "Average Attendanace"){
		    max = d3.max(data, function (d) {return d.AVERAGE_ATTENDANCE;});
		    label = "Average Attendanace";
		    y.domain([0, max]);
		    tip.html(function(d){ return "<strong>Winner:</strong> <span style='color:yellow'>" + d.EDITION +
			"</span><p><strong>Average Attendanace:</strong> <span style='color:yellow'>" + d.AVERAGE_ATTENDANCE; });
		    circles.enter().append("circle")
				.attr("cx", function(d){ return x(d.YEAR)})
				.attr("cy", function(d){ return y(d.AVERAGE_ATTENDANCE)})
				.attr("fill", "pink")
				.on('mouseover', tip.show)
  				.on('mouseout', tip.hide)
  				.on('click', function(d){ showEdition(d)})
				.attr("r", 8).transition().duration(800); 
			line.y(function(d) { return y(d.AVERAGE_ATTENDANCE); });}
		else {
		    max = d3.max(data, function (d) {return d.GOALS;});
		    label = "Goals";
		    y.domain([0, max]);
		    tip.html(function(d){ return "<strong>Winner:</strong> <span style='color:yellow'>" + d.EDITION +
			"</span><p><strong>Goals:</strong> <span style='color:yellow'>" + d.GOALS; });
		    circles.enter().append("circle")
				.attr("cx", function(d){ return x(d.YEAR)})
				.attr("cy", function(d){ return y(d.GOALS)})
				.attr("fill", "pink")
				.on('mouseover', tip.show)
  				.on('mouseout', tip.hide)
  				.on('click', function(d){ showEdition(d)})
				.attr("r", 8).transition().duration(800); 
			line.y(function(d) { return y(d.GOALS); });}

		svg.call(tip);

	    // y axis
	    yAxis = d3.svg.axis()
	        .scale(y)
	        .orient("left");

	    y_label.text(label);
	       
	    circles.transition().duration(800); 

	    svg.select(".y.axis")
	    	.transition()
	    	.duration(800)
	    	.call(yAxis);

	    path.enter().append('svg:path').attr('d', line(temp))
	    	.transition()
	    	.duration(800)
	        .style('stroke-width', 1)
	        .style('stroke', 'steelblue')
	        .style("fill", "none");
	    path.exit().remove();
	    // circle.exit().remove();
	    data = original;
	};
}

// Show details for a specific FIFA World Cup
function showEdition(d){
	console.log("touched");
	 		// Add svg element (drawing space)
			d3.select("#TEAMS").text(d.TEAMS);
			d3.select("#MATCHES").text(d.MATCHES);
			d3.select("#GOALS").text(d.GOALS);
			d3.select("#AVERAGE_GOALS").text(d.AVERAGE_GOALS);
			d3.select("#AVERAGE_ATTENDANCE").text(d.AVERAGE_ATTENDANCE);
			d3.select("#title").text(d.EDITION);
}
