import React, { useEffect } from 'react';
import * as d3 from 'd3';

const MDSAttributes = () => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        let response = await fetch('../data/attr_mds_dict.json');
        let attributeData = await response.json();

        console.log('Attribute Data:', attributeData);

        let mdsData = Object.entries(attributeData).map(([label, coordinates]) => ({
          label,
          x: coordinates[0],
          y: coordinates[1],
        }));

        d3.select('#mds-attributes-plot').selectAll('*').remove();

        drawMDSAttributes(mdsData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const drawMDSAttributes = (data) => {
    const width = 1000;
    const height = 600;
    const margin = { top: 50, right: 50, bottom: 70, left: 80 };

    const svg = d3.select('#mds-attributes-plot')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.x), d3.max(data, d => d.x)])
      .range([0, width - margin.left - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.y), d3.max(data, d => d.y)])
      .range([height - margin.top - margin.bottom, 0]);

    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 5)
      .style('fill', 'blue')
      .style('opacity', 0.7);

    svg.selectAll('text')
      .data(data)
      .enter()
      .append('text')
      .attr('x', d => xScale(d.x) + 10) 
      .attr('y', d => yScale(d.y) + 5)
      .text(d => d.label)
      .style('font-size', '12px')
      .style('fill', 'black');

    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    svg.append('g')
      .call(d3.axisLeft(yScale));

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', (width - margin.left - margin.right) / 2)
      .attr('y', height - margin.bottom + 20)
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
      <h1>MDS Attributes Plot</h1>
      <div id="mds-attributes-plot" />
    </div>
  );
};

export default MDSAttributes;
