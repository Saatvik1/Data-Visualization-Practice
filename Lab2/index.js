let data = []

// GPT generated fetchData()
function fetchData() {
    fetch('http://127.0.0.1:5000/data')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();  
      })
      .then(dat => {
        data = dat
        console.log(dat); 
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }

const variableSelect = document.getElementById('firstVarSelect');
const scatVariableSelect_one = document.getElementById('scatVarSel1');
const scatVariableSelect_two = document.getElementById('scatVarSel2');

const trackDataTypes = {
    'acousticness_%': "numerical",
    'artist(s)_name': "categorical",
    'artist_count': "numerical",
    'bpm': "numerical",
    'danceability_%' : "numerical",
    'energy_%': "numerical",
    'in_apple_charts': "numerical",
    'in_apple_playlists': "numerical",
    'in_deezer_charts': "numerical",
    'in_deezer_playlists': "numerical",
    'in_shazam_charts': "numerical",
    'in_spotify_charts': "numerical",
    'in_spotify_playlists': "numerical",
    'instrumentalness_%': "numerical",
    'key': "categorical",
    'liveness_%': "numerical",
    'mode': "categorical",
    'released_day': "numerical",
    'released_month': "numerical",
    'released_year': "numerical",
    'speechiness_%': "numerical",
    'streams': "numerical",
    'track_name': "categorical",
    'valence_%': "numerical"
};

function populateDropdown() {

    for (const variable in trackDataTypes) {
        const option = document.createElement('option');
        option.value = variable; 
        option.textContent = variable; 
        variableSelect.appendChild(option);
        // scatVariableSelect_one.appendChild(option); 
        // scatVariableSelect_two.appendChild(option);  
    }
    for (const variable in trackDataTypes) {
        const option = document.createElement('option');
        option.value = variable; 
        option.textContent = variable; 
        // variableSelect.appendChild(option);
        scatVariableSelect_one.appendChild(option); 
        // scatVariableSelect_two.appendChild(option);  
    }
    for (const variable in trackDataTypes) {
        const option = document.createElement('option');
        option.value = variable; 
        option.textContent = variable; 
        // variableSelect.appendChild(option);
        // scatVariableSelect_one.appendChild(option); 
        scatVariableSelect_two.appendChild(option);  
    }
}



async function catTopFive(arr) {
    const counts = {};
    arr.forEach(value => {
        counts[value] = (counts[value] || 0) + 1;
    });

    try {
        const response = await fetch('http://127.0.0.1:5000/topfive', {
            // mode : 'no-cors',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(counts)  
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const result = await response.json(); 
        console.log(result);  
        return result;  
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }




    return counts
}

function getTopCategories(values, limit = 5) {
    let frequencyMap = {};
    values.forEach(v => frequencyMap[v] = (frequencyMap[v] || 0) + 1);

    return Object.entries(frequencyMap)
        .sort((a, b) => b[1] - a[1]) 
        .slice(0, limit)              
        .map(entry => entry[0]);  
}

// scatVariableSelect_one.appendChild(option); 
// scatVariableSelect_two.appendChild(option);  
async function generateScatterPlot() {
    const x_axis = document.getElementById("scatVarSel1").value;
    const y_axis = document.getElementById("scatVarSel2").value;

    const x_type = trackDataTypes[x_axis];
    const y_type = trackDataTypes[y_axis];

    

    let x_values, y_values, topXCategories, topYCategories;

    if (x_type === "numerical") {
        x_values = data.map(d => +d[x_axis]); 
    } else {
        x_values = data.map(d => d[x_axis]); 
        topXCategories = getTopCategories(x_values); 
        data = data.filter(d => topXCategories.includes(d[x_axis]));
        x_values = data.map(d => d[x_axis]); 
    }

    if (y_type === "numerical") {
        y_values = data.map(d => +d[y_axis]);
        y_values = data.map(d => d[y_axis]); 
        topYCategories = getTopCategories(y_values); 
        data = data.filter(d => topYCategories.includes(d[y_axis]));
        y_values = data.map(d => d[y_axis]);
    }

    // Template of scatter plot is from https://d3-graph-gallery.com/graph/scatter_basic.html

    var margin = { top: 50, right: 30, bottom: 30, left: 60 },
        width = 560 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    d3.select("#scatterPlot").selectAll("*").remove();

    var svg = d3.select("#scatterPlot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let x, y;

    if (x_type === "numerical") {
        x = d3.scaleLinear()
            .domain([d3.min(x_values), d3.max(x_values)])
            .range([0, width]);
    } else {
        x = d3.scalePoint()
            .domain(topXCategories) 
            .range([0, width])
            .padding(0.5);
    }

    if (y_type === "numerical") {
        y = d3.scaleLinear()
            .domain([d3.min(y_values), d3.max(y_values)])
            .range([height, 0]);
    } else {
        y = d3.scalePoint()
            .domain(topYCategories) 
            .range([height, 0])
            .padding(0.5);
    }

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d, i) {
            return x(x_values[i]);
        })
        .attr("cy", function (d, i) {
            return y(y_values[i]);
        })
        .attr("r", 4)
        .style("fill", "#69b3a2");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text(x_axis);

    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("font-size", "12px")
        .text(y_axis);

    svg.append("text")
        .attr("x", width / 2) 
        .attr("y", -margin.top / 2) 
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text(`Scatter Plot of ${y_axis} vs. ${x_axis}`);
    }




document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    populateDropdown();
    generateScatterPlot();
});




