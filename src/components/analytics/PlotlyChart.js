// src/components/analytics/PlotlyChart.js
// react-plotly.js internally does `require('plotly.js/dist/plotly')` with no
// extension, which newer webpack/plotly.js ESM builds refuse to resolve.
// Binding the wrapper to plotly.js-dist-min here avoids that broken path —
// every chart component imports Plot from this file instead of directly
// from "react-plotly.js".
import Plotly from "plotly.js-dist-min";
import createPlotlyComponent from "react-plotly.js/factory";

const Plot = createPlotlyComponent(Plotly);

export default Plot;