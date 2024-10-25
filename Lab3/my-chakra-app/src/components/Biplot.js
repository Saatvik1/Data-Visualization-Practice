import React, { useEffect } from 'react';
import * as d3 from 'd3';

const Biplot = () => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        let X_PC1 = await (await fetch('../data/X_PC1.json')).json();
        let Y_PC2 = await (await fetch('../data/Y_PC2.json')).json();
        let vectors = await (await fetch('../data/bi_plot_vector_dict.json')).json();

        console.log('X_PC1:', X_PC1);
        console.log('Y_PC2:', Y_PC2);
        console.log('Vectors:', vectors);

        d3.select('#biplot').selectAll('*').remove(); 

        drawBiplot(X_PC1, Y_PC2, vectors);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const drawBiplot = (X_PC1, Y_PC2, vectors) => {
    const width = 800;
    const height = 600;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };

    const svg = d3.select('#biplot')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([d3.min(X_PC1), d3.max(X_PC1)])
      .range([0, width - margin.left - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([d3.min(Y_PC2), d3.max(Y_PC2)])
      .range([height - margin.top - margin.bottom, 0]);

    svg.selectAll('circle')
      .data(X_PC1)
      .enter()
      .append('circle')
      .attr('cx', (d, i) => xScale(X_PC1[i]))
      .attr('cy', (d, i) => yScale(Y_PC2[i]))
      .attr('r', 3)
      .style('fill', 'blue')
      .style('opacity', 0.7);

    Object.entries(vectors).forEach(([label, [x, y]]) => {
      svg.append('line')
        .attr('x1', xScale(0))
        .attr('y1', yScale(0))
        .attr('x2', xScale(x))
        .attr('y2', yScale(y))
        .attr('stroke', 'red')
        .attr('stroke-width', 2);

      svg.append('text')
        .attr('x', xScale(x))
        .attr('y', yScale(y))
        .attr('dy', '-0.5em')
        .style('text-anchor', 'middle')
        .text(label);
    });

    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    svg.append('g')
      .call(d3.axisLeft(yScale));

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', (width - margin.left - margin.right) / 2)
      .attr('y', height - margin.bottom - 5)
      .text('PC 1 (38.54%)')
      .style('font-size', '14px')
      .style('fill', 'black');

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(${-(margin.left / 2)}, ${(height - margin.top - margin.bottom) / 2}) rotate(-90)`)
      .text('PC 2 (23.72%)')
      .style('font-size', '14px')
      .style('fill', 'black');
  };

  return (
    <div>
      <h1>Biplot</h1>
      <div id="biplot" />
    </div>
  );
};

export default Biplot;
