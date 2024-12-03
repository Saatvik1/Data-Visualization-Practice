import React, { useEffect } from 'react';
import * as d3 from 'd3';

const MDSPlot = () => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        let xData = await (await fetch('../data/data_mds_x_dim1.json')).json();
        let yData = await (await fetch('../data/data_mds_y_dim2.json')).json();

        console.log('X Data:', xData);
        console.log('Y Data:', yData);

        let mdsData = xData.map((x, index) => [x, yData[index]]); 

        d3.select('#mds-plot').selectAll('*').remove();

        drawMDS(mdsData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const drawMDS = (data) => {
    const width = 1000;
    const height = 600;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };

    const svg = d3.select('#mds-plot')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[0]), d3.max(data, d => d[0])])
      .range([0, width - margin.left - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[1]), d3.max(data, d => d[1])])
      .range([height - margin.top - margin.bottom, 0]);

    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d[0]))
      .attr('cy', d => yScale(d[1]))
      .attr('r', 4)
      .style('fill', 'blue')
      .style('opacity', 0.7);

    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    svg.append('g')
      .call(d3.axisLeft(yScale));

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', (width - margin.left - margin.right) / 2)
      .attr('y', height - margin.bottom + 0)
      .text('MDS Dimension 1')
      .style('font-size', '14px')
      .style('fill', 'black');

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(${-(margin.left / 2)}, ${(height - margin.top - margin.bottom) / 2}) rotate(-90)`)
      .text('MDS Dimension 2')
      .style('font-size', '14px')
      .style('fill', 'black');
  };

  return (
    <div>
      <h1>MDS Plot</h1>
      <div id="mds-plot" />
    </div>
  );
};

export default MDSPlot;
