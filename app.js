/**
 * Polygon Map Drawer
 * A mobile-first web app for drawing polygons on satellite maps
 */

(function() {
    'use strict';

    // ========================================
    // Configuration
    // ========================================
    const CONFIG = {
        // Mapbox API Key
        embeddedApiKey: 'pk.eyJ1Ijoic3VtdGluZyIsImEiOiJja3licjF4NXEwaHc2MnFvODJkOXp5M2ZkIn0.-WciZf0vNJTZcJ2vxueTQg',

        defaultCenter: [4.9041, 52.3676], // Amsterdam
        defaultZoom: 12,
        drawStorageKey: 'polygon-drawer-data',
        styleStorageKey: 'polygon-drawer-style',
        defaultStyle: 'satellite-streets-v12'
    };

    // ========================================
    // State
    // ========================================
    let map = null;
    let draw = null;
    let currentStyle = CONFIG.defaultStyle;
    let locationMarker = null;

    // ========================================
    // DOM Elements
    // ========================================
    const elements = {
        app: document.getElementById('app'),
        mapContainer: document.getElementById('map'),
        areaDisplay: document.getElementById('area-display'),
        menuToggle: document.getElementById('menu-toggle'),
        dropdownMenu: document.getElementById('dropdown-menu'),
        locateBtn: document.getElementById('locate-btn'),
        drawBtn: document.getElementById('draw-btn'),
        clearBtn: document.getElementById('clear-btn'),
        exportBtn: document.getElementById('export-btn'),
        changeStyleBtn: document.getElementById('change-style-btn'),
        helpBtn: document.getElementById('help-btn'),
        helpModal: document.getElementById('help-modal'),
        styleModal: document.getElementById('style-modal'),
        toast: document.getElementById('toast')
    };

    // ========================================
    // Utility Functions
    // ========================================

    function showToast(message, type = 'info', duration = 3000) {
        elements.toast.textContent = message;
        elements.toast.className = `toast ${type}`;
        elements.toast.classList.remove('hidden');

        setTimeout(() => {
            elements.toast.classList.add('hidden');
        }, duration);
    }

    function formatArea(sqMeters) {
        if (sqMeters < 10000) {
            return `${sqMeters.toFixed(1)} m²`;
        } else if (sqMeters < 1000000) {
            return `${(sqMeters / 10000).toFixed(2)} ha`;
        } else {
            return `${(sqMeters / 1000000).toFixed(2)} km²`;
        }
    }

    function getStoredStyle() {
        return localStorage.getItem(CONFIG.styleStorageKey) || CONFIG.defaultStyle;
    }

    function setStoredStyle(style) {
        localStorage.setItem(CONFIG.styleStorageKey, style);
    }

    function saveDrawData() {
        if (draw) {
            const data = draw.getAll();
            sessionStorage.setItem(CONFIG.drawStorageKey, JSON.stringify(data));
        }
    }

    function loadDrawData() {
        const stored = sessionStorage.getItem(CONFIG.drawStorageKey);
        if (stored && draw) {
            try {
                const data = JSON.parse(stored);
                draw.set(data);
                updateAreaDisplay();
            } catch (e) {
                console.warn('Failed to load saved drawing data');
            }
        }
    }

    // ========================================
    // Map Initialization
    // ========================================

    function initMap(accessToken) {
        mapboxgl.accessToken = accessToken;
        currentStyle = getStoredStyle();

        try {
            map = new mapboxgl.Map({
                container: 'map',
                style: `mapbox://styles/mapbox/${currentStyle}`,
                center: CONFIG.defaultCenter,
                zoom: CONFIG.defaultZoom,
                attributionControl: true,
                pitchWithRotate: false
            });

            map.on('load', () => {
                initDraw();
                elements.app.classList.remove('hidden');
                // Ensure map fills container after becoming visible
                setTimeout(() => map.resize(), 100);
                showToast('Map loaded successfully', 'success');
            });

            map.on('error', (e) => {
                if (e.error && e.error.status === 401) {
                    showToast('Invalid API key', 'error');
                }
            });

            // Add zoom controls
            map.addControl(new mapboxgl.NavigationControl({
                showCompass: true,
                showZoom: true
            }), 'bottom-right');

            // Add scale
            map.addControl(new mapboxgl.ScaleControl({
                maxWidth: 100,
                unit: 'metric'
            }), 'bottom-left');

        } catch (error) {
            console.error('Map initialization error:', error);
            showToast('Failed to initialize map', 'error');
        }
    }

    function initDraw() {
        // Custom draw styles
        const drawStyles = [
            // Polygon fill
            {
                'id': 'gl-draw-polygon-fill',
                'type': 'fill',
                'filter': ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
                'paint': {
                    'fill-color': '#4f46e5',
                    'fill-outline-color': '#4f46e5',
                    'fill-opacity': 0.2
                }
            },
            // Polygon outline
            {
                'id': 'gl-draw-polygon-stroke-active',
                'type': 'line',
                'filter': ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
                'layout': {
                    'line-cap': 'round',
                    'line-join': 'round'
                },
                'paint': {
                    'line-color': '#4f46e5',
                    'line-width': 3
                }
            },
            // Vertex points
            {
                'id': 'gl-draw-polygon-and-line-vertex-active',
                'type': 'circle',
                'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
                'paint': {
                    'circle-radius': 8,
                    'circle-color': '#ffffff',
                    'circle-stroke-color': '#4f46e5',
                    'circle-stroke-width': 3
                }
            },
            // Midpoints
            {
                'id': 'gl-draw-polygon-midpoint',
                'type': 'circle',
                'filter': ['all', ['==', 'meta', 'midpoint'], ['==', '$type', 'Point']],
                'paint': {
                    'circle-radius': 5,
                    'circle-color': '#4f46e5',
                    'circle-stroke-color': '#ffffff',
                    'circle-stroke-width': 2
                }
            },
            // Line during drawing
            {
                'id': 'gl-draw-line',
                'type': 'line',
                'filter': ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
                'layout': {
                    'line-cap': 'round',
                    'line-join': 'round'
                },
                'paint': {
                    'line-color': '#4f46e5',
                    'line-dasharray': [2, 2],
                    'line-width': 3
                }
            },
            // Points during drawing
            {
                'id': 'gl-draw-point',
                'type': 'circle',
                'filter': ['all', ['==', '$type', 'Point'], ['==', 'meta', 'feature'], ['!=', 'mode', 'static']],
                'paint': {
                    'circle-radius': 8,
                    'circle-color': '#ffffff',
                    'circle-stroke-color': '#4f46e5',
                    'circle-stroke-width': 3
                }
            },
            // Static polygon fill
            {
                'id': 'gl-draw-polygon-fill-static',
                'type': 'fill',
                'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'static']],
                'paint': {
                    'fill-color': '#10b981',
                    'fill-outline-color': '#10b981',
                    'fill-opacity': 0.2
                }
            },
            // Static polygon outline
            {
                'id': 'gl-draw-polygon-stroke-static',
                'type': 'line',
                'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'static']],
                'layout': {
                    'line-cap': 'round',
                    'line-join': 'round'
                },
                'paint': {
                    'line-color': '#10b981',
                    'line-width': 3
                }
            }
        ];

        draw = new MapboxDraw({
            displayControlsDefault: false,
            controls: {},
            defaultMode: 'simple_select',
            styles: drawStyles,
            touchEnabled: true,
            boxSelect: false
        });

        map.addControl(draw);

        // Event listeners
        map.on('draw.create', handleDrawUpdate);
        map.on('draw.update', handleDrawUpdate);
        map.on('draw.delete', handleDrawUpdate);
        map.on('draw.selectionchange', handleSelectionChange);

        // Load any saved data
        loadDrawData();
    }

    function handleDrawUpdate() {
        updateAreaDisplay();
        saveDrawData();
    }

    function handleSelectionChange(e) {
        if (e.features.length > 0) {
            // A feature is selected
            elements.drawBtn.classList.remove('active');
        }
    }

    function updateAreaDisplay() {
        const data = draw.getAll();

        if (data.features.length === 0) {
            elements.areaDisplay.textContent = 'Draw a polygon to see area';
            return;
        }

        let totalArea = 0;
        const polygons = data.features.filter(f => f.geometry.type === 'Polygon');

        polygons.forEach(polygon => {
            totalArea += turf.area(polygon);
        });

        if (polygons.length === 0) {
            elements.areaDisplay.textContent = 'Complete your polygon';
        } else if (polygons.length === 1) {
            elements.areaDisplay.innerHTML = `Area: <span class="area-value">${formatArea(totalArea)}</span>`;
        } else {
            elements.areaDisplay.innerHTML = `${polygons.length} polygons: <span class="area-value">${formatArea(totalArea)}</span>`;
        }
    }

    // ========================================
    // Toolbar Actions
    // ========================================

    function handleLocate() {
        if (!navigator.geolocation) {
            showToast('Geolocation not supported', 'error');
            return;
        }

        showToast('Finding your location...');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { longitude, latitude } = position.coords;

                // Remove existing marker
                if (locationMarker) {
                    locationMarker.remove();
                }

                // Add marker at location
                const el = document.createElement('div');
                el.className = 'location-marker';
                locationMarker = new mapboxgl.Marker(el)
                    .setLngLat([longitude, latitude])
                    .addTo(map);

                // Fly to location
                map.flyTo({
                    center: [longitude, latitude],
                    zoom: 16,
                    duration: 2000
                });

                showToast('Location found', 'success');
            },
            (error) => {
                let message = 'Unable to get location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Location permission denied';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Location unavailable';
                        break;
                    case error.TIMEOUT:
                        message = 'Location request timed out';
                        break;
                }
                showToast(message, 'error');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }

    function handleDraw() {
        if (draw) {
            draw.changeMode('draw_polygon');
            elements.drawBtn.classList.add('active');
            showToast('Tap map to draw polygon');
        }
    }

    function handleClear() {
        if (draw) {
            const data = draw.getAll();
            if (data.features.length === 0) {
                showToast('Nothing to clear');
                return;
            }

            draw.deleteAll();
            updateAreaDisplay();
            saveDrawData();
            showToast('All drawings cleared');
        }
    }

    function handleExport() {
        if (!draw) return;

        const data = draw.getAll();
        const polygons = data.features.filter(f => f.geometry.type === 'Polygon');

        if (polygons.length === 0) {
            showToast('No polygons to export', 'error');
            return;
        }

        // Create clean GeoJSON
        const geojson = {
            type: 'FeatureCollection',
            features: polygons.map((feature, index) => ({
                type: 'Feature',
                properties: {
                    id: index + 1,
                    area_sqm: turf.area(feature),
                    created: new Date().toISOString()
                },
                geometry: feature.geometry
            }))
        };

        // Download file
        const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `polygon-${new Date().toISOString().slice(0, 10)}.geojson`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast(`Exported ${polygons.length} polygon(s)`, 'success');
    }

    // ========================================
    // Map Style
    // ========================================

    function changeMapStyle(styleName) {
        if (!map) return;

        currentStyle = styleName;
        setStoredStyle(styleName);

        // Save current drawings
        const currentData = draw ? draw.getAll() : null;

        map.setStyle(`mapbox://styles/mapbox/${styleName}`);

        // Restore drawings after style loads
        map.once('style.load', () => {
            if (draw && currentData) {
                // Need to re-add draw control after style change
                map.removeControl(draw);
                initDraw();
                if (currentData.features.length > 0) {
                    draw.set(currentData);
                }
            }
        });

        // Update active style button
        document.querySelectorAll('.style-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.style === styleName);
        });

        elements.styleModal.classList.add('hidden');
        showToast('Map style updated', 'success');
    }

    // ========================================
    // Event Listeners
    // ========================================

    function setupEventListeners() {
        // Toolbar buttons
        elements.locateBtn.addEventListener('click', handleLocate);
        elements.drawBtn.addEventListener('click', handleDraw);
        elements.clearBtn.addEventListener('click', handleClear);
        elements.exportBtn.addEventListener('click', handleExport);

        // Menu toggle
        elements.menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            elements.dropdownMenu.classList.toggle('hidden');
        });

        // Dropdown items
        elements.changeStyleBtn.addEventListener('click', () => {
            elements.dropdownMenu.classList.add('hidden');
            elements.styleModal.classList.remove('hidden');
        });

        elements.helpBtn.addEventListener('click', () => {
            elements.dropdownMenu.classList.add('hidden');
            elements.helpModal.classList.remove('hidden');
        });

        // Style options
        document.querySelectorAll('.style-option').forEach(btn => {
            btn.addEventListener('click', () => {
                changeMapStyle(btn.dataset.style);
            });
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal').classList.add('hidden');
            });
        });

        // Close modals on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        });

        // Close dropdown on outside click
        document.addEventListener('click', (e) => {
            if (!elements.dropdownMenu.contains(e.target) && !elements.menuToggle.contains(e.target)) {
                elements.dropdownMenu.classList.add('hidden');
            }
        });

        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape to close modals
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
                    modal.classList.add('hidden');
                });
                elements.dropdownMenu.classList.add('hidden');
            }

            // Shortcuts when map is active
            if (map && !document.querySelector('.modal:not(.hidden)')) {
                if (e.key === 'd' || e.key === 'D') {
                    handleDraw();
                } else if (e.key === 'l' || e.key === 'L') {
                    handleLocate();
                } else if ((e.key === 'e' || e.key === 'E') && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleExport();
                }
            }
        });

        // Prevent double-tap zoom on toolbar
        elements.toolbar = document.querySelector('.toolbar');
        let lastTouchEnd = 0;
        elements.toolbar?.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
    }

    // ========================================
    // Initialize App
    // ========================================

    function init() {
        setupEventListeners();
        initMap(CONFIG.embeddedApiKey);

        // Mark initial style as active
        const storedStyle = getStoredStyle();
        document.querySelectorAll('.style-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.style === storedStyle);
        });
    }

    // Start app when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