// Create a single dropdown for all the variables, (create a dict that records if variable is categorial or numerical)
// When drop down is selected, then depending on variable type create a bar chart or histogram, if categorical also create a pie chart 

//below these charts and such, create a scatter plot outline with radio buttons for all the variables


document.addEventListener('change', async () => {
    let oldGroups = document.querySelectorAll('g');
    oldGroups.forEach(group => group.remove());
    oldGroups = document.querySelectorAll('text');
    oldGroups.forEach(group => group.remove());      
    console.log("Drop down changed")
    const selectedVar = variableSelect.value;
    const variableType = trackDataTypes[selectedVar];
    console.log(variableType)


    //Histogram, Bar, pie chart templates were taken from https://d3-graph-gallery.com/index.html
    //But they were changed with certain attributes...





    if (variableType == "numerical") {
        
        let tempVarVal = []
        tempVarVal = data.map(d => +d[selectedVar])

        console.log(tempVarVal)

        var margin = {top: 80, right: 30, bottom: 30, left: 40},
        width = 560 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

        var svg = d3.select("#histogramChart")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var x = d3.scaleLinear()
        .domain([d3.min(tempVarVal), d3.max(tempVarVal)])  // Dynamically set the domain based on data
        .range([0, width]);

        console.log([d3.min(tempVarVal), d3.max(tempVarVal)])

        svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

        var histogram = d3.histogram()
        .domain(x.domain())  
        .thresholds(x.ticks(70)); 

        var bins = histogram(tempVarVal);

        var y = d3.scaleLinear()
        .domain([0, d3.max(bins, function(d) { return d.length; })])  
        .range([height, 0]);

        svg.append("g")
        .call(d3.axisLeft(y));

        svg.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
            .attr("x", function(d) { return x(d.x0); }) 
            .attr("transform", function(d) { return "translate(0," + y(d.length) + ")"; })
            .attr("width", function(d) { return Math.max(0, x(d.x1) - x(d.x0) - 1); })  
            .attr("height", function(d) { return height - y(d.length); })  
            .style("fill", "#69b3a2");

        svg.append("text")
        .attr("x", width / 2) 
        .attr("y", -10) 
        .attr("text-anchor", "middle") 
        .style("font-size", "16px") 
        .text("Histogram Chart of " + selectedVar); 


    } else if (variableType == "categorical"){
        // Make bar chart and pie chart 
        // Generate arrray of values by the selectedVar from the data array (each element is a row in this array)
        let tempVarVal = []
        console.log(data)
        tempVarVal = data.map(d => d[selectedVar])
        tempVarVal = await catTopFive(tempVarVal)
        console.log(tempVarVal)

        const entries = Object.entries(tempVarVal).map(([key, value]) => ({ key, value }));

        const pie = d3.pie().value(d => d.value);
        const pieData = pie(entries);

        console.log(entries)

        

    
        let svg = d3.select("#pieChart")
            .attr("width", 800)
            .attr("height", 800)
            .append("g")
            .attr("transform", `translate(${800 / 2}, ${800 / 2})`);

        svg.selectAll('.label').remove();
        svg.selectAll('.label-line').remove();
        svg.selectAll('.slice').remove();
        svg.selectAll('.g').remove();
        
        const arc = d3.arc().innerRadius(0).outerRadius(100);
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const slices = svg.selectAll(".slice")
            .data(pie(entries))
            .enter().append("g")
            .attr("class", "slice");

        slices.append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => color(i));

        slices.each(function(d) {
        
        const [x, y] = arc.centroid(d); 
        const labelX = x * 6; 
        const labelY = y * 3; 

        d3.select(this)
            .append("line")
            .attr("x1", x) 
            .attr("y1", y)
            .attr("x2", labelX) 
            .attr("y2", labelY)
            .attr("stroke", "black");

        d3.select(this)
            .append("text")
            .attr("transform", `translate(${labelX}, ${labelY})`) 
            .attr("dy", "0.35em") 
            .text(d.data.key) 
            .attr("text-anchor", "middle"); 

            d3.select(this)
            .append("text")
            .attr("x", 0) 
            .attr("y", 200) 
            .attr("text-anchor", "middle") 
            .style("font-size", "16px") 
            .text("Pie Chart of " + selectedVar); 
        });

        


        // Now generate bar chart 

        var margin = { top: 30, right: 30, bottom: 70, left: 60 },
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

        svg = d3.select("#barChart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var x = d3.scaleBand()
        .range([0, width])
        .domain(entries.map(entry => entry.key))  
        .padding(0.2);
        svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

        var y = d3.scaleLinear()
        .domain([0, d3.max(entries, d => d.value)])  
        .range([height, 0]);
        svg.append("g")
        .call(d3.axisLeft(y));

        svg.selectAll("mybar")
        .data(entries)  
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.key); })  
        .attr("y", function(d) { return y(d.value); })  
        .attr("width", x.bandwidth())  
        .attr("height", function(d) { return height - y(d.value); })  
        .attr("fill", "#69b3a2");

        svg.append("text")
            .attr("x", width / 2) 
            .attr("y", -10) 
            .attr("text-anchor", "middle") 
            .style("font-size", "16px") 
            .text("Bar Chart of " + selectedVar); 

        svg.append("text")
            .attr("x", width / 2) 
            .attr("y", height + 40) 
            .attr("text-anchor", "middle") 
            .style("font-size", "12px") 
            .text(selectedVar); 

        svg.append("text")
            .attr("transform", "rotate(-90)") 
            .attr("y", -40) 
            .attr("x", -height / 2) 
            .attr("text-anchor", "middle") 
            .style("font-size", "12px") 
            .text("Count");
            }

            generateScatterPlot()
})











