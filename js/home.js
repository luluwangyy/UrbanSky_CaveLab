/**
 * JavaScript for the UrbanSky Homepage
 */

// Global variables
let allCaptureIds = [];
let currentImageIndex = 0;
let autoplayInterval = null;
const AUTOPLAY_INTERVAL_MS = 2000; // 2 seconds -> can set to be 3000 if you want 3 seconds rotation

// DOM elements
const thumbnailGrid = document.getElementById('thumbnailGrid');
const mainImage = document.getElementById('mainSphericalImage');

/**
 * Initialize the homepage
 */
async function initHomepage() {
    // Show loading indicator while data loads
    document.getElementById('loadingIndicator').style.display = 'flex';
    
    // Load metadata and locations
    const data = await loadData();
    if (!data) {
        console.error('Failed to load data');
        document.getElementById('loadingIndicator').style.display = 'none';
        return;
    }
    
    // Get all capture IDs
    allCaptureIds = Object.keys(data.metadata);
    
    // Shuffle the array for random selection
    shuffleArray(allCaptureIds);
    
    
    const displayedCaptureIds = allCaptureIds.slice(0, 120);
    
    // Populate the thumbnail grid
    populateThumbnailGrid(displayedCaptureIds);
    
    // Set initial main image
    updateMainImage(allCaptureIds[0]);
    
    // Start autoplay - using the FULL dataset of images for variety
    startAutoplay();
    
    // Hide loading indicator
    document.getElementById('loadingIndicator').style.display = 'none';
    
    // Handle window resize to adjust the main image height
    window.addEventListener('resize', adjustMainImageHeight);
}

/**
 * Shuffle array in place  
 * @param {array} array - Array to shuffle
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Populate the thumbnail grid with images
 * @param {array} captureIds - Array of capture IDs to display
 */
function populateThumbnailGrid(captureIds) {
    thumbnailGrid.innerHTML = '';
    
    // Determine how many columns based on container width
    const containerWidth = thumbnailGrid.offsetWidth || 600;
    const thumbnailSize = 40; // size of each thumbnail in pixels
    const gap = 1; // gap between thumbnails in pixels
    
    // Calculate optimal number of columns
    const optimalColumns = Math.floor(containerWidth / (thumbnailSize + gap));
    const columns = Math.min(Math.max(optimalColumns, 8), 15); // between 8 and 15 columns
    
    // Set grid columns
    thumbnailGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    
    captureIds.forEach((captureId, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.classList.add('thumbnail');
        thumbnail.style.width = '40px'; // increase this can increase the size of small spheres
        thumbnail.style.height = '40px';
        
        const img = document.createElement('img');
        img.src = `captures/${captureId}/spherical_thumbnail.jpg`;
        img.alt = `Thumbnail ${captureId}`;
        img.loading = 'lazy'; // Lazy load for better performance
        
        // Add click event listener
        thumbnail.addEventListener('click', () => {
            stopAutoplay();
            updateMainImage(captureId);
        });
        
        thumbnail.appendChild(img);
        thumbnailGrid.appendChild(thumbnail);
    });
    
    // Calculate the total height of the grid and adjust the main image
    setTimeout(() => {
        adjustMainImageHeight();
    }, 100);
}

/**
 * Adjust the main image height to match the thumbnail grid height
 */
function adjustMainImageHeight() {
    const gridHeight = thumbnailGrid.offsetHeight;
    
    if (gridHeight > 0) {
        const mainViewContainer = document.querySelector('.main-view');
        const sphericalContainer = document.querySelector('.spherical-container');
        
        if (mainViewContainer && sphericalContainer) {
            // Set the height of the main view to match the grid
            mainViewContainer.style.height = `${gridHeight}px`;
            
            // Make the spherical container a square with the same height
            sphericalContainer.style.width = `${gridHeight}px`;
            sphericalContainer.style.height = `${gridHeight}px`;
            
            // Center the main view vertically
            mainViewContainer.style.display = 'flex';
            mainViewContainer.style.alignItems = 'center';
            
            console.log(`Adjusted main image height to ${gridHeight}px`);
        }
    }
}

/**
 * Update the main spherical image
 * @param {string} captureId - Capture ID
 */
function updateMainImage(captureId) {
    console.log(`Updating main image to: ${captureId}`);
    mainImage.src = `captures/${captureId}/spherical.jpg`;
    mainImage.alt = `Spherical image ${captureId}`;
    
    // Update current index for autoplay
    currentImageIndex = allCaptureIds.indexOf(captureId);
    if (currentImageIndex === -1) {
        // If not found, reset to the first image
        currentImageIndex = 0;
    }
}

/**
 * Start autoplay of main image
 */
function startAutoplay() {
    // Clear any existing interval
    if (autoplayInterval) {
        clearInterval(autoplayInterval);
    }
    
    // Set an interval to change the image
    autoplayInterval = setInterval(() => {
        // Get a random index from the FULL dataset (not just displayed thumbnails)
        currentImageIndex = Math.floor(Math.random() * allCaptureIds.length);
        
        // Update the main image
        updateMainImage(allCaptureIds[currentImageIndex]);
    }, AUTOPLAY_INTERVAL_MS);
    
    console.log('Autoplay started');
}

/**
 * Stop autoplay of main image
 */
function stopAutoplay() {
    if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
        console.log('Autoplay stopped');
    }
}

// Initialize the homepage when the DOM is loaded
document.addEventListener('DOMContentLoaded', initHomepage);

// Restart autoplay if the page becomes visible again
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        startAutoplay();
    } else {
        stopAutoplay();
    }
});