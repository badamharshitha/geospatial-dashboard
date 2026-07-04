# Performance Notes

## Filter performance

The dashboard applies category filtering directly through Mapbox layer filters and measures the update cost in the browser with `window.measureFilterUpdateTime`. The implementation favors a small number of layer updates and avoids expensive re-creation of the GeoJSON source, keeping typical filter updates well below the 100 ms target for the included data volume.

## Frame rate analysis

Rendering is kept responsive by using Mapbox's built-in clustering at lower zoom levels, switching to a heatmap layer for broad overviews, and limiting the UI updates to the visible map bounds. The statistics panel and filter updates are throttled to map interactions and repaint cycles, which helps preserve a smooth frame rate while panning and zooming over dense New York City point data.
