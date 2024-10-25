import React, { useEffect } from 'react';
import * as d3 from 'd3';

const ScatterPlotMatrix = () => {
  useEffect(() => {

    const fetchData = async () => {
        try {
          let response = await fetch('../data/scatter_df.json');
          let data = await response.json();
          
          let correlationArray = data.map(item =>
            Object.values(item)
          );

          d3.select('#scatterplot-matrix').selectAll('*').remove();
  
          drawScatterPlotMatrix(correlationArray);
        } catch (error) {
          console.error(error);
        }
    }

    fetchData()
  
  }, []);

  const drawScatterPlotMatrix = (data) => {
    const variables = Object.keys(data[0]);
    const size = 200; 
    const padding = 70;
    const n = variables.length;

    const svg = d3.select('#scatterplot-matrix')
      .append('svg')
      .attr('width', size * n + padding)
      .attr('height', size * n + padding)
      .append('g')
      .attr('transform', `translate(${padding},${padding})`);

    const scales = {};
    variables.forEach(variable => {
      scales[variable] = d3.scaleLinear()
        .domain(d3.extent(data, d => d[variable]))
        .range([padding / 2, size - padding / 2]);
    });

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    variables.forEach((xVar, i) => {
      variables.forEach((yVar, j) => {
        const cell = svg.append('g')
          .attr('transform', `translate(${i * size},${j * size})`);

        cell.append('g')
          .attr('transform', `translate(0,${size - padding / 2})`)
          .call(d3.axisBottom(scales[xVar]).ticks(3));

        cell.append('g')
          .attr('transform', `translate(${padding / 2},0)`)
          .call(d3.axisLeft(scales[yVar]).ticks(3));

        cell.selectAll('circle')
          .data(data)
          .enter()
          .append('circle')
          .attr('cx', d => scales[xVar](d[xVar]))
          .attr('cy', d => scales[yVar](d[yVar]))
          .attr('r', 3)
          .style('fill', d => color(d.categoricalVariable))
          .style('opacity', 0.7);
      });
    });

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
