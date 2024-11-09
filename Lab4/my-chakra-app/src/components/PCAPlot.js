import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';

const PCAPlot = () => {
  const [pcaData, setPcaData] = useState([]);
  const [screeData, setScreeData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let X_PC1 = await (await fetch('../data/X_PC1.json')).json();
        let Y_PC2 = await (await fetch('../data/Y_PC2.json')).json();
        let scree_exp_var = await (await fetch('../data/scree_exp_var.json')).json();
        
        let combinedData = X_PC1.map((x, i) => ({ x, y: Y_PC2[i] }));
        
        setPcaData(combinedData);
        setScreeData(scree_exp_var);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const drawPCAPlot = () => {
    const width = 500, height = 400, margin = { top: 20, right: 30, bottom: 50, left: 60 };

    const svg = d3.select('#pca-plot')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain(d3.extent(pcaData, d => d.x))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(pcaData, d => d.y))
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    svg.append('g')
      .call(d3.axisLeft(yScale));

    svg.selectAll('circle')
      .data(pcaData)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 3)
      .style('fill', 'blue');

    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', (width - margin.left - margin.right) / 2)
        .attr('y', height - margin.bottom + 80)
        .text('Princicpal Component 1')
        .style('font-size', '14px')
        .style('fill', 'black');

    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', `translate(${-(margin.left / 2)}, ${(height - margin.top - margin.bottom) / 2}) rotate(-90)`)
        .text('Princicpal Component 2')
        .style('font-size', '14px')
        .style('fill', 'black');
  };

  const drawScreePlot = () => {
    const width = 600, height = 400, margin = { top: 20, right: 30, bottom: 50, left: 70 };

    const svg = d3.select('#scree-plot')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(d3.range(screeData.length))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(screeData)])
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `PC${d + 1}`));

    svg.append('g')
      .call(d3.axisLeft(yScale));

    svg.selectAll('.bar')
      .data(screeData)
      .enter()
      .append('rect')
      .attr('x', (d, i) => xScale(i))
      .attr('y', d => yScale(d))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - yScale(d))
      .attr('fill', 'steelblue');

    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', (width - margin.left - margin.right) / 2)
        .attr('y', height - margin.bottom + 80)
        .text('Princicpal Components')
        .style('font-size', '14px')
        .style('fill', 'black');

    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', `translate(${-(margin.left / 2)}, ${(height - margin.top - margin.bottom) / 2}) rotate(-90)`)
        .text('Explained Variance')
        .style('font-size', '14px')
        .style('fill', 'black');
  };

  useEffect(() => {
      d3.select('#pca-plot').selectAll('*').remove();
      d3.select('#scree-plot').selectAll('*').remove();
      drawPCAPlot();
      drawScreePlot();
    
  }, [pcaData, screeData]);

  return (
    <div>
      <h1>PCA Plot and Scree Plot</h1>
      <div id="pca-plot" />
      <div id="scree-plot" />
    </div>
  );
};

export default PCAPlot;