document.getElementById('main_submit').addEventListener('click', function() {
    var inputText = document.getElementById('main_input').value;

    // Get rid of white spaces, then count the length. 
    const non_ws_c = inputText.trim().length

    //get a count of each character
    const count_char = {}
    for(let chara of inputText){
        if (count_char[chara]){
            count_char[chara]++;
        } else {
            count_char[chara] = 1
        }
    }

    var count_char_result = "";
    for(let chara in count_char){
        count_char_result += `${chara} : ${count_char[chara]}\n` 
    }

    //Count words and spaces 
    const num_words = inputText.trim().split(/\s+/).length;
    const num_spaces = (inputText.match(/ /g) || []).length;

    // Detecting repeated characters 
    const error_spell = [];
    let seq = '';
    let prevchar = '';
    let count = 0;

    for(let char of inputText){
        if(char === prevchar){
            count++;
            seq+=char;
        } else {
            if(count > 2){
                error_spell.push(seq);
            }

            seq = char;
            count = 1;
        }
        prevchar = char;
    }

    if(count > 2){
        error_spell.push(seq)
    }

    var spell_message = "";
    if (error_spell.length > 0){
        spell_message = "There are spelling errors: \n";
        error_spell.forEach(seq => {
            spell_message += `error: "${seq}" \n`
        });
    } else {
        spell_message = "There are NO spelling errors: \n";
    }




    output_text = `Non-whitespace characters: ${non_ws_c} \n Count of each character: ${count_char_result} \n Count of words: ${num_words} \n Count of spaces: ${num_spaces} \n Repeated Characters: ${spell_message}`
    document.getElementById('output').textContent = output_text;

    console.log("Input text: " + inputText);
    console.log(output_text)
});

