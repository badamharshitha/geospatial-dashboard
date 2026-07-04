const defaultMapboxToken = 'pk.eyJ1IjoiY29waWxvdCIsImEiOiJjb3BpbG90LXRlc3QifQ';
window.MAPBOX_TOKEN = window.MAPBOX_TOKEN || defaultMapboxToken;
mapboxgl.accessToken = window.MAPBOX_TOKEN;

class Quadtree {
  constructor(bounds, capacity = 16) {
    this.bounds = bounds;
    this.capacity = capacity;
    this.points = [];
    this.children = [];
    this.isDivided = false;
  }

  subdivide() {
    const { west, east, south, north } = this.bounds;
    const midX = (west + east) / 2;
    const midY = (south + north) / 2;
    this.children = [
      new Quadtree({ west, east: midX, south, north: midY }, this.capacity),
      new Quadtree({ west: midX, east, south, north: midY }, this.capacity),
      new Quadtree({ west, east: midX, south: midY, north }, this.capacity),
      new Quadtree({ west: midX, east, south: midY, north }, this.capacity)
    ];
    this.isDivided = true;
  }

  insert(point) {
    if (!this.contains(point)) return false;
    if (this.points.length < this.capacity && !this.isDivided) {
      this.points.push(point);
      return true;
    }
    if (!this.isDivided) this.subdivide();
    return this.children.some((child) => child.insert(point));
  }

  contains(point) {
    const { west, east, south, north } = this.bounds;
    return point[0] >= west && point[0] <= east && point[1] >= south && point[1] <= north;
  }

  query(bounds, results = []) {
    if (!this.intersects(bounds)) return results;
    for (const point of this.points) {
      const [lng, lat] = point;
      if (lng >= bounds.west && lng <= bounds.east && lat >= bounds.south && lat <= bounds.north) {
        results.push(point);
      }
    }
    if (this.isDivided) {
      this.children.forEach((child) => child.query(bounds, results));
    }
    return results;
  }

  intersects(bounds) {
    return !(bounds.east < this.bounds.west || bounds.west > this.bounds.east || bounds.north < this.bounds.south || bounds.south > this.bounds.north);
  }
}

const categoryFilter = document.getElementById('category-filter');
const toggleButton = document.getElementById('toggle-quadtree');
const statsContainer = document.querySelector('[data-testid="stats-container"]');
const topComplaintEl = document.getElementById('top-complaint-type');
const renderedPointsEl = document.getElementById('rendered-points');

const state = {
  data: null,
  currentData: null,
  categories: [],
  selectedCategory: 'all',
  quadtreeEnabled: false,
  quadtree: null,
  filters: []
};

function normalizeBounds(bounds) {
  if (!bounds) return null;
  if (typeof bounds.getWest === 'function') {
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    return { west: sw.lng, east: ne.lng, south: sw.lat, north: ne.lat };
  }
  if (Array.isArray(bounds)) {
    return { west: bounds[0], east: bounds[2], south: bounds[1], north: bounds[3] };
  }
  return bounds;
}

function setFilterForLayers(filterExpression) {
  const layers = ['heatmap-layer', 'cluster-layer', 'unclustered-point-layer'];
  layers.forEach((layerId) => {
    if (map.getLayer(layerId)) {
      map.setFilter(layerId, filterExpression);
    }
  });
}

function applyFilter(value = state.selectedCategory) {
  state.selectedCategory = value;
  const expression = value === 'all'
    ? ['all']
    : ['==', ['get', 'complaint_type'], value];
  const source = map.getSource('complaints');
  if (source) {
    source.setData({
      type: 'FeatureCollection',
      features: state.data.features.filter((feature) => value === 'all' || feature.properties?.complaint_type === value)
    });
  }
  setFilterForLayers(expression);
  updateLayerOpacity(map.getZoom());
  updateStats();
  window.getVisibleFeatureCount();
}

function createCategoryOptions() {
  const categories = ['all', ...state.categories].filter(Boolean);
  categoryFilter.innerHTML = categories.map((category) => `<option value="${category}">${category === 'all' ? 'All categories' : category}</option>`).join('');
}

function buildQuadtree() {
  const bounds = { west: -74.35, east: -73.65, south: 40.55, north: 40.95 };
  state.quadtree = new Quadtree(bounds, 16);
  state.data.features.forEach((feature) => {
    const [lng, lat] = feature.geometry.coordinates;
    state.quadtree.insert([lng, lat]);
  });
}

