// scripts/vega_lite_vis.js
//-----------------------------------------------------
// Define all visualisation specs and their container IDs
//-----------------------------------------------------
const specs = {
  map: 'visuals/map.vg.json',
  timeseries: 'visuals/timeseries.vg.json',
  totaltrend: 'visuals/total_trade_trend.vg.json',
  topcommodities: 'visuals/top_commodities.vg.json',
  portsmap: 'visuals/portsmap.vg.json'
};

// Store active Vega views
const views = {};

// Embed options
const opts = { actions: false, renderer: 'canvas' };

//-----------------------------------------------------
// Load all visualisations asynchronously
//-----------------------------------------------------
async function loadAll() {
  console.log("🌏 Loading all visualisations...");

  for (const [el, spec] of Object.entries(specs)) {
    try {
      const res = await vegaEmbed(`#${el}`, spec, opts);
      views[el] = res.view;
      console.log(`✅ Loaded ${el} from ${spec}`);
    } catch (err) {
      console.warn(`⚠️ Could not load ${spec}:`, err);
    }
  }

  // Apply initial state to all charts after load
  applyControls();
}

//-----------------------------------------------------
// Apply global controls (year + trade type) to all visuals
//-----------------------------------------------------
function applyControls() {
  const year = +document.getElementById('yearSlider').value;
  const trade = document.getElementById('tradeType').value;

  // Update visible year label
  document.getElementById('yearValue').textContent = year;

  // Apply to all charts
  Object.entries(views).forEach(([name, v]) => {
    try {
      if (v.signal) {
        if (v.signal('yearFilter')) v.signal('yearFilter', year);
        else v.signal('yearFilter', year);
        if (v.signal('tradeType')) v.signal('tradeType', trade);
        else v.signal('tradeType', trade);
      }
      v.runAsync();
    } catch (err) {
      console.warn(`⚠️ Could not update signals for ${name}:`, err);
    }
  });
}

//-----------------------------------------------------
// Add a small debounce for smoother interactivity
//-----------------------------------------------------
let debounceTimeout;
function debouncedApplyControls() {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(applyControls, 100);
}

//-----------------------------------------------------
// Initialize on DOM ready
//-----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  loadAll();

  // Global control listeners
  document.getElementById('yearSlider').addEventListener('input', debouncedApplyControls);
  document.getElementById('tradeType').addEventListener('change', applyControls);
});
