import React, { useEffect } from 'react';
import * as d3 from 'd3';

const ParallelCoordinates = () => {
  useEffect(() => {

    const fetchData = async () => {
        try {
          let response = await fetch('../data/parallel_df.json');
          let data = await response.json();

          d3.select('#parallel-coordinates').selectAll('*').remove();
  
          drawParallelCoordinates(data);
        } catch (error) {
          console.error(error);
        }
    }

    fetchData()
  
  }, []);

  const drawParallelCoordinates = (data) => {
    const margin = { top: 50, right: 30, bottom: 40, left: 100 };
    const width = 1000 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const svg = d3.select('#parallel-coordinates')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const dimensions = Object.keys(data[0]);

    const yScales = {};
    dimensions.forEach(dim => {
      yScales[dim] = d3.scaleLinear()
        .domain(d3.extent(data, d => +d[dim]))
        .range([height, 0]);
    });

    const xScale = d3.scalePoint()
      .domain(dimensions)
      .range([0, width]);

    svg.selectAll('path')
      .data(data)
      .enter()
      .append('path')
      .attr('d', d => d3.line()(dimensions.map(dim => [xScale(dim), yScales[dim](+d[dim])])))
      .style('fill', 'none')
      .style('stroke', '#69b3a2')
      .style('opacity', 0.7);

    dimensions.forEach(dim => {
      svg.append('g')
        .attr('transform', `translate(${xScale(dim)})`)
        .each(function() { d3.select(this).call(d3.axisLeft(yScales[dim])); })
        .append('text')
        .attr('y', -10)
        .attr('x', -5)
        .attr('text-anchor', 'end')
        .text(dim)
        .style('fill', 'black');
    });
  };

  return (
    <div>
      <h1>Parallel Coordinates Plot</h1>
      <div id="parallel-coordinates" />
    </div>
  );
};

export default ParallelCoordinates;
