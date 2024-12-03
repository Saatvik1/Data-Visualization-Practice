import React, { useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Select, Card } from 'antd';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [selectedVariable, setSelectedVariable] = useState(null);
  const [colorMap, setColorMap] = useState(new Map());
  const [selectedBars, setSelectedBars] = useState(new Set());
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [X_PC1, Y_PC2, vectors, rawData, mdsX, mdsY, parallelData] = await Promise.all([
          fetch('../data/X_PC1.json').then(res => res.json()),
          fetch('../data/Y_PC2.json').then(res => res.json()),
          fetch('../data/bi_plot_vector_dict.json').then(res => res.json()),
          fetch('../data/chart_selector_data.json').then(res => res.json()),
          fetch('../data/data_mds_x_dim1.json').then(res => res.json()),
          fetch('../data/data_mds_y_dim2.json').then(res => res.json()),
          fetch('../data/parallel_df.json').then(res => res.json())
        ]);

        setData({ X_PC1, Y_PC2, vectors, rawData, mdsX, mdsY, parallelData });
      } catch (error) {
        setError('Error loading data');
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const variables = useMemo(() => {
    if (!data?.rawData) return [];
    return Object.keys(data.rawData[0]);
  }, [data]);

  const barChartData = useMemo(() => {
    if (!data?.rawData || !selectedVariable) return [];
    const values = data.rawData.map(d => d[selectedVariable]);
    
    const isNumeric = values.every(v => !isNaN(v));
    
    if (isNumeric) {
      const histogram = d3.histogram()
        .domain(d3.extent(values))
        .thresholds(10);
      
      return histogram(values).map(bin => ({
        x0: bin.x0,
        x1: bin.x1,
        count: bin.length,
        label: `${bin.x0.toFixed(2)} - ${bin.x1.toFixed(2)}`
      }));
    } else {
      const counts = d3.rollup(values, v => v.length, d => d);
      return Array.from(counts, ([key, value]) => ({
        label: key,
        count: value
      }));
    }
  }, [data, selectedVariable]);

  const getColorForBar = (label) => {
    if (!selectedBars.has(label)) return '#ccc';
    if (!colorMap.has(label)) {
      const newColor = d3.schemeCategory10[colorMap.size % d3.schemeCategory10.length];
      setColorMap(new Map(colorMap.set(label, newColor)));
      return newColor;
    }
    return colorMap.get(label);
  };

  const getPointColor = (index, value) => {
    if (!selectedVariable || selectedBars.size === 0) return '#69b3a2';
    const barLabel = typeof value === 'number'
      ? barChartData.find(bin => value >= bin.x0 && value < bin.x1)?.label
      : value;
    return getColorForBar(barLabel);
  };

  const handleBarSelect = (label) => {
    const newSelectedBars = new Set(selectedBars);
    if (selectedBars.has(label)) {
      newSelectedBars.delete(label);
      const newColorMap = new Map(colorMap);
      newColorMap.delete(label);
      setColorMap(newColorMap);
    } else {
      newSelectedBars.add(label);
    }
    setSelectedBars(newSelectedBars);
  };

  const drawBarChart = () => {
    const width = 600;
    const height = 350;
    const margin = { top: 0, right: 0, bottom: 40, left: 40 };

    d3.select('#barchart').selectAll('*').remove();

    const svg = d3.select('#barchart')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .range([0, width - margin.left - margin.right])
      .domain(barChartData.map(d => d.label))
      .padding(0.1);

    const y = d3.scaleLinear()
      .range([height - margin.top - margin.bottom, 0])
      .domain([0, d3.max(barChartData, d => d.count)]);

    svg.selectAll('rect')
      .data(barChartData)
      .enter()
      .append('rect')
      .attr('x', d => x(d.label))
      .attr('y', d => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', d => height - margin.top - margin.bottom - y(d.count))
      .attr('fill', d => getColorForBar(d.label))
      .style('cursor', 'pointer')
      .on('click', (event, d) => handleBarSelect(d.label));

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    svg.append('g')
      .call(d3.axisLeft(y));
  };

  const drawBiplot = () => {
    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };

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
      .style('fill', (d, i) => getPointColor(i, data.rawData[i][selectedVariable]))
      .style('opacity', 0.6);

    Object.entries(data.vectors).forEach(([feature, [x, y]]) => {
      svg.append('line')
        .attr('x1', xScale(0))
        .attr('y1', yScale(0))
        .attr('x2', xScale(x))
        .attr('y2', yScale(y))
        .attr('stroke', 'red')
        .attr('stroke-width', 1);

      svg.append('text')
        .attr('x', xScale(x))
        .attr('y', yScale(y))
        .attr('text-anchor', 'middle')
        .text(feature);
    });

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    svg.append('g')
      .call(d3.axisLeft(yScale));
  };

  const drawParallelCoordinates = () => {
    const width = 900;
    const height = 300;
    const margin = { top: 30, right: 50, bottom: 30, left: 50 };

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
      y[dim] = d3.scaleLinear()
        .domain(d3.extent(data.parallelData, d => +d[dim]))
        .range([height - margin.top - margin.bottom, 0]);
    });

    const x = d3.scalePoint()
      .range([0, width - margin.left - margin.right])
      .domain(dimensions);

    svg.selectAll('path')
      .data(data.parallelData)
      .enter()
      .append('path')
      .attr('d', (d, i) => {
        return d3.line()(dimensions.map(dim => [x(dim), y[dim](+d[dim])]));
      })
      .style('fill', 'none')
      .style('stroke', (d, i) => getPointColor(i, data.rawData[i][selectedVariable]))
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
  };

  const drawRadarChart = () => {
    const width = 600;
    const height = 300;
    const margin = 40;
  
    const radarFeatures = [
      'danceability_%', 'valence_%', 'acousticness_%',
      'energy_%', 'instrumentalness_%', 'liveness_%', 'speechiness_%'
    ];
  
    d3.select('#radar-chart').selectAll('*').remove();
  
    const svg = d3.select('#radar-chart')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);
  
    if (selectedBars.size === 0) return;
  
    const featureBounds = radarFeatures.reduce((acc, feature) => {
      const allValues = data.rawData.map(d => d[feature]);
      acc[feature] = {
        min: d3.min(allValues),
        max: d3.max(allValues),
      };
      console.log(acc)
      return acc;
    }, {});
  
    const selectedData = data.rawData.filter(item => {
      const barLabel = typeof item[selectedVariable] === 'number'
        ? barChartData.find(bin => item[selectedVariable] >= bin.x0 && item[selectedVariable] < bin.x1)?.label
        : item[selectedVariable];
      return selectedBars.has(barLabel);
    });
  
    const normalize = (value, { min, max }) => {
        if (value == null || isNaN(value)) return 0;
        return (value - min) / (max - min);
      };
      
  
    const normalizedAverages = radarFeatures.map(feature => {
      const bounds = featureBounds[feature];
      const values = selectedData.map(d => d[feature]);
      const mean = d3.mean(values);
      return normalize(mean, bounds);
    });
  
    const radialScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, Math.min(width / 2, height / 2) - margin]);
  
    const ticks = [0.25, 0.5, 0.75, 1];
    ticks.forEach(t => {
      svg.append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', radialScale(t))
        .attr('fill', 'none')
        .attr('stroke', '#ccc')
        .attr('stroke-width', 0.5);
    });
  
    const angleSlice = Math.PI * 2 / radarFeatures.length;
    const radarLine = d3.lineRadial()
      .radius(d => radialScale(d))
      .angle((d, i) => i * angleSlice);

    const closedAverages = [...normalizedAverages, normalizedAverages[0]];
    
    svg.append('path')
        .datum(closedAverages)
        .attr('d', radarLine)
        .attr('fill', 'rgba(38, 166, 154, 0.3)')
        .attr('stroke', 'rgb(38, 166, 154)')
        .attr('stroke-width', 2);

    radarFeatures.forEach((feature, i) => {
      const angle = i * angleSlice;
      const x = radialScale(1.2) * Math.cos(angle - Math.PI / 2);
      const y = radialScale(1.2) * Math.sin(angle - Math.PI / 2);
  
      svg.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', radialScale(1) * Math.cos(angle - Math.PI / 2))
        .attr('y2', radialScale(1) * Math.sin(angle - Math.PI / 2))
        .attr('stroke', '#ccc')
        .attr('stroke-width', 0.5);
  
      svg.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .text(feature)
        .style('font-size', '10px');

        const tooltip = svg.append('text')
        .attr('x', 0)
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', '#333');

        svg.on('mousemove', (event) => {
        const values = normalizedAverages.map(v => v.toFixed(2));
        tooltip.text(values.join(', '));
        }).on('mouseout', () => {
        tooltip.text('');
        });

    });
  };
  

  useEffect(() => {
    if (data && selectedVariable) {
      drawBarChart();
      drawBiplot();
      drawParallelCoordinates();
      drawRadarChart();
    }
  }, [data, selectedVariable, selectedBars, colorMap]);


  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '4px' }}>
      <Select
        style={{ width: 200, marginBottom: '4px' }}
        value={selectedVariable}
        onChange={setSelectedVariable}
        placeholder="Select a variable"
      >
        {variables.map(variable => (
          <Select.Option key={variable} value={variable}>
            {variable}
          </Select.Option>
        ))}
      </Select>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        <Card 
          title="Distribution" 
          style={{ 
            width: 750,
            padding: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
          }}
          styles={{
            header: { 
              padding: '2px 4px', 
              fontSize: '14px',
              minHeight: '16px'
            },
            body: { padding: '4px' }
          }}
        >
          <div id="barchart" style={{ height: 350, overflow: 'None' }} />
        </Card>

        <Card 
          title="Biplot" 
          style={{ 
            width: 650,
            padding: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
          }}
          styles={{
            header: { 
              padding: '2px 4px', 
              fontSize: '14px',
              minHeight: '16px'
            },
            body: { padding: '8px' }
          }}
        >
          <div id="biplot" style={{ height: 300, overflow: 'None' }} />
        </Card>

        <Card 
          title="Parallel Coordinates" 
          style={{ 
            width: 850,
            padding: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
          }}
          styles={{
            header: { 
              padding: '2px 4px', 
              fontSize: '14px',
              minHeight: '16px'
            },
            body: { padding: '2px' }
          }}
        >
          <div id="parallel-coordinates" style={{ height: 300, overflow: 'None' }} />
        </Card>
        <Card 
          title="Radar Chart" 
          style={{ 
            width: 550,
            padding: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
          }}
          styles={{
            header: { 
              padding: '2px 4px', 
              fontSize: '14px',
              minHeight: '16px'
            },
            body: { padding: '4px' }
          }}
        >
          <div id="radar-chart" style={{ height: 300, overflow: 'None' }} />
        </Card>

      </div>
    </div>
  );
};

export default Dashboard;