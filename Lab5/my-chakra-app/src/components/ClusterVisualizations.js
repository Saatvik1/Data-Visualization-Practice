import React, { useEffect, useState } from 'react';
import { Card, Spin } from 'antd';
import * as d3 from 'd3';

const ClusterVisualizations = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clusterColors] = useState([
    'blue',
    'orange', 
    'green',
    'red',
    'purple'
  ]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [X_PC1, Y_PC2, vectors, kmeansLabels, mdsX, mdsY, parallelData] = await Promise.all([
          fetch('../data/X_PC1.json').then(res => res.json()),
          fetch('../data/Y_PC2.json').then(res => res.json()),
          fetch('../data/bi_plot_vector_dict.json').then(res => res.json()),
          fetch('../data/kmeanslabel.json').then(res => res.json()),
          fetch('../data/data_mds_x_dim1.json').then(res => res.json()),
          fetch('../data/data_mds_y_dim2.json').then(res => res.json()),
          fetch('../data/parallel_df.json').then(res => res.json())
        ]);

        const cleanParallelData = parallelData.map(row => {
          const cleanRow = {};
          Object.entries(row).forEach(([key, value]) => {
            cleanRow[key] = typeof value === 'string' ? parseFloat(value) : value;
          });
          return cleanRow;
        });

        setData({ 
          X_PC1, 
          Y_PC2, 
          vectors, 
          kmeansLabels, 
          mdsX, 
          mdsY, 
          parallelData: cleanParallelData 
        });
        setLoading(false);
      } catch (err) {
        setError('Error loading data');
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const getPointColor = (index) => {
    if (!data?.kmeansLabels) return '#ccc';
    const clusterIndex = data.kmeansLabels[index];
    //console.log(clusterIndex % clusterColors.length)
    //return clusterColors[clusterIndex % clusterColors.length];
    //console.log(clusterIndex.cluster)
    //console.log(data.kmeansLabels[clusterIndex])
    return clusterColors[clusterIndex.cluster-1]
  };

  const drawBiplot = () => {
    const width = 600;
    const height = 400;
    const margin = { top: 20, right: 100, bottom: 40, left: 40 };

    d3.select('#biplot').selectAll('*').remove();

    const svg = d3.select('#biplot')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([d3.min(data.X_PC1), d3.max(data.X_PC1)])
      .range([0, width - margin.left - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([d3.min(data.Y_PC2), d3.max(data.Y_PC2)])
      .range([height - margin.top - margin.bottom, 0]);

    svg.selectAll('circle')
      .data(data.X_PC1)
      .enter()
      .append('circle')
      .attr('cx', (d, i) => xScale(data.X_PC1[i]))
      .attr('cy', (d, i) => yScale(data.Y_PC2[i]))
      .attr('r', 3)
      .style('fill', (d, i) => getPointColor(i))
      //.style('fill', (d, i) => 'blue')
      .style('opacity', 0.6);

    Object.entries(data.vectors).forEach(([feature, [x, y]]) => {
        const vectorLength = Math.sqrt(x * x + y * y);
        const scaleFactor = 0.4; 
        const scaledX = x / vectorLength * scaleFactor * (xScale.domain()[1] - xScale.domain()[0]);
        const scaledY = y / vectorLength * scaleFactor * (yScale.domain()[1] - yScale.domain()[0]);
      
        svg.append('line')
          .attr('x1', xScale(0))
          .attr('y1', yScale(0))
          .attr('x2', xScale(scaledX))
          .attr('y2', yScale(scaledY))
          .attr('stroke', 'red')
          .attr('stroke-width', 1);
      
        
        svg.append('text')
          .attr('x', xScale(scaledX) + 5) 
          .attr('y', yScale(scaledY) - 5) 
          .attr('text-anchor', 'middle')
          .style('font-size', '10px')
          .style('fill', 'black')
          .text(feature);
      });
      

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(5));

    svg.append('g')
      .call(d3.axisLeft(yScale).ticks(5));

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', (width - margin.left - margin.right) / 2)
      .attr('y', height - margin.bottom + 10)
      .text('PC1');

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', `rotate(-90) translate(${-(height - margin.top - margin.bottom) / 2},${-margin.left + 20})`)
      .text('PC2');

    const legend = svg.append('g')
      .attr('transform', `translate(${width - margin.right - 20}, 0)`);

    clusterColors.forEach((color, i) => {
      legend.append('circle')
        .attr('cx', 0)
        .attr('cy', i * 20)
        .attr('r', 6)
        .style('fill', color);

      legend.append('text')
        .attr('x', 15)
        .attr('y', i * 20 + 4)
        .text(`Cluster ${i + 1}`)
        .style('font-size', '12px');
    });
  };

  const drawMDS = () => {
    const width = 600;
    const height = 400;
    const margin = { top: 20, right: 100, bottom: 40, left: 40 };

    d3.select('#mds-plot').selectAll('*').remove();

    const svg = d3.select('#mds-plot')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([d3.min(data.mdsX), d3.max(data.mdsX)])
      .range([0, width - margin.left - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([d3.min(data.mdsY), d3.max(data.mdsY)])
      .range([height - margin.top - margin.bottom, 0]);

    svg.selectAll('circle')
      .data(data.mdsX)
      .enter()
      .append('circle')
      .attr('cx', (d, i) => xScale(data.mdsX[i]))
      .attr('cy', (d, i) => yScale(data.mdsY[i]))
      .attr('r', 3)
      .style('fill', (d, i) => getPointColor(i))
      .style('opacity', 0.6);

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(5));

    svg.append('g')
      .call(d3.axisLeft(yScale).ticks(5));

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', (width - margin.left - margin.right) / 2)
      .attr('y', height - margin.bottom + 30)
      .text('MDS Dimension 1');

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', `rotate(-90) translate(${-(height - margin.top - margin.bottom) / 2},${-margin.left + 20})`)
      .text('MDS Dimension 2');

    const legend = svg.append('g')
      .attr('transform', `translate(${width - margin.right - 20}, 0)`);

    clusterColors.forEach((color, i) => {
      legend.append('circle')
        .attr('cx', 0)
        .attr('cy', i * 20)
        .attr('r', 6)
        .style('fill', color);

      legend.append('text')
        .attr('x', 15)
        .attr('y', i * 20 + 4)
        .text(`Cluster ${i + 1}`)
        .style('font-size', '12px');
    });
  };

  const drawParallelCoordinates = () => {
    const width = 800;
    const height = 400;
    const margin = { top: 30, right: 100, bottom: 30, left: 50 };

    d3.select('#parallel-coordinates').selectAll('*').remove();

    const svg = d3.select('#parallel-coordinates')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const dimensions = Object.keys(data.parallelData[0]);

    const y = {};
    dimensions.forEach(dim => {
      const values = data.parallelData.map(d => d[dim]);
      y[dim] = d3.scaleLinear()
        .domain(d3.extent(values))
        .range([height - margin.top - margin.bottom, 0]);
    });

    const x = d3.scalePoint()
      .range([0, width - margin.left - margin.right])
      .padding(0.1)
      .domain(dimensions);

    const lines = svg.selectAll('.parallel-line')
      .data(data.parallelData)
      .enter()
      .append('path')
      .attr('class', 'parallel-line')
      .attr('d', (d, i) => {
        return d3.line()(dimensions.map(p => [x(p), y[p](d[p])]));
      })
      .style('fill', 'none')
      .style('stroke', (d, i) => getPointColor(i))
      .style('opacity', 0.6);

    dimensions.forEach(dim => {
      svg.append('g')
        .attr('transform', `translate(${x(dim)},0)`)
        .call(d3.axisLeft(y[dim]))
        .append('text')
        .style('text-anchor', 'middle')
        .attr('y', -9)
        .text(dim)
        .style('fill', 'black');
    });

    const legend = svg.append('g')
      .attr('transform', `translate(${width - margin.right - 20}, 0)`);

    clusterColors.forEach((color, i) => {
      legend.append('circle')
        .attr('cx', 0)
        .attr('cy', i * 20)
        .attr('r', 6)
        .style('fill', color);

      legend.append('text')
        .attr('x', 15)
        .attr('y', i * 20 + 4)
        .text(`Cluster ${i + 1}`)
        .style('font-size', '12px');
    });
  };

  useEffect(() => {
    if (data) {
      drawBiplot();
      drawMDS();
      drawParallelCoordinates();
    }
  }, [data]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        <Card title="Biplot" style={{ width: 650 }}>
          <div id="biplot" />
        </Card>

        <Card title="MDS Plot" style={{ width: 650 }}>
          <div id="mds-plot" />
        </Card>

        <Card title="Parallel Coordinates" style={{ width: 850 }}>
          <div id="parallel-coordinates" />
        </Card>
      </div>
    </div>
  );
};

export default ClusterVisualizations;