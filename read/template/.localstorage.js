(function() {
    // Function to set zoom level from a provided zoom value
    function setZoomLevel(zoomLevel) {
        document.body.style.transform = `scale(${zoomLevel})`;
        document.body.style.transformOrigin = '0 0'; // Keeps zoomed content aligned
        document.body.style.width = `${100 / zoomLevel}%`; // Keeps content within the screen bounds
    }

    // Function to get and store the current zoom level in localStorage
    function getZoomLevel() {
        const currentZoom = window.devicePixelRatio || 1; // Get the current zoom level
        localStorage.setItem('zoomLevel', currentZoom);
        return currentZoom;
    }

    // Run once: Set the zoom level from localStorage (if exists)
    function initializeZoom() {
        const savedZoom = localStorage.getItem('zoomLevel');
        if (savedZoom) {
            setZoomLevel(parseFloat(savedZoom));
        } else {
            const currentZoom = getZoomLevel();
            setZoomLevel(currentZoom); // Apply the detected zoom level initially
        }
    }

    // Update the zoom level whenever the window is resized (user zooms in/out)
    window.addEventListener('resize', getZoomLevel);

    // Initialize the zoom level when the script loads
    initializeZoom();
})();