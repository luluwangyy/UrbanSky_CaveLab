/**
 * JavaScript for the UrbanSky Explore page
 */

// Global variables
let map;
let markers = [];
let currentCaptureId = null;
// Using the existing viewer variable from HTML, not declaring a new one
let manhattanLayer;

// Columbia campus coordinates (approximate)
const COLUMBIA_CENTER = { lat: 40.807677, lng: -73.962402 };

// NYC coordinates (Manhattan)
const NYC_CENTER = { lat: 40.7831, lng: -73.9712 };

// Map zoom levels
const NYC_ZOOM = 12;
const COLUMBIA_ZOOM = 17;

// Manhattan bounds for custom styling
const MANHATTAN_BOUNDS = [
    [40.700292, -74.020380], // Southwest corner
    [40.878112, -73.910599]  // Northeast corner
];

/**
 * Initialize OpenStreetMap when page is loaded
 */
async function initMap() {
    // Load metadata and locations
    const data = await loadData();
    if (!data) {
        console.error('Failed to load data');
        return;
    }
    
    // Create the Leaflet map
    map = L.map('map', {
        center: [NYC_CENTER.lat, NYC_CENTER.lng],
        zoom: NYC_ZOOM,
        zoomControl: true
    });
    
    // Add OpenStreetMap base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
 
    
    // Add map toggle event listeners
    document.getElementById('nycToggle').addEventListener('click', () => setMapView('nyc'));
    document.getElementById('columbiaToggle').addEventListener('click', () => setMapView('columbia'));
    
    // Add markers for all locations
    addMarkersToMap();
    
    // Initialize with a default location if available
    const captureIds = Object.keys(metadata);
    if (captureIds.length > 0) {
        const defaultCaptureId = captureIds[0];
        showCaptureDetails(defaultCaptureId);
        
        // Show the No Data message to guide users
        document.getElementById('noDataMessage').style.display = 'block';
    }
}

 


/**
 * Set map view based on toggle button
 * @param {string} view - 'nyc' or 'columbia'
 */
function setMapView(view) {
    // Update toggle button states
    document.getElementById('nycToggle').classList.toggle('active', view === 'nyc');
    document.getElementById('columbiaToggle').classList.toggle('active', view === 'columbia');
    
    // Set map center and zoom
    if (view === 'columbia') {
        map.setView([COLUMBIA_CENTER.lat, COLUMBIA_CENTER.lng], COLUMBIA_ZOOM);
    } else {
        map.setView([NYC_CENTER.lat, NYC_CENTER.lng], NYC_ZOOM);
    }
}

/**
 * Add markers to the map for all locations using the locations.json file
 */
function addMarkersToMap() {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Process Manhattan locations
    if (locations.manhattan && Array.isArray(locations.manhattan)) {
        locations.manhattan.forEach(location => {
            // Skip if no valid coordinates
            if (!location.coords || location.coords.length < 2) return;
            
            // Get coordinates from the location
            const lat = location.coords[0];
            const lng = location.coords[1];
            
            // Create a custom red circular marker
            const markerOptions = {
                radius: 6,            // Size of the circle
                fillColor: '#FF0000', // Red fill
                color: '#000000',     // Black border
                weight: 1,            // Border thickness
                opacity: 1,           // Border opacity
                fillOpacity: 1        // Fill opacity
            };
            
            const marker = L.circleMarker([lat, lng], markerOptions).addTo(map);
            
            // The "id" field in Manhattan is the capture ID
            const captureId = location.id;
            
            // Add click event listener
            marker.on('click', () => {
                if (captureId && metadata[captureId]) {
                    showCaptureDetails(captureId);
                    
                    // Hide the image row since Manhattan locations have just one capture
                    document.getElementById('imageRowContainer').style.display = 'none';
                    
                    // Hide the No Data message
                    document.getElementById('noDataMessage').style.display = 'none';
                } else {
                    console.log(`No metadata found for capture: ${captureId}`);
                }
            });
            
            // Add a tooltip with location ID if available
            if (location.id) {
                marker.bindTooltip(`Manhattan Location ${location.id}`);
            }
            
            markers.push(marker);
        });
    }
    
    // Process Columbia locations
    if (locations.columbia && Array.isArray(locations.columbia)) {
        locations.columbia.forEach(location => {
            // Skip if no valid coordinates
            if (!location.coords || location.coords.length < 2) return;
            
            // Get coordinates from the location
            const lat = location.coords[0];
            const lng = location.coords[1];
            
            // Create a custom red circular marker
            const markerOptions = {
                radius: 6,            // Size of the circle
                fillColor: '#FF0000', // Red fill
                color: '#000000',     // Black border
                weight: 1,            // Border thickness
                opacity: 1,           // Border opacity
                fillOpacity: 1        // Fill opacity
            };
            
            const marker = L.circleMarker([lat, lng], markerOptions).addTo(map);
            
            // For Columbia, the "captures" array contains the capture IDs
            const captureIds = location.captures || [];
            
            // Add click event listener
            marker.on('click', () => {
                if (captureIds.length > 0) {
                    // Show image row with thumbnails for all captures at this location
                    showImageRow(captureIds);
                    
                    // Show details for the first capture by default
                    if (metadata[captureIds[0]]) {
                        showCaptureDetails(captureIds[0]);
                    }
                    
                    // Hide the No Data message
                    document.getElementById('noDataMessage').style.display = 'none';
                } else {
                    console.log('No captures found for this Columbia location');
                }
            });
            
            // Add a tooltip with location info
            if (captureIds.length > 0) {
                const locationPrefix = captureIds[0].split('_')[0]; // e.g., "loc8"
                marker.bindTooltip(`Columbia Location ${locationPrefix}`);
            }
            
            markers.push(marker);
        });
    }
}


/**
 * Show image row for multiple captures at the same location
 * @param {array} captureIds - Array of capture IDs at the location
 */
function showImageRow(captureIds) {
    const imageRow = document.getElementById('imageRow');
    const imageRowContainer = document.getElementById('imageRowContainer');
    
    // Clear existing thumbnails
    imageRow.innerHTML = '';
    
    // Add thumbnails for each capture
    captureIds.forEach(captureId => {
        const thumbnail = document.createElement('div');
        thumbnail.classList.add('capture-thumbnail');
        
        const img = document.createElement('img');
        img.src = `captures/${captureId}/spherical_thumbnail.jpg`;
        img.alt = `Thumbnail ${captureId}`;
        img.loading = 'lazy';
        
        // Add click event listener
        thumbnail.addEventListener('click', () => {
            showCaptureDetails(captureId);
        });
        
        thumbnail.appendChild(img);
        imageRow.appendChild(thumbnail);
    });
    
    // Show the image row
    imageRowContainer.style.display = 'block';
}

/**
 * Show capture details (spherical, panorama, and interactive images)
 * @param {string} captureId - Capture ID
 */
function showCaptureDetails(captureId) {
    if (!captureId || !metadata[captureId]) return;
    
    currentCaptureId = captureId;
    
    // Update spherical and panorama images
    document.getElementById('sphericalImage').src = `captures/${captureId}/spherical.jpg`;
    document.getElementById('panoramaImage').src = `captures/${captureId}/panorama.jpg`;
    
    // Update metadata display
    updateMetadataDisplay(captureId);
    
    // Initialize or update the interactive viewer
    initInteractiveViewer(captureId);
}

/**
 * Update metadata display for a capture
 * @param {string} captureId - Capture ID
 */
function updateMetadataDisplay(captureId) {
    const captureData = metadata[captureId];
    if (!captureData) return;
    
    // Update basic metadata based on the structure in your metadata.json
    
    // Handle date and time - using date_time field
    if (captureData.date_time) {
        const dateObj = new Date(captureData.date_time);
        document.getElementById('metaDate').textContent = formatDate(captureData.date_time);
        document.getElementById('metaTime').textContent = formatTime(captureData.date_time);
    } else {
        document.getElementById('metaDate').textContent = 'Date not available';
        document.getElementById('metaTime').textContent = 'Time not available';
    }
    
    // Handle GPS coordinates - using gps array [lat, lng]
    if (captureData.gps && Array.isArray(captureData.gps) && captureData.gps.length >= 2) {
        document.getElementById('metaLocation').textContent = formatGPS(
            captureData.gps[0],  // Latitude is first element
            captureData.gps[1]   // Longitude is second element
        );
    } else {
        document.getElementById('metaLocation').textContent = 'Location data not available';
    }
    
    // Handle irradiance - using ghi field
    if (captureData.ghi !== undefined) {
        document.getElementById('metaIrradiance').textContent = 
            `${captureData.ghi.toFixed(2)} W/m²`;
    } else {
        document.getElementById('metaIrradiance').textContent = 'Data not available';
    }
    
    // Update weather table - create a horizontal table with headers in first row
    const weatherSection = document.getElementById('weatherSection');
    
    // Clear previous content
    weatherSection.innerHTML = '';
    
    // Create the source text with link
    const sourceText = document.createElement('div');
    sourceText.className = 'weather-source';
    sourceText.innerHTML = 'Weather (from <a href="https://dev.meteostat.net/python/hourly.html#api" target="_blank">MeteoStat</a>):';
    weatherSection.appendChild(sourceText);
    
    // Update weather table - create a horizontal table
    if (captureData.weather && Array.isArray(captureData.weather) && captureData.weather.length > 0) {
        // Get the first weather entry
        const weatherData = captureData.weather[0];
        
        // Create new table
        const weatherTable = document.createElement('table');
        weatherTable.className = 'weather-table';
        
        // Create header row
        const headerRow = document.createElement('tr');
        
        // Create data row
        const dataRow = document.createElement('tr');
        
        // Add each weather parameter as a column
        const weatherParams = ['temp', 'dwpt', 'rhum', 'prcp', 'snow', 'wdir', 'wspd', 'wpgt', 'pres', 'tsun', 'coco'];
        
        // Add header cells
        weatherParams.forEach(param => {
            const th = document.createElement('th');
            th.textContent = param;
            headerRow.appendChild(th);
        });
        
        // Add data cells
        weatherParams.forEach(param => {
            const td = document.createElement('td');
            const value = weatherData[param];
            td.textContent = value === null ? 'NaN' : value.toFixed(1);
            dataRow.appendChild(td);
        });
        
        // Add rows to table
        weatherTable.appendChild(headerRow);
        weatherTable.appendChild(dataRow);
        
        // Add table to weatherSection
        weatherSection.appendChild(weatherTable);
    } else {
        // Add a message if no weather data is available
        const noDataMsg = document.createElement('p');
        noDataMsg.textContent = 'Weather data not available';
        weatherSection.appendChild(noDataMsg);
    }
}

