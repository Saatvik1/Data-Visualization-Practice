import React, { useEffect } from 'react';
import * as d3 from 'd3';

const ScatterPlotMatrix = () => {
  useEffect(() => {

    const fetchData = async () => {
        try {
          const response = await fetch('../data/scatter_df.json');
          const data = await response.json();
          
          const correlationArray = data.map(item =>
            Object.values(item)
          );

          d3.select('#scatterplot-matrix').selectAll('*').remove();
  
          drawScatterPlotMatrix(correlationArray);
        } catch (error) {
          console.error('Error fetching the data:', error);
        }
    }

    fetchData()
  
  }, []);

  const drawScatterPlotMatrix = (data) => {
    // List of variables
    const variables = Object.keys(data[0]).filter(key => key !== 'categoricalVariable'); // Exclude categorical variable
    const size = 200; // Size of each scatter plot
    const padding = 70;
    const n = variables.length;

    // Set up the SVG canvas
    const svg = d3.select('#scatterplot-matrix')
      .append('svg')
      .attr('width', size * n + padding)
      .attr('height', size * n + padding)
      .append('g')
      .attr('transform', `translate(${padding},${padding})`);

    // Create scales for each variable
    const scales = {};
    variables.forEach(variable => {
      scales[variable] = d3.scaleLinear()
        .domain(d3.extent(data, d => d[variable]))
        .range([padding / 2, size - padding / 2]);
    });

    // Color scale for categorical variable
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Loop through all combinations of variables for creating scatter plots
    variables.forEach((xVar, i) => {
      variables.forEach((yVar, j) => {
        const cell = svg.append('g')
          .attr('transform', `translate(${i * size},${j * size})`);

        // Add X-axis
        cell.append('g')
          .attr('transform', `translate(0,${size - padding / 2})`)
          .call(d3.axisBottom(scales[xVar]).ticks(3));

        // Add Y-axis
        cell.append('g')
          .attr('transform', `translate(${padding / 2},0)`)
          .call(d3.axisLeft(scales[yVar]).ticks(3));

        // Add scatter points
        cell.selectAll('circle')
          .data(data)
          .enter()
          .append('circle')
          .attr('cx', d => scales[xVar](d[xVar]))
          .attr('cy', d => scales[yVar](d[yVar]))
          .attr('r', 3)
          .style('fill', d => color(d.categoricalVariable)) // Color by categorical variable
          .style('opacity', 0.7);
      });
    });

    // Add variable names to the diagonal (row = column)
    svg.selectAll('.label')
      .data(variables)
      .enter()
      .append('text')
      .attr('x', (d, i) => i * size + padding)
      .attr('y', (d, i) => i * size + padding / 2)
      .text(d => d)
      .style('font-weight', 'bold');
  };


  return (
    <div>
      <h1>Scatter Plot Matrix</h1>
      <div id="scatterplot-matrix" />
    </div>
  );
};

export default ScatterPlotMatrix;
