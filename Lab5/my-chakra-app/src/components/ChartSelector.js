import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';

const trackDataTypes = {
  'acousticness_%': "numerical",
  'artist(s)_name': "categorical",
  'artist_count': "numerical",
  'bpm': "numerical",
  'danceability_%': "numerical",
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

const getColor = (index) => {
  const hue = (index * 137.508) % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

const ChartSelector = () => {
  const [selectedVariable, setSelectedVariable] = useState('');
  const [dataType, setDataType] = useState('');
  const [data, setData] = useState([]);
  const [selectedBars, setSelectedBars] = useState(new Map());

  useEffect(() => {
    fetch('../data/chart_selector_data.json')
      .then(response => response.json())
      .then(fetchedData => {
        setData(fetchedData);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    if (selectedVariable) {
      setDataType(trackDataTypes[selectedVariable]);
      setSelectedBars(new Map()); 
      updateChart();
    }
  }, [selectedVariable, data]);

  useEffect(() => {
    updateChart();
  }, [selectedBars]);

  const handleBarClick = (value) => {
    setSelectedBars(prevSelected => {
      const newSelected = new Map(prevSelected);
      
      if (newSelected.has(value)) {
        newSelected.delete(value);
      }
      else {
        newSelected.set(value, getColor(newSelected.size));
      }
      
      return newSelected;
    });
  };

  const updateChart = () => {
    d3.select('#chart').selectAll('*').remove();
    if (!selectedVariable) return;
    
    if (trackDataTypes[selectedVariable] === 'numerical') {
      drawHistogram(data.map(d => d[selectedVariable]));
    } else if (trackDataTypes[selectedVariable] === 'categorical') {
      drawBarChart(data.map(d => d[selectedVariable]));
    }
  };

  const margin = { top: 50, right: 50, bottom: 70, left: 70 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const drawHistogram = (data) => {
    const svg = d3.select('#chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain(d3.extent(data))
      .nice()
      .range([0, width]);

    const histogram = d3.bin()
      .domain(x.domain())
      .thresholds(x.ticks(20));

    const bins = histogram(data);

    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .nice()
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    svg.append('g')
      .call(d3.axisLeft(y));

    svg.selectAll('.bar')
      .data(bins)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.x0))
      .attr('width', d => Math.max(0, x(d.x1) - x(d.x0) - 1))
      .attr('y', d => y(d.length))
      .attr('height', d => height - y(d.length))
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        const range = `${d.x0.toFixed(2)}-${d.x1.toFixed(2)}`;
        handleBarClick(range);
      })
      .attr('fill', (d) => {
        const range = `${d.x0.toFixed(2)}-${d.x1.toFixed(2)}`;
        return selectedBars.has(range) ? selectedBars.get(range) : '#69b3a2';
      });

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .text(selectedVariable);

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 20)
      .attr('x', -height / 2)
      .text('Frequency');
  };

  const drawBarChart = (data) => {
    const svg = d3.select('#chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const counts = d3.rollup(data, v => v.length, d => d);
    const entries = Array.from(counts, ([key, value]) => ({ key, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 20);

    const x = d3.scaleBand()
      .domain(entries.map(d => d.key))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(entries, d => d.value)])
      .nice()
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    svg.append('g')
      .call(d3.axisLeft(y));

    svg.selectAll('.bar')
      .data(entries)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.key))
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.value))
      .attr('height', d => height - y(d.value))
      .style('cursor', 'pointer')
      .on('click', (event, d) => handleBarClick(d.key))
      .attr('fill', d => selectedBars.has(d.key) ? selectedBars.get(d.key) : '#69b3a2');

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .text(selectedVariable);

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 20)
      .attr('x', -height / 2)
      .text('Count');
  };

  return (
    <div className="flex flex-col items-center w-full p-8">
      <h1 className="text-2xl font-bold mb-4">Chart Selector</h1>
      <select 
        onChange={(e) => setSelectedVariable(e.target.value)}
        className="mb-8 p-2 border rounded-md w-64"
      >
        <option value="">Select a variable</option>
        {Object.keys(trackDataTypes).map(variable => (
          <option key={variable} value={variable}>
            {variable}
          </option>
        ))}
      </select>
      <div id="chart" className="w-full flex justify-center"></div>
      
      <div className="mt-4 flex flex-wrap gap-2 max-w-2xl justify-center">
        {Array.from(selectedBars).map(([value, color]) => (
          <div 
            key={value}
            className="flex items-center gap-2 p-2 bg-gray-100 rounded"
            onClick={() => handleBarClick(value)}
            style={{ cursor: 'pointer' }}
          >
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: color }}
            />
            <span>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartSelector;