# Polygon Map Drawer

A mobile-first web application for drawing polygons on satellite maps and exporting them as GeoJSON.

## Features

- **Satellite Map View**: Uses Mapbox GL JS with satellite imagery
- **Polygon Drawing**: Draw, edit, and delete polygons directly on the map
- **Current Location**: Find and zoom to your GPS location
- **Area Calculation**: Real-time area display in m², hectares, or km²
- **GeoJSON Export**: Download your polygons as standard GeoJSON files
- **Multiple Map Styles**: Switch between satellite, streets, outdoors, and light themes
- **Mobile-First Design**: Optimized for touch devices with responsive desktop support
- **Offline Support**: Drawings are saved to session storage

## Demo

The app requires a Mapbox access token to function. Get your free token at [mapbox.com](https://www.mapbox.com/).

## Quick Start

### Option 1: Open Directly

Simply open `index.html` in a modern web browser. You'll be prompted to enter your Mapbox API key.

### Option 2: Local Development Server

```bash
# Using Python
python3 -m http.server 8080

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8080
```

Then visit `http://localhost:8080` in your browser.

## Deployment

This is a static site that can be deployed to any web hosting service.

### Netlify (Recommended)

1. Create a new site on [Netlify](https://www.netlify.com/)
2. Drag and drop the `polygon-map-drawer` folder
3. Your site will be live instantly

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts

### GitHub Pages

1. Push the code to a GitHub repository
2. Go to Settings → Pages
3. Select the branch containing the files
4. Your site will be at `https://username.github.io/repo-name/`

### Cloudflare Pages

1. Connect your GitHub repository to Cloudflare Pages
2. Set the build output directory to `/polygon-map-drawer`
3. Deploy

### Any Static Host

Upload the three files (`index.html`, `style.css`, `app.js`) to your web server.

## Usage

### Drawing Polygons

1. Tap the **Draw** button in the toolbar
2. Tap on the map to place vertices
3. Tap the first point again or double-tap to complete the polygon
4. The area will be displayed automatically

### Editing Polygons

- Tap on a polygon to select it
- Drag vertices to reshape
- Drag the polygon center to move it
- Tap outside to deselect

### Finding Your Location

Tap the **Locate** button to zoom to your current GPS position. You may need to grant location permissions.

### Exporting GeoJSON

Tap the **Export** button to download your polygons as a `.geojson` file. The export includes:
- Polygon geometry
- Area in square meters
- Creation timestamp

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `D` | Start drawing |
| `L` | Find location |
| `Ctrl+E` | Export GeoJSON |
| `Esc` | Close modals |

## Configuration

### Mapbox API Key

Your API key can be:
- **Remembered**: Stored in localStorage (persists across sessions)
- **Session only**: Stored in sessionStorage (cleared when browser closes)

To change your API key, use the menu (⋮) → "Change API Key".

### Map Styles

Available styles:
- **Satellite**: Aerial imagery with street labels
- **Streets**: Standard road map
- **Outdoors**: Terrain with trails and outdoor features
- **Light**: Minimal light-colored basemap

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Chrome for Android 90+

## File Structure

```
polygon-map-drawer/
├── index.html    # Main HTML file
├── style.css     # Mobile-first CSS styles
├── app.js        # JavaScript application logic
└── README.md     # This file
```

## Dependencies (CDN)

- [Mapbox GL JS v3.3.0](https://docs.mapbox.com/mapbox-gl-js/)
- [Mapbox GL Draw v1.4.3](https://github.com/mapbox/mapbox-gl-draw)
- [Turf.js v6](https://turfjs.org/) (for area calculations)

## License

MIT License - Feel free to use, modify, and distribute.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.
