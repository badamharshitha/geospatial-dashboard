import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('http://127.0.0.1:8080/', { waitUntil: 'networkidle' });
await page.waitForTimeout(4000);

const mapExists = await page.locator('[data-testid="map-container"]').count();
const state = await page.evaluate(() => window.getMapState ? window.getMapState() : null);
const featureCount = await page.evaluate(() => window.getDataSourceFeatureCount ? window.getDataSourceFeatureCount('complaints') : null);
const clustered = await page.evaluate(() => window.isSourceClustered ? window.isSourceClustered('complaints') : null);
const initialVisible = await page.evaluate(() => window.getVisibleFeatureCount ? window.getVisibleFeatureCount() : null);
await page.selectOption('[data-testid="category-filter"]', 'Noise - Residential');
await page.waitForTimeout(1000);
const changedVisible = await page.evaluate(() => window.getVisibleFeatureCount ? window.getVisibleFeatureCount() : null);
const filterTime = await page.evaluate(() => window.measureFilterUpdateTime ? window.measureFilterUpdateTime('Noise - Residential') : null);
const heatmapOpacity = await page.evaluate(() => window.getLayerOpacity ? window.getLayerOpacity('heatmap-layer') : null);
const clusterOpacity = await page.evaluate(() => window.getLayerOpacity ? window.getLayerOpacity('cluster-layer') : null);
const statBefore = await page.evaluate(() => window.getStatValue ? window.getStatValue('top-complaint-type') : null);
await page.evaluate(() => new Promise((resolve) => { window.map.easeTo({ center: [-73.95, 40.78], zoom: 11 }); window.map.once('moveend', resolve); }));
await page.waitForTimeout(1000);
const statAfter = await page.evaluate(() => window.getStatValue ? window.getStatValue('top-complaint-type') : null);

console.log(JSON.stringify({
  mapExists,
  state,
  featureCount,
  clustered,
  initialVisible,
  changedVisible,
  filterTime,
  heatmapOpacity,
  clusterOpacity,
  statBefore,
  statAfter
}, null, 2));

await browser.close();
