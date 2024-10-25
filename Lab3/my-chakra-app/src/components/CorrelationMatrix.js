import React, { useEffect } from 'react';
import * as d3 from 'd3';

const CorrelationMatrix = () => {
  useEffect(() => {

    const fetchData = async () => {
        try {
          let response = await fetch('../data/corr_df.json');
          let data = await response.json();

          console.log(data)
          
          let correlationArray = data.map(item =>
            Object.values(item)
          );

          let correlationFeatureArray = Object.keys(data[0]); 

          console.log(correlationFeatureArray)

          d3.select('#correlation-matrix').selectAll('*').remove();
  
          drawCorrelationMatrix(correlationArray, correlationFeatureArray);
          
        } catch (error) {
          console.error(error);
        }
    }

    fetchData()
  
  }, []);

  const drawCorrelationMatrix = (data, features) => {
    console.log(data)
    const margin = { top: 60, right: 40, bottom: 50, left: 120 };
    const width = 1000 - margin.left - margin.right;
    const height = 1000 - margin.top - margin.bottom;

    const svg = d3.select('#correlation-matrix')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const colorScale = d3.scaleLinear()
      .domain([-1, 0, 1]) 
      .range(['red', 'white', 'blue']);
    
    const cellSize = width / data.length;

    svg.selectAll()
      .data(data)
      .enter()
      .selectAll()
      .data((d, i) => data.map((_, j) => ({ value: d[j], row: i, col: j })))
      .enter()
      .append('rect')
      .attr('x', d => d.col * cellSize)
      .attr('y', d => d.row * cellSize)
      .attr('width', cellSize)
      .attr('height', cellSize)
      .style('fill', d => colorScale(d.value))
      .style('stroke', 'white');

    svg.selectAll('.col-label')
      .data(features)
      .enter()
      .append('text')
      .attr('x', (d, i) => (i + 0.5) * cellSize)
      .attr('y', -10)
      .attr('dy', '.35em')
      .text(d => d)
      .style('text-anchor', 'middle')
      .style('font-size', '12px');

    svg.selectAll('.row-label')
      .data(features)
      .enter()
      .append('text')
      .attr('x', -10)
      .attr('y', (d, i) => (i + 0.5) * cellSize)
      .attr('dy', '.35em')
      .text(d => d)
      .style('text-anchor', 'end')
      .style('font-size', '12px');

    svg.selectAll('.cell-text')
      .data(data.flat()) 
      .enter()
      .append('text')
      .attr('x', (d, i) => (i % data.length + 0.5) * cellSize) 
      .attr('y', (d, i) => (Math.floor(i / data.length) + 0.5) * cellSize) 
      .attr('dy', '.35em') 
      .style('text-anchor', 'middle') 
      .style('fill', 'black') 
      .text(d => d.toFixed(2));
  };

  return (
    <div>
      <h1>Correlation Matrix</h1>
      <div id="correlation-matrix" />
    </div>
  );
};

export default CorrelationMatrix;