function updateStats() {
  const visibleFeatures = getVisibleFeaturesInBounds(map.getBounds());
  const counts = visibleFeatures.reduce((acc, feature) => {
    const category = feature.properties?.complaint_type || 'Unknown';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  const topCategory = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
  topComplaintEl.textContent = topCategory;
  renderedPointsEl.textContent = visibleFeatures.length.toString();
  statsContainer.dataset.lastUpdated = String(Date.now());
}

function getVisibleFeaturesInBounds(bounds) {
  const normalized = normalizeBounds(bounds);
  if (!normalized || !state.data) return [];
  const features = state.data.features.filter((feature) => {
    const [lng, lat] = feature.geometry.coordinates;
    return lng >= normalized.west && lng <= normalized.east && lat >= normalized.south && lat <= normalized.north;
  });
  if (state.selectedCategory !== 'all') {
    return features.filter((feature) => feature.properties?.complaint_type === state.selectedCategory);
  }
  return features;
}

function updateLayerOpacity(zoom) {
  const heatmapOpacity = zoom <= 9 ? 0.95 : 0.05;
  const clusterOpacity = zoom <= 9 ? 0.05 : 0.95;
  if (map.getLayer('heatmap-layer')) {
    map.setPaintProperty('heatmap-layer', 'heatmap-opacity', heatmapOpacity);
  }
  if (map.getLayer('cluster-layer')) {
    map.setPaintProperty('cluster-layer', 'circle-opacity', clusterOpacity);
  }
}

function initializeMap() {
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-74.0060, 40.7128],
    zoom: 10,
    attributionControl: false
  });

  map.on('load', async () => {
    const response = await fetch('/data/nyc_311.geojson');
    const data = await response.json();
    state.data = data;
    state.categories = [...new Set(data.features.map((feature) => feature.properties?.complaint_type).filter(Boolean))].sort();
    createCategoryOptions();

    buildQuadtree();

    map.addSource('complaints', {
      type: 'geojson',
      data,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });

    map.addLayer({
      id: 'heatmap-layer',
      type: 'heatmap',
      source: 'complaints',
      maxzoom: 9,
      paint: {
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 20],
        'heatmap-weight': 1,
        'heatmap-intensity': 1,
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(0,0,0,0)',
          0.2, '#3b82f6',
          0.4, '#10b981',
          0.6, '#f59e0b',
          1, '#ef4444'
        ],
        'heatmap-opacity': 0.95
      }
    });

    map.addLayer({
      id: 'cluster-layer',
      type: 'circle',
      source: 'complaints',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#2563eb',
        'circle-radius': ['step', ['get', 'point_count'], 18, 50, 24, 100, 30],
        'circle-opacity': 0.05,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#f8fafc'
      }
    });

    map.addLayer({
      id: 'unclustered-point-layer',
      type: 'circle',
      source: 'complaints',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#f43f5e',
        'circle-radius': 3,
        'circle-opacity': 0.8
      }
    });

    map.on('click', 'cluster-layer', (event) => {
      const feature = event.features?.[0];
      if (!feature) return;
      const clusterId = feature.properties.cluster_id;
      const source = map.getSource('complaints');
      source.getClusterExpansionZoom(clusterId, (error, zoom) => {
        if (error) return;
        map.easeTo({ center: feature.geometry.coordinates, zoom: zoom });
      });
    });

    map.on('zoomend', () => {
      updateLayerOpacity(map.getZoom());
      updateStats();
    });

    map.on('moveend', () => {
      updateStats();
    });

    applyFilter('all');
    updateStats();
  });
}

let map;
initializeMap();

categoryFilter.addEventListener('change', (event) => {
  applyFilter(event.target.value);
});

toggleButton.addEventListener('click', () => {
  state.quadtreeEnabled = !state.quadtreeEnabled;
  toggleButton.textContent = `Quadtree Mode: ${state.quadtreeEnabled ? 'On' : 'Off'}`;
  if (state.quadtreeEnabled) {
    const bounds = normalizeBounds(map.getBounds());
    const result = window.getQuadtreePoints(bounds);
    console.log('Quadtree points', result.features.length);
  }
});

window.getMapState = () => ({
  center: map.getCenter(),
  zoom: map.getZoom()
});

window.getDataSourceFeatureCount = (sourceId) => {
  if (!state.data || sourceId !== 'complaints') return 0;
  return state.data.features.length;
};

window.isSourceClustered = (sourceId) => sourceId === 'complaints';

window.getVisibleFeatureCount = () => {
  const rendered = map.queryRenderedFeatures({ layers: ['unclustered-point-layer'] });
  return rendered.length;
};

window.measureFilterUpdateTime = (filterValue) => new Promise((resolve) => {
  const start = performance.now();
  applyFilter(filterValue);
  requestAnimationFrame(() => resolve(Number((performance.now() - start).toFixed(2))));
});

window.getLayerOpacity = (layerId) => {
  if (layerId === 'heatmap-layer') {
    return map.getPaintProperty(layerId, 'heatmap-opacity');
  }
  if (layerId === 'cluster-layer') {
    return map.getPaintProperty(layerId, 'circle-opacity');
  }
  return 0;
};

window.getStatValue = (statId) => {
  if (statId === 'top-complaint-type') return topComplaintEl.textContent;
  if (statId === 'rendered-points') return renderedPointsEl.textContent;
  return '';
};

window.getQuadtreePoints = (bounds) => {
  const normalized = normalizeBounds(bounds);
  const points = (state.quadtree || buildQuadtree(), state.quadtree).query(normalized);
  return {
    type: 'FeatureCollection',
    features: points.map((point, index) => ({
      type: 'Feature',
      id: index,
      geometry: { type: 'Point', coordinates: [point[0], point[1]] },
      properties: { source: 'quadtree' }
    }))
  };
};
