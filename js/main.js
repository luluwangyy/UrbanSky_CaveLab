/**
 * Global JavaScript functions for UrbanSky website
 */

// Global variables
let metadata = {};
let locations = {};

/**
 * Fetch JSON data from file
 * @param {string} url - URL of the JSON file
 * @returns {Promise} - Promise with JSON data
 */
async function fetchJson(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        return null;
    }
}

/**
 * Load metadata and locations data
 * @returns {Promise} - Promise with both metadata and locations
 */
async function loadData() {
    try {
        // Show loading indicator
        document.getElementById('loadingIndicator').style.display = 'flex';
        
        // Fetch metadata and locations in parallel
        const [metadataData, locationsData] = await Promise.all([
            fetchJson('data/metadata.json'),
            fetchJson('data/locations.json')
        ]);
        
        if (metadataData && locationsData) {
            metadata = metadataData;
            locations = locationsData;
            
            // Update capture count in the UI
            updateCaptureCount();
            
            return { metadata, locations };
        }
        
        return null;
    } catch (error) {
        console.error('Error loading data:', error);
        return null;
    } finally {
        // Hide loading indicator
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

/**
 * Update capture count in the UI
 */
function updateCaptureCount() {
    const captureCount = Object.keys(metadata).length;
    
    // Update all elements with capture count
    const countElements = document.querySelectorAll('#captureCount, #captureCount2');
    countElements.forEach(element => {
        if (element) {
            element.textContent = captureCount;
        }
    });
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string (e.g., "April 1, 2025")
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

/**
 * Format time for display
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted time string (e.g., "14:30 UTC")
 */
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
    }) + ' UTC';
}

/**
 * Check if a location is on Columbia campus
 * @param {string} captureId - Capture ID
 * @returns {boolean} - True if on campus, false otherwise
 */
function isOnCampus(captureId) {
    return captureId.startsWith('loc');
}

/**
 * Get campus location from capture ID
 * @param {string} captureId - Capture ID (e.g., "loc0_7")
 * @returns {object} - Location object with location ID and capture number
 */
function parseCampusLocation(captureId) {
    const match = captureId.match(/loc(\d+)_(\d+)/);
    if (match) {
        return {
            locationId: parseInt(match[1]),
            captureNumber: parseInt(match[2])
        };
    }
    return null;
}

/**
 * Get all captures for a specific campus location
 * @param {number} locationId - Location ID (e.g., 0 for "loc0")
 * @returns {array} - Array of capture IDs for the location
 */
function getCapturesForLocation(locationId) {
    return Object.keys(metadata).filter(captureId => {
        const location = parseCampusLocation(captureId);
        return location && location.locationId === locationId;
    });
}

/**
 * Format GPS coordinates for display
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {string} - Formatted GPS coordinates
 */
function formatGPS(lat, lng) {
    return `${lat.toFixed(6)}°, ${lng.toFixed(6)}°`;
}