/**
 * Format weather parameter key for display
 * @param {string} key - Weather parameter key
 * @returns {string} - Formatted key
 */
function formatWeatherKey(key) {
    // Map the weather parameter keys to descriptive names
    const keyMap = {
        'temp': 'Temperature',
        'dwpt': 'Dew Point',
        'rhum': 'Relative Humidity',
        'prcp': 'Precipitation',
        'snow': 'Snow',
        'wdir': 'Wind Direction',
        'wspd': 'Wind Speed',
        'wpgt': 'Wind Gust',
        'pres': 'Pressure',
        'tsun': 'Sunshine Duration',
        'coco': 'Cloud Cover'
    };
    
    return keyMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

/**
 * Format weather parameter value for display
 * @param {string} key - Weather parameter key
 * @param {any} value - Weather parameter value
 * @returns {string} - Formatted value with units
 */
function formatWeatherValue(key, value) {
    if (value === null || value === undefined) return '-';
    
    // Add units based on the parameter
    switch(key) {
        case 'temp':
            return `${value.toFixed(1)} °C`;
        case 'dwpt':
            return `${value.toFixed(1)} °C`;
        case 'rhum':
            return `${value.toFixed(1)}%`;
        case 'prcp':
            return `${value.toFixed(1)} mm`;
        case 'snow':
            return value === null ? '-' : `${value.toFixed(1)} cm`;
        case 'wdir':
            return `${value.toFixed(1)}°`;
        case 'wspd':
            return `${value.toFixed(1)} m/s`;
        case 'wpgt':
            return value === null ? '-' : `${value.toFixed(1)} m/s`;
        case 'pres':
            return `${value.toFixed(1)} hPa`;
        case 'tsun':
            return value === null ? '-' : `${value.toFixed(1)} min`;
        case 'coco':
            return `${value.toFixed(1)} oktas`;
        default:
            if (typeof value === 'number') {
                return value.toFixed(2);
            }
            return value.toString();
    }
}

/**
 * Initialize or update the interactive perspective viewer
 * @param {string} captureId - Capture ID
 */
function initInteractiveViewer(captureId) {
    // Clear the previous viewer container
    document.getElementById('mypanoviewer').innerHTML = '';
    
    // Determine the pano prefix based on captureId
    let panoPrefix;
    
    if (isOnCampus(captureId)) {
        // For campus locations, the format is "loc0_0/loc0_0_"
        panoPrefix = `captures/${captureId}/${captureId}_`;
    } else {
        // For Manhattan locations, the format is "1/1_"
        panoPrefix = `captures/${captureId}/${captureId}_`;
    }
    
    // Create a new viewer instance
    viewer = new PTGuiViewer();
    viewer.setVars({
        pano: panoPrefix,
        format: "14faces"
    });
    
    // Embed the viewer
    viewer.embed("mypanoviewer");
}

// Initialize the map when the DOM is loaded
document.addEventListener('DOMContentLoaded', initMap);