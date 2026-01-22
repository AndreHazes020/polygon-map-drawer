/**
 * Polygon Drawer
 * A mobile-friendly map app for drawing polygons
 */

(function() {
    'use strict';

    const CONFIG = {
        embeddedApiKey: 'pk.eyJ1Ijoic3VtdGluZyIsImEiOiJja3licjF4NXEwaHc2MnFvODJkOXp5M2ZkIn0.-WciZf0vNJTZcJ2vxueTQg',
        defaultCenter: [4.9041, 52.3676],
        defaultZoom: 12,
        drawStorageKey: 'polygon-drawer-data',
        mapStyle: 'satellite-streets-v12'
    };

    let map = null;
    let draw = null;
    let locationMarker = null;
    let searchTimeout = null;

    const elements = {
        app: document.getElementById('app'),
        searchInput: document.getElementById('search-input'),
        searchClear: document.getElementById('search-clear'),
        searchResults: document.getElementById('search-results'),
        areaDisplay: document.getElementById('area-display'),
        locateBtn: document.getElementById('locate-btn'),
        drawBtn: document.getElementById('draw-btn'),
        clearBtn: document.getElementById('clear-btn'),
        copyBtn: document.getElementById('copy-btn'),
        helpBtn: document.getElementById('help-btn'),
        helpModal: document.getElementById('help-modal'),
        locationModal: document.getElementById('location-modal'),
        copySuccessModal: document.getElementById('copy-success-modal'),
        countdownTimer: document.getElementById('countdown-timer'),
        backToFormBtn: document.getElementById('back-to-form-btn'),
        toast: document.getElementById('toast')
    };

    let copyCountdownInterval = null;

    // Utility Functions
    function showToast(message, type = 'info', duration = 2500) {
        elements.toast.textContent = message;
        elements.toast.className = `toast ${type}`;
        elements.toast.classList.remove('hidden');
        setTimeout(() => elements.toast.classList.add('hidden'), duration);
    }

    function formatArea(sqMeters) {
        if (sqMeters < 10000) {
            return `${sqMeters.toFixed(0)} m²`;
        } else if (sqMeters < 1000000) {
            return `${(sqMeters / 10000).toFixed(2)} ha`;
        } else {
            return `${(sqMeters / 1000000).toFixed(2)} km²`;
        }
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

    // Search Functionality - uses both Mapbox and OpenStreetMap for better results
    async function searchLocation(query) {
        if (!query || query.length < 2) {
            elements.searchResults.classList.add('hidden');
            return;
        }

        try {
            // Search both Mapbox and Nominatim (OpenStreetMap) in parallel
            const [mapboxResults, nominatimResults] = await Promise.all([
                searchMapbox(query),
                searchNominatim(query)
            ]);

            // Combine and deduplicate results
            const combined = combineSearchResults(mapboxResults, nominatimResults);

            if (combined.length > 0) {
                renderSearchResults(combined);
            } else {
                elements.searchResults.classList.add('hidden');
                showToast('No locations found', 'info');
            }
        } catch (error) {
            console.error('Search error:', error);
            elements.searchResults.classList.add('hidden');
        }
    }

    async function searchMapbox(query) {
        try {
            const params = new URLSearchParams({
                access_token: CONFIG.embeddedApiKey,
                autocomplete: 'true',
                fuzzyMatch: 'true',
                limit: '5',
                types: 'country,region,postcode,district,place,locality,neighborhood,address,poi'
            });

            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params.toString()}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.features && data.features.length > 0) {
                return data.features.map(f => ({
                    name: f.text || f.place_name.split(',')[0],
                    detail: f.place_name,
                    lng: f.center[0],
                    lat: f.center[1],
                    source: 'mapbox'
                }));
            }
        } catch (e) {
            console.warn('Mapbox search failed:', e);
        }
        return [];
    }

    async function searchNominatim(query) {
        try {
            const params = new URLSearchParams({
                q: query,
                format: 'json',
                limit: '5',
                addressdetails: '1'
            });

            const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
            const response = await fetch(url, {
                headers: { 'Accept': 'application/json' }
            });
            const data = await response.json();

            if (data && data.length > 0) {
                return data.map(item => ({
                    name: item.name || item.display_name.split(',')[0],
                    detail: item.display_name,
                    lng: parseFloat(item.lon),
                    lat: parseFloat(item.lat),
                    source: 'osm'
                }));
            }
        } catch (e) {
            console.warn('Nominatim search failed:', e);
        }
        return [];
    }

    function combineSearchResults(mapboxResults, nominatimResults) {
        const combined = [];
        const seen = new Set();

        // Helper to create a rough location key for deduplication
        const getLocationKey = (result) => {
            // Round to ~100m precision for deduplication
            const latRound = Math.round(result.lat * 1000) / 1000;
            const lngRound = Math.round(result.lng * 1000) / 1000;
            return `${latRound},${lngRound}`;
        };

        // Interleave results, preferring Mapbox first but including OSM unique results
        const maxResults = 10;
        let mIdx = 0, nIdx = 0;

        while (combined.length < maxResults && (mIdx < mapboxResults.length || nIdx < nominatimResults.length)) {
            // Add from Mapbox
            if (mIdx < mapboxResults.length) {
                const result = mapboxResults[mIdx++];
                const key = getLocationKey(result);
                if (!seen.has(key)) {
                    seen.add(key);
                    combined.push(result);
                }
            }

            // Add from Nominatim
            if (nIdx < nominatimResults.length && combined.length < maxResults) {
                const result = nominatimResults[nIdx++];
                const key = getLocationKey(result);
                if (!seen.has(key)) {
                    seen.add(key);
                    combined.push(result);
                }
            }
        }

        return combined;
    }

    function renderSearchResults(results) {
        elements.searchResults.innerHTML = results.map(result => {
            // Different icon for OSM vs Mapbox results
            const iconColor = result.source === 'osm' ? '#30d158' : 'currentColor';
            return `
                <div class="search-result" data-lng="${result.lng}" data-lat="${result.lat}" data-name="${result.name}">
                    <div class="search-result-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                    </div>
                    <div class="search-result-text">
                        <div class="search-result-name">${result.name}</div>
                        <div class="search-result-detail">${result.detail}</div>
                    </div>
                </div>
            `;
        }).join('');

        elements.searchResults.classList.remove('hidden');
    }

    function selectSearchResult(lng, lat, name) {
        elements.searchInput.value = name;
        elements.searchResults.classList.add('hidden');
        elements.searchClear.classList.remove('hidden');

        map.flyTo({
            center: [lng, lat],
            zoom: 15,
            duration: 1500
        });
    }

    function clearSearch() {
        elements.searchInput.value = '';
        elements.searchResults.classList.add('hidden');
        elements.searchClear.classList.add('hidden');
    }

    // Map Initialization
    function initMap(accessToken) {
        mapboxgl.accessToken = accessToken;

        try {
            map = new mapboxgl.Map({
                container: 'map',
                style: `mapbox://styles/mapbox/${CONFIG.mapStyle}`,
                center: CONFIG.defaultCenter,
                zoom: CONFIG.defaultZoom,
                attributionControl: true,
                pitchWithRotate: false,
                touchZoomRotate: true,
                dragRotate: false
            });

            // Enable touch gestures
            map.touchZoomRotate.enableRotation();
            map.scrollZoom.enable();

            map.on('load', () => {
                initDraw();
                setTimeout(() => map.resize(), 100);
            });

            map.on('error', (e) => {
                if (e.error && e.error.status === 401) {
                    showToast('Invalid API key', 'error');
                }
            });

            // Add zoom controls (hidden on mobile via CSS if needed)
            map.addControl(new mapboxgl.NavigationControl({
                showCompass: false,
                showZoom: true
            }), 'bottom-right');

            map.addControl(new mapboxgl.ScaleControl({
                maxWidth: 100,
                unit: 'metric'
            }), 'bottom-left');

        } catch (error) {
            console.error('Map initialization error:', error);
            showToast('Failed to load map', 'error');
        }
    }

    function initDraw() {
        const drawStyles = [
            {
                'id': 'gl-draw-polygon-fill',
                'type': 'fill',
                'filter': ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
                'paint': {
                    'fill-color': '#0a84ff',
                    'fill-outline-color': '#0a84ff',
                    'fill-opacity': 0.15
                }
            },
            {
                'id': 'gl-draw-polygon-stroke-active',
                'type': 'line',
                'filter': ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
                'layout': { 'line-cap': 'round', 'line-join': 'round' },
                'paint': { 'line-color': '#0a84ff', 'line-width': 3 }
            },
            {
                'id': 'gl-draw-polygon-and-line-vertex-active',
                'type': 'circle',
                'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
                'paint': {
                    'circle-radius': 7,
                    'circle-color': '#ffffff',
                    'circle-stroke-color': '#0a84ff',
                    'circle-stroke-width': 3
                }
            },
            {
                'id': 'gl-draw-polygon-midpoint',
                'type': 'circle',
                'filter': ['all', ['==', 'meta', 'midpoint'], ['==', '$type', 'Point']],
                'paint': {
                    'circle-radius': 5,
                    'circle-color': '#0a84ff',
                    'circle-stroke-color': '#ffffff',
                    'circle-stroke-width': 2
                }
            },
            {
                'id': 'gl-draw-line',
                'type': 'line',
                'filter': ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
                'layout': { 'line-cap': 'round', 'line-join': 'round' },
                'paint': { 'line-color': '#0a84ff', 'line-dasharray': [2, 2], 'line-width': 2 }
            },
            {
                'id': 'gl-draw-point',
                'type': 'circle',
                'filter': ['all', ['==', '$type', 'Point'], ['==', 'meta', 'feature'], ['!=', 'mode', 'static']],
                'paint': {
                    'circle-radius': 7,
                    'circle-color': '#ffffff',
                    'circle-stroke-color': '#0a84ff',
                    'circle-stroke-width': 3
                }
            },
            {
                'id': 'gl-draw-polygon-fill-static',
                'type': 'fill',
                'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'static']],
                'paint': { 'fill-color': '#30d158', 'fill-outline-color': '#30d158', 'fill-opacity': 0.15 }
            },
            {
                'id': 'gl-draw-polygon-stroke-static',
                'type': 'line',
                'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'static']],
                'layout': { 'line-cap': 'round', 'line-join': 'round' },
                'paint': { 'line-color': '#30d158', 'line-width': 3 }
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

        map.on('draw.create', handleDrawUpdate);
        map.on('draw.update', handleDrawUpdate);
        map.on('draw.delete', handleDrawUpdate);
        map.on('draw.selectionchange', handleSelectionChange);

        loadDrawData();
    }

    function handleDrawUpdate() {
        updateAreaDisplay();
        saveDrawData();
    }

    function handleSelectionChange(e) {
        if (e.features.length > 0) {
            elements.drawBtn.classList.remove('active');
        }
    }

    function updateAreaDisplay() {
        const data = draw.getAll();

        if (data.features.length === 0) {
            elements.areaDisplay.textContent = 'Tap Draw to start';
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

    // Actions
    async function handleLocate() {
        if (!navigator.geolocation) {
            showToast('Location not supported', 'error');
            return;
        }

        // Check permission status first (if available)
        if (navigator.permissions) {
            try {
                const permission = await navigator.permissions.query({ name: 'geolocation' });
                if (permission.state === 'denied') {
                    elements.locationModal.classList.remove('hidden');
                    return;
                }
            } catch (e) {
                // Permissions API not fully supported, continue with request
            }
        }

        showToast('Finding location...');
        elements.locateBtn.classList.add('active');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { longitude, latitude } = position.coords;

                if (locationMarker) locationMarker.remove();

                const el = document.createElement('div');
                el.className = 'location-marker';
                locationMarker = new mapboxgl.Marker(el)
                    .setLngLat([longitude, latitude])
                    .addTo(map);

                map.flyTo({
                    center: [longitude, latitude],
                    zoom: 16,
                    duration: 1500
                });

                elements.locateBtn.classList.remove('active');
                showToast('Location found', 'success');
            },
            (error) => {
                elements.locateBtn.classList.remove('active');
                if (error.code === 1) {
                    // Permission denied - show help modal
                    elements.locationModal.classList.remove('hidden');
                } else {
                    const messages = {
                        2: 'Location unavailable',
                        3: 'Location timeout'
                    };
                    showToast(messages[error.code] || 'Location error', 'error');
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }

    function handleDraw() {
        if (draw) {
            draw.changeMode('draw_polygon');
            elements.drawBtn.classList.add('active');
            showToast('Tap to add points');
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
            showToast('Cleared');
        }
    }

    function showCopySuccessModal() {
        // Clear any existing countdown
        if (copyCountdownInterval) {
            clearInterval(copyCountdownInterval);
        }

        let countdown = 10;
        elements.countdownTimer.textContent = countdown;
        elements.copySuccessModal.classList.remove('hidden');

        // Start countdown
        copyCountdownInterval = setInterval(() => {
            countdown--;
            elements.countdownTimer.textContent = countdown;

            if (countdown <= 0) {
                clearInterval(copyCountdownInterval);
                closeTabOrShowMessage();
            }
        }, 1000);
    }

    function closeTabOrShowMessage() {
        // Clear countdown if still running
        if (copyCountdownInterval) {
            clearInterval(copyCountdownInterval);
            copyCountdownInterval = null;
        }

        // Try to close the tab/window
        try {
            window.close();
            // If window.close() didn't work (e.g., not opened by script), update the message
            setTimeout(() => {
                // If we're still here, the close didn't work
                elements.countdownTimer.parentElement.textContent = 'You can now close this tab manually.';
                elements.backToFormBtn.textContent = 'Close Tab';
            }, 100);
        } catch (e) {
            elements.countdownTimer.parentElement.textContent = 'You can now close this tab manually.';
            elements.backToFormBtn.textContent = 'Close Tab';
        }
    }

    function hideCopySuccessModal() {
        if (copyCountdownInterval) {
            clearInterval(copyCountdownInterval);
            copyCountdownInterval = null;
        }
        elements.copySuccessModal.classList.add('hidden');
    }

    async function handleCopy() {
        if (!draw) return;

        const data = draw.getAll();
        const polygons = data.features.filter(f => f.geometry.type === 'Polygon');

        if (polygons.length === 0) {
            showToast('No polygons to copy', 'error');
            return;
        }

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

        let copySuccess = false;

        try {
            await navigator.clipboard.writeText(JSON.stringify(geojson, null, 2));
            copySuccess = true;
        } catch (err) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = JSON.stringify(geojson, null, 2);
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                copySuccess = true;
            } catch (e) {
                showToast('Failed to copy', 'error');
            }
            document.body.removeChild(textarea);
        }

        if (copySuccess) {
            showCopySuccessModal();
        }
    }

    // Event Listeners
    function setupEventListeners() {
        // Search
        elements.searchInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            elements.searchClear.classList.toggle('hidden', !value);

            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => searchLocation(value), 300);
        });

        elements.searchInput.addEventListener('focus', () => {
            if (elements.searchInput.value.trim()) {
                searchLocation(elements.searchInput.value.trim());
            }
        });

        elements.searchClear.addEventListener('click', clearSearch);

        elements.searchResults.addEventListener('click', (e) => {
            const result = e.target.closest('.search-result');
            if (result) {
                selectSearchResult(
                    parseFloat(result.dataset.lng),
                    parseFloat(result.dataset.lat),
                    result.dataset.name
                );
            }
        });

        // Toolbar buttons
        elements.locateBtn.addEventListener('click', handleLocate);
        elements.drawBtn.addEventListener('click', handleDraw);
        elements.clearBtn.addEventListener('click', handleClear);
        elements.copyBtn.addEventListener('click', handleCopy);
        elements.helpBtn.addEventListener('click', () => {
            elements.helpModal.classList.remove('hidden');
        });

        // Back to form button in copy success modal
        elements.backToFormBtn.addEventListener('click', closeTabOrShowMessage);

        // Modal close
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal');
                if (modal.id === 'copy-success-modal') {
                    hideCopySuccessModal();
                } else {
                    modal.classList.add('hidden');
                }
            });
        });

        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', () => {
                const modal = backdrop.closest('.modal');
                if (modal.id === 'copy-success-modal') {
                    hideCopySuccessModal();
                } else {
                    modal.classList.add('hidden');
                }
            });
        });

        // Close search results on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                elements.searchResults.classList.add('hidden');
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
                    if (modal.id === 'copy-success-modal') {
                        hideCopySuccessModal();
                    } else {
                        modal.classList.add('hidden');
                    }
                });
                elements.searchResults.classList.add('hidden');
                elements.searchInput.blur();
            }

            // Don't trigger shortcuts when typing in search
            if (document.activeElement === elements.searchInput) return;

            if (map && !document.querySelector('.modal:not(.hidden)')) {
                if (e.key === 'd' || e.key === 'D') handleDraw();
                if (e.key === 'l' || e.key === 'L') handleLocate();
                if ((e.key === 'c' || e.key === 'C') && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleCopy();
                }
            }
        });
    }

    // Initialize
    function init() {
        setupEventListeners();
        initMap(CONFIG.embeddedApiKey);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
