# 🗺️ NYC 311 Geospatial Dashboard

A high-performance **Geospatial Data Dashboard** built with **HTML, CSS, JavaScript, and Mapbox GL JS** to visualize large-scale NYC 311 complaint data. The application provides interactive map visualization, filtering, clustering, heatmap rendering, and real-time statistics for efficient exploration of geospatial datasets.

---

## 🚀 Features

- 🗺️ Interactive Mapbox GL JS map
- 📍 Visualizes 50,000+ GeoJSON complaint locations
- 🔍 Complaint Type filtering
- 📊 Live visible area statistics
- 📌 Built-in Mapbox client-side clustering
- 🌡️ Heatmap visualization for dense regions
- 🌲 Manual Quadtree implementation for spatial queries
- ⚡ Optimized rendering for large datasets
- 🐳 Docker support for easy deployment
- 📱 Responsive dashboard layout

---

## 🛠️ Technologies Used

- HTML5
- CSS3
- JavaScript (ES6)
- Mapbox GL JS
- GeoJSON
- Docker
- Docker Compose

---

## 📂 Project Structure

```
geospatial-dashboard/
│── data/
│   └── nyc_311.geojson
│── app.js
│── styles.css
│── index.html
│── Dockerfile
│── docker-compose.yml
│── PERFORMANCE.md
│── README.md
│── .env.example
```

---

## ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/your-username/geospatial-dashboard.git
```

Navigate into the project:

```bash
cd geospatial-dashboard
```

Install dependencies:

```bash
npm install
```

---

## ▶️ Run the Project

### Using Docker

```bash
docker-compose up --build
```

### Or Using Python HTTP Server

```bash
python3 -m http.server 8081
```

Open your browser:

```
http://localhost:8081
```

---

## 🔑 Environment Variables

Create a `.env` file from `.env.example`.

```env
VITE_MAPBOX_TOKEN=your_mapbox_public_token
```

Get your Mapbox token from:

https://console.mapbox.com/account/access-tokens/

---

## 📊 Dashboard Features

### Interactive Map

- Map centered on New York City
- Smooth zoom and pan interactions
- High-performance rendering

### Complaint Filtering

- Filter complaints by type
- Dynamic map updates

### Clustering

- Built-in Mapbox clustering
- Reduces map clutter
- Improves rendering performance

### Heatmap

- Visualizes complaint density
- Smooth transition between heatmap and clusters

### Quadtree Mode

- Manual client-side Quadtree implementation
- Efficient viewport-based spatial queries

### Live Statistics

- Visible complaint count
- Top complaint category
- Dynamic updates based on map viewport

---

## ⚡ Performance Optimizations

- Client-side clustering
- Viewport-based rendering
- Quadtree spatial indexing
- Optimized filtering
- Efficient GeoJSON loading

See **PERFORMANCE.md** for more details.

---

## 📸 Screenshots

### Dashboard

![Dashboard](screenshots/dashboard.png)

### Clustering

![Clusters](screenshots/clusters.png)

### Heatmap

![Heatmap](screenshots/heatmap.png)

---

## 📌 Future Improvements

- Search by location
- Date range filtering
- Borough comparison
- Dark/Light theme
- Export filtered results
- Analytics charts

---

## 👩‍💻 Author

**Badam Nikhila Sri Harshitha**

- GitHub: https://github.com/badamharshitha
- LinkedIn: https://www.linkedin.com/in/nikhila-sri-harshitha-badam-463769365/

---

## 📄 License

This project is created for learning and portfolio purposes.
