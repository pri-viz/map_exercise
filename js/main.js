/*
*    main.js
*    This file loads the data and also calls Barchar.js when clicked on State 
*    Data used : data from US Census 2016 in the /data folder 
*    I have used event listeners for interaction (not crossfilter)
*/


/************* DEFINING STATIC VALUES***********************/

//global variables 
var genderBar;
var filterStateinMain;

//Width and height of map
var width = 660;
    height = 500;
    lowColor = '#ccf2ff'
    highColor = '#004d66'


var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

//Define map projection
var projection = d3.geoAlbersUsa()
                   .translate([width/2, height/2])
                   .scale([900]);

//Define path generatorn for Map
var path = d3.geoPath()
             .projection(projection);


//Create SVG element for Map in the corresponding div for map
var svg = d3.select("#map-area")
            .append("svg")
            .attr("width", width)
            .attr("height", height); 


/**************************** DATA LOAD & CLEAN ***********************************************/
d3.queue()
    .defer(d3.csv, "data/census_2016.csv")
    .defer(d3.json, "data/usstate.json")
    .await(ready);

function ready(error, censusDataraw, json){

var censusData = d3.nest()
  .key(function(d) { return d.State;})
  .rollup(function(d) { 
   return d3.sum(d, function(g) {return g.Population; });
  }).entries(censusDataraw);


var dataArrayTot = []; //array to calc max,min total values for colour scale 
for (var d = 0; d < censusData.length; d++) {
             dataArrayTot.push(parseFloat(censusData[d].value)); 
                }
States = censusDataraw;

//Merge census data and GeoJSON
  //Loop through each State data value
  for (var i = 0; i < censusData.length; i++) {
           var dataState = censusData[i].key; //Grab state name 
           var dataValue = censusData[i].value; //assign Total to dataValue
          //Find the corresponding state inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {
                var jsonState = json.features[j].properties.name;
                if (dataState == jsonState) {
                //Copy the data value into the JSON
                json.features[j].properties.value = dataValue;
                //Stop looking through the JSON
                break;
              }
            }   
          }

/**************************** CROSSFILTER ***********************************************/  
    //Create a Crossfilter instance
 /* var censusDataCF = crossfilter(censusData);

  //Define Dimensions
  var stateDim = censusDataCF.dimension(function(d) { return d.State; });
 

  //Calculate metrics
  var totalPopulationByState = stateDim.group().reduceSum(function(d) {
    return d.Total;
  });

 // var max_state = totalPopulationByState.top(1)[0].value; */


 /**************************** DRAW MAP ***********************************************/ 

         var ifBar = document.getElementsByTagName("rect");
  

      //assigning min and max Total values to colour scale
      var minVal = d3.min(dataArrayTot)
      var maxVal = d3.max(dataArrayTot)
      var colour = d3.scaleLinear().domain([minVal,maxVal]).range([lowColor,highColor]) 

      // Bind the data to the SVG and create one path per GeoJSON feature
      svg.selectAll("path")
         .data(json.features)
         .enter()
         .append("path")
         .attr("d", path)
         .style("stroke", "#000000")
         .style("stroke-width", "0.3")
        //.style("fill", function(d) { return colour(d.properties.value) });
         .style("fill", function(d) {
            //Get data value
            var value = d.properties.value; 
              if (value) {
                //If value exists…
                     return colour(value);
                       } else {
                  //If value is undefined…
                  return "#ccc";
                        } 
                    })
             //adding tooltip
             .on("mouseover", function(d) {
                        div.transition()
                       .duration(200)
                       .style("opacity", .9);
                       div.html(d.properties.name + "<br/>" +" Population: "+d.properties.value)
                       .style("left", (d3.event.pageX) + "px")
                      .style("top", (d3.event.pageY - 28) + "px");
                      })
             .on("mouseout", function(d) {
                       div.transition()
                       .duration(500)
                       .style("opacity", 0)
                                   })
              .on("click",barUpdate) ;


  //title
svg.append("text")
        .attr("class", "title")
        .attr("y", 15)
        .attr("x", 40)
        .attr("font-size", "15px")
        .attr("text-anchor", "start")
        .text("Population by State");   
  

 /**************************** ADDING LEGEND ***********************************************/ 

    // adding legend
      var w = 300, h = 60;

      var key = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr("class", "legend");

      var legend = key.append("defs")
        .append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("x1", "100%")
        .attr("y1", "100%")
        .attr("x2", "0%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad");

      legend.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", highColor)
        .attr("stop-opacity", 1);
        
      legend.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", lowColor)
        .attr("stop-opacity", 1);

      key.append("rect")
        .attr("width", w)
        .attr("height", h)
        .style("fill", "url(#gradient)")
        .attr("transform", "translate(0,10)");

      var y = d3.scaleLinear()
        .range([0, w])
        .domain([minVal, maxVal]);

      var yAxis = d3.axisBottom(y);
       
      formatValue = d3.format(".2s");
      key.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(2,10)")
        .call(yAxis.tickFormat(function(d) {return formatValue(d);})); 

 /**************************** barUpdate FUNCTION FROM MAP ONCLICK EVENT ***********************************************/ 

function barUpdate(value)
{ 
 
filterStateinMain = value.properties.name;

//if bar chart already exits in DOM, calling only wrangle data instead of initialising bar again

if (ifBar.length <= 1) {console.log("inside click if"); genderBar = new BarChart("#barchart-area",value.properties.name);}
else {console.log("inside click else"); genderBar.wrangleData();}
 
}

}


