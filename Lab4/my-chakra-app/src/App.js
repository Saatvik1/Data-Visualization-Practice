import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Anchor } from 'antd';
import CorrelationMatrix from './components/CorrelationMatrix';
import ScatterPlotMatrix from './components/ScatterPlotMatrix';
import ParallelCoordinates from './components/ParallelCoordinates';
import PCAPlot from './components/PCAPlot';
import Biplot from './components/Biplot';
import MDSData from './components/MDSData';
import MDSAttributes from './components/MDSAttributes';
import ChartSelector from './components/ChartSelector';
import InteractiveVisualizations from './components/InteractiveVisualizations';
import ClusterVisualizations from './components/ClusterVisualizations';

const { Link } = Anchor;

const App = () => (
  <Router>
    <div>
      <Anchor direction="horizontal">
        <Link href="/correlation-matrix" title="Correlation Matrix" />
        <Link href="/scatter-plot-matrix" title="Scatter Plot Matrix" />
        <Link href="/parallel-coordinates" title="Parallel Coordinates" />
        <Link href="/pca-plot" title="PCA Plot" />
        <Link href="/biplot" title="Biplot" />
        <Link href="/mds-data" title="MDS (Data)" />
        <Link href="/mds-attributes" title="MDS (Attributes)" />
        <Link href="/bar-hist-chart" title="Bar/Histogram Chart" />
        <Link href="/interactive-vis-bar" title="Multi Vis Bar" />
        <Link href="/interactive-vis-cluster" title="Multi Vis Cluster" />
      </Anchor>

      <Routes>
        <Route path="/correlation-matrix" element={<CorrelationMatrix />} />
        <Route path="/scatter-plot-matrix" element={<ScatterPlotMatrix />} />
        <Route path="/parallel-coordinates" element={<ParallelCoordinates />} />
        <Route path="/pca-plot" element={<PCAPlot />} />
        <Route path="/biplot" element={<Biplot />} />
        <Route path="/mds-data" element={<MDSData />} />
        <Route path="/mds-attributes" element={<MDSAttributes />} />
        <Route path="/bar-hist-chart" element={<ChartSelector />} />
        <Route path="/interactive-vis-bar" element={<InteractiveVisualizations />} />
        <Route path="/interactive-vis-cluster" element={<ClusterVisualizations />} />

      </Routes>
    </div>
  </Router>
);

export default App;
