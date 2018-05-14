/*
*    barChart.js
*   Reusbale bar chart function
*/


BarChart = function(_parentElement,_filterState){

  var vis = this;
  this.parentElement = _parentElement;
  this.filterState = _filterState;
 
  this.initVis();
};

BarChart.prototype.initVis = function(){
    var vis = this;

  /************* DEFINING STATIC VALUES***********************/
 vis.margin = { left:40, right:50, top:50, bottom:60 };
 vis.height = 300 - vis.margin.top - vis.margin.bottom; 
 vis.width = 400 - vis.margin.left - vis.margin.right;

vis.svg = d3.select("#barchart-area")
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
vis.g = vis.svg.append("g")
          .attr("transform", "translate(" + vis.margin.left +", " + vis.margin.top + ")");

vis.t = () => { return d3.transition().duration(1000); }  
vis.tooltip = d3.select("body").append("div").attr("class", "toolTip");


vis.x = d3.scaleBand()
        .domain(["M","F"])
        .range([0, vis.width])
        .padding(0.5);

vis.y = d3.scaleLinear().range([vis.height, 0]);

vis.barColour = d3.scaleOrdinal().range(["#98abc5", "#ff8c00"]);  


vis.formatValue = d3.format(".2s");

vis.yAxisCall = d3.axisLeft().tickFormat(function(d) {return formatValue(d);});

vis.xAxisCall = d3.axisBottom();
        
    vis.xAxis = vis.g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + vis.height +")");
    vis.yAxis = vis.g.append("g")
        .attr("class", "y axis");
 
//title
vis.svg.append("text")
        .attr("class", "title")
        .attr("y", 12)
        .attr("x", 35)
        .attr("font-size", "15px")
        .attr("text-anchor", "start")
        .text("Gender ratio" );


  vis.wrangleData();
 
 }   


 BarChart.prototype.wrangleData = function(){
    var vis = this;
    
    vis.dataFiltered = States
        .filter(function(state){
            return (state.State === filterStateinMain)
                      
        })
  
    vis.updateVis();
};
        

BarChart.prototype.updateVis = function(){
    var vis = this;

 // Update scales
    vis.y.domain([0, d3.max(vis.dataFiltered, (d) => { return +d.Population; })]);

    // Update axes
    vis.xAxisCall.scale(vis.x);
    vis.xAxis.transition(vis.t()).call(vis.xAxisCall);
    vis.yAxisCall.scale(vis.y);
    vis.yAxis.transition(vis.t()).call(vis.yAxisCall);

    // JOIN new data with old elements.
    vis.rects = vis.g.selectAll("rect").data(vis.dataFiltered, function(d){
        return d.Gender;
    });

    // EXIT old elements not present in new data.
    vis.rects.exit()
        .attr("class", "exit")
        .transition(vis.t())
        .attr("height", 0)
        .attr("y", vis.height)
        .style("fill-opacity", "0.1")
        .remove();

    // UPDATE old elements present in new data.
    vis.rects.attr("class", "update")
        .transition(vis.t())
            .attr("y", function(d){ return vis.y(d.Population); })
            .attr("height", function(d){ return (vis.height - vis.y(d.Population)); })
            .attr("x", function(d){ return vis.x(d.Gender) })
            .attr("width", vis.x.bandwidth)

    // ENTER new elements present in new data.
    vis.rects.enter()
        .append("rect")
            .attr("class", "enter")
            .attr("y", function(d){ return vis.y(d.Population); })
            .attr("height", function(d){ return (vis.height - vis.y(d.Population)); })
            .attr("x", function(d){ return vis.x(d.Gender) })
            .attr("width", vis.x.bandwidth)
            .attr("fill", function(d) { return vis.barColour(d.Gender); })
      


 }


 