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
        mapStyle: 'satellite-streets-v12',
        langStorageKey: 'polygon-drawer-lang'
    };

    // Translations
    const translations = {
        en: {
            // Search
            searchPlaceholder: 'Search location',
            noLocationsFound: 'No locations found',

            // Toolbar buttons
            locate: 'Locate',
            draw: 'Draw',
            clear: 'Clear',
            finish: 'Finish',
            help: 'Help',
            locateTitle: 'My Location',
            drawTitle: 'Draw polygon',
            clearTitle: 'Clear all',
            finishTitle: 'Finish and copy GeoJSON',
            helpTitle: 'Help',

            // Info panel
            tapToStart: 'Tap Draw to start',
            area: 'Area',

            // Location modal
            enableLocation: 'Enable Location',
            locationBlocked: 'Location access is blocked. You can either enable it in your browser settings, or use the <strong>Search bar</strong> to find your restoration site.',
            locationAlternative: '<strong>Alternative:</strong> Close this and use the search bar at the top to find your location by name.',
            toEnableLocation: 'To enable location access:',
            iosInstructions: 'Settings → Safari → Location → Allow',
            androidInstructions: 'Tap the lock icon in browser → Permissions → Location → Allow',
            desktopInstructions: 'Click the lock/info icon in the address bar → Location → Allow',

            // Help modal
            howToUse: 'How to Use',
            helpStep1Title: 'Find Your Location',
            helpStep1Desc: 'Tap <strong>Locate</strong> to jump to your current position, or use the <strong>Search bar</strong> to find your restoration site.',
            helpStep2Title: 'Draw the Restoration Area',
            helpStep2Desc: 'Tap <strong>Draw</strong>, then tap points around your restoration area. Connect the last point to the first to close the shape.',
            helpStep3Title: 'Finish & Return',
            helpStep3Desc: 'Tap <strong>Finish</strong> to copy the polygon data and return to the form where you can paste it.',
            helpNote: 'Made a mistake? Tap <strong>Clear</strong> to remove all drawings and start over.',

            // Copy success modal
            polygonCopied: 'Polygon Copied!',
            copySuccessMessage: 'You have successfully copied your polygon. You will now be redirected back to the form where you can paste the GeoJSON.',
            closingIn: 'Closing in',
            seconds: 'seconds',
            backToForm: 'Back to Form',
            closeTabManually: 'You can now close this tab manually.',
            closeTab: 'Close Tab',

            // Toast messages
            locationNotSupported: 'Location not supported',
            findingLocation: 'Finding location...',
            locationFound: 'Location found',
            locationUnavailable: 'Location unavailable',
            locationTimeout: 'Location timeout',
            locationError: 'Location error',
            noPolygonsToCopy: 'No polygons to copy',
            failedToCopy: 'Failed to copy',
            clearedAll: 'Cleared all',
            nothingToClear: 'Nothing to clear',
            tapToAddPoints: 'Tap to add points'
        },
        nl: {
            // Search
            searchPlaceholder: 'Zoek locatie',
            noLocationsFound: 'Geen locaties gevonden',

            // Toolbar buttons
            locate: 'Locatie',
            draw: 'Teken',
            clear: 'Wissen',
            finish: 'Klaar',
            help: 'Help',
            locateTitle: 'Mijn Locatie',
            drawTitle: 'Teken polygoon',
            clearTitle: 'Alles wissen',
            finishTitle: 'Klaar en kopieer GeoJSON',
            helpTitle: 'Help',

            // Info panel
            tapToStart: 'Tik op Teken om te starten',
            area: 'Oppervlakte',

            // Location modal
            enableLocation: 'Locatie Inschakelen',
            locationBlocked: 'Locatietoegang is geblokkeerd. Je kunt dit inschakelen in je browserinstellingen, of gebruik de <strong>Zoekbalk</strong> om je herstellocatie te vinden.',
            locationAlternative: '<strong>Alternatief:</strong> Sluit dit en gebruik de zoekbalk bovenaan om je locatie op naam te vinden.',
            toEnableLocation: 'Om locatietoegang in te schakelen:',
            iosInstructions: 'Instellingen → Safari → Locatie → Toestaan',
            androidInstructions: 'Tik op het slotje in de browser → Machtigingen → Locatie → Toestaan',
            desktopInstructions: 'Klik op het slot/info-icoon in de adresbalk → Locatie → Toestaan',

            // Help modal
            howToUse: 'Gebruiksaanwijzing',
            helpStep1Title: 'Vind Je Locatie',
            helpStep1Desc: 'Tik op <strong>Locatie</strong> om naar je huidige positie te gaan, of gebruik de <strong>Zoekbalk</strong> om je herstellocatie te vinden.',
            helpStep2Title: 'Teken het Herstelgebied',
            helpStep2Desc: 'Tik op <strong>Teken</strong>, tik dan punten rondom je herstelgebied. Verbind het laatste punt met het eerste om de vorm te sluiten.',
            helpStep3Title: 'Klaar & Terug',
            helpStep3Desc: 'Tik op <strong>Klaar</strong> om de polygoongegevens te kopiëren en terug te keren naar het formulier waar je het kunt plakken.',
            helpNote: 'Foutje gemaakt? Tik op <strong>Wissen</strong> om alle tekeningen te verwijderen en opnieuw te beginnen.',

            // Copy success modal
            polygonCopied: 'Polygoon Gekopieerd!',
            copySuccessMessage: 'Je hebt je polygoon succesvol gekopieerd. Je wordt nu teruggeleid naar het formulier waar je de GeoJSON kunt plakken.',
            closingIn: 'Sluit over',
            seconds: 'seconden',
            backToForm: 'Terug naar Formulier',
            closeTabManually: 'Je kunt dit tabblad nu handmatig sluiten.',
            closeTab: 'Sluit Tabblad',

            // Toast messages
            locationNotSupported: 'Locatie niet ondersteund',
            findingLocation: 'Locatie zoeken...',
            locationFound: 'Locatie gevonden',
            locationUnavailable: 'Locatie niet beschikbaar',
            locationTimeout: 'Locatie timeout',
            locationError: 'Locatiefout',
            noPolygonsToCopy: 'Geen polygonen om te kopiëren',
            failedToCopy: 'Kopiëren mislukt',
            clearedAll: 'Alles gewist',
            nothingToClear: 'Niets om te wissen',
            tapToAddPoints: 'Tik om punten toe te voegen'
        }
    };

    let currentLang = localStorage.getItem(CONFIG.langStorageKey) || 'en';

    let map = null;
    let draw = null;
    let locationMarker = null;
    let searchTimeout = null;
    let currentSearchId = 0; // Track search requests to ignore stale results

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
        toast: document.getElementById('toast'),
        langToggle: document.getElementById('lang-toggle'),
        langCode: document.querySelector('.lang-code'),
        langFlag: document.querySelector('.lang-flag'),
        searchLoading: document.getElementById('search-loading')
    };

    let copyCountdownInterval = null;

    // Translation Functions
    function t(key) {
        return translations[currentLang][key] || translations['en'][key] || key;
    }

    function applyTranslations() {
        // Update lang code and flag display
        elements.langCode.textContent = currentLang.toUpperCase();
        // Use flag emojis: UK for English, Netherlands for Dutch
        elements.langFlag.textContent = currentLang === 'nl' ? '\u{1F1F3}\u{1F1F1}' : '\u{1F1EC}\u{1F1E7}';
        document.documentElement.lang = currentLang;

        // Update elements with data-i18n attribute (text content)
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[currentLang][key]) {
                el.textContent = translations[currentLang][key];
            }
        });

        // Update elements with data-i18n-html attribute (innerHTML for bold text etc)
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            if (translations[currentLang][key]) {
                el.innerHTML = translations[currentLang][key];
            }
        });

        // Update elements with data-i18n-placeholder attribute
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (translations[currentLang][key]) {
                el.placeholder = translations[currentLang][key];
            }
        });

        // Update elements with data-i18n-title attribute
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            if (translations[currentLang][key]) {
                el.title = translations[currentLang][key];
            }
        });
    }

    function toggleLanguage() {
        currentLang = currentLang === 'en' ? 'nl' : 'en';
        localStorage.setItem(CONFIG.langStorageKey, currentLang);
        applyTranslations();
    }

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
            elements.searchLoading.classList.add('hidden');
            return;
        }

        // Increment search ID to track this request
        const thisSearchId = ++currentSearchId;

        // Show loading spinner and hide old results
        elements.searchLoading.classList.remove('hidden');
        elements.searchResults.classList.add('hidden');

        try {
            // Search both Mapbox and Nominatim (OpenStreetMap) in parallel
            const [mapboxResults, nominatimResults] = await Promise.all([
                searchMapbox(query),
                searchNominatim(query)
            ]);

            // Ignore results if a newer search has started
            if (thisSearchId !== currentSearchId) {
                return;
            }

            // Hide loading spinner
            elements.searchLoading.classList.add('hidden');

            // Combine and deduplicate results
            const combined = combineSearchResults(mapboxResults, nominatimResults);

            if (combined.length > 0) {
                renderSearchResults(combined);
            } else {
                elements.searchResults.classList.add('hidden');
                showToast(t('noLocationsFound'), 'info');
            }
        } catch (error) {
            // Ignore errors from stale searches
            if (thisSearchId !== currentSearchId) {
                return;
            }
            console.error('Search error:', error);
            elements.searchLoading.classList.add('hidden');
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
        elements.searchLoading.classList.add('hidden');
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
            showToast(t('locationNotSupported'), 'error');
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

        showToast(t('findingLocation'));
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
                showToast(t('locationFound'), 'success');
            },
            (error) => {
                elements.locateBtn.classList.remove('active');
                if (error.code === 1) {
                    // Permission denied - show help modal
                    elements.locationModal.classList.remove('hidden');
                } else {
                    const messages = {
                        2: t('locationUnavailable'),
                        3: t('locationTimeout')
                    };
                    showToast(messages[error.code] || t('locationError'), 'error');
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }

    function handleDraw() {
        if (draw) {
            draw.changeMode('draw_polygon');
            elements.drawBtn.classList.add('active');
            showToast(t('tapToAddPoints'));
        }
    }

    function handleClear() {
        if (draw) {
            const data = draw.getAll();
            if (data.features.length === 0) {
                showToast(t('nothingToClear'));
                return;
            }
            draw.deleteAll();
            updateAreaDisplay();
            saveDrawData();
            showToast(t('clearedAll'));
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
                elements.countdownTimer.parentElement.textContent = t('closeTabManually');
                elements.backToFormBtn.textContent = t('closeTab');
            }, 100);
        } catch (e) {
            elements.countdownTimer.parentElement.textContent = t('closeTabManually');
            elements.backToFormBtn.textContent = t('closeTab');
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
            showToast(t('noPolygonsToCopy'), 'error');
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
                showToast(t('failedToCopy'), 'error');
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

        // Language toggle
        elements.langToggle.addEventListener('click', toggleLanguage);

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
        applyTranslations();
        setupEventListeners();
        initMap(CONFIG.embeddedApiKey);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
