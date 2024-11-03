// Initialize the map
const map = L.map('map', { zoomControl: false }).setView([40.99, 29.02], 15); // Set initial view to a central location with zoom level 15

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);


// Function to get color based on certainty value
function getColor(certainty) {
    if (certainty >= 90) return '#800026'; // Dark red
    if (certainty >= 70) return '#BD0026'; // Red
    if (certainty >= 50) return '#E31A1C'; // Medium red
    if (certainty >= 30) return '#FC4E2A'; // Light red
    return '#FFEDA0'; // Yellow
}

// Load the CSV data
let catData = []; // Array to hold cat data points
let catMarkers = []; // Array to hold circle markers

d3.csv('cats_cleaned.csv').then(data => {
    data.forEach(d => {
        const lat = parseFloat(d.latitude);
        const lon = parseFloat(d.longitude);
        const certainty = parseFloat(d.certainty);
        //catData.push({ id: d.id, lat, lon, certainty, image_url }); // Store cat data for later use
        catData.push({ ...d, lat, lon });
        // Create a circle marker for each observation
        const marker = L.circleMarker([lat, lon], {
            radius: 8,
            fillColor: "#AAFF00",
            color: '#AAFF00',
            weight: 1,
            opacity: 1,
            fillOpacity: 1
        })
        marker.addTo(map);
        catMarkers.push(marker); // Store the marker in the array

        // Add popup with specified information
        marker.bindPopup(`
            <strong>ID:</strong> ${d.id}<br>
            <strong>Time Observed:</strong> ${new Date(d.time_observed_on).toUTCString()}<br>
            <strong>User:</strong> ${d.user_login}<br>
            <strong>Image:</strong> <img src="${d.image_url}" alt="Cat Image" style="width:100%; height:auto;"><br>
            <strong>Sound:</strong> <a href="${d.sound_url}" target="_blank">Listen</a><br>
            <strong>Description:</strong> ${d.description}<br>
            <strong>Certainty:</strong> ${d.certainty}<br>
            <strong>Place Guess:</strong> ${d.place_guess}<br>
            <strong>Latitude:</strong> ${lat}<br>
            <strong>Longitude:</strong> ${lon}
        `);
    });
        // Hide all markers on page load
        catMarkers.forEach(marker => {
            marker.addTo(map); // Add marker to the map
            map.removeLayer(marker); // Remove marker from the map to hide it
        });
}).catch(error => {
    console.error('Error loading CSV file:', error);
});

// Create a bounding box and cat emojis
let boundingBox;
const catEmoji = '🐱'; // Use a cat emoji for corners
const corners = { nw: null, ne: null, se: null, sw: null };
let isBoundingBoxSelected = false;
let bounds;

// Function to draw the bounding box
function drawBoundingBox(bounds) {
    if (boundingBox) {
        map.removeLayer(boundingBox);
    }
    boundingBox = L.rectangle(bounds, { 
        color: "#ff7800", 
        weight: 2, 
        fillOpacity:0.2,
        interactive: true  // Make bounding box interactive
    }).addTo(map);
    console.log('Bounding box drawn with bounds:', bounds);
    updateMarkersVisibility(bounds); // Update markers visibility based on the new bounds

}

// Function to update the visibility of markers based on bounding box
function updateMarkersVisibility(bounds) {
    catMarkers.forEach(marker => {
        if (bounds.contains(marker.getLatLng())) {
            marker.addTo(map); // Add marker to map if within bounds
        } else {
            map.removeLayer(marker); // Remove marker from map if outside bounds
        }
    });
}



// Function to create corner cat emojis
function createCornerCat(latlng) {
    const cat = L.divIcon({
        className: 'cat-corner',
        html: catEmoji,
        iconSize: [25, 25], // Increase the size of the emoji here
        iconAnchor: [25, 25], // Center the emoji on the marker
    });
    const marker = L.marker(latlng, { icon: cat }).addTo(map);
    console.log('Created corner cat at:', latlng);
    return marker;
}

// Initialize corner emojis
corners.nw = createCornerCat([40.993331, 29.020951]);
corners.ne = createCornerCat([40.993331, 29.024290]);
corners.se = createCornerCat([40.989992, 29.024290]);
corners.sw = createCornerCat([40.989992, 29.020951]);

// Function to update the bounding box based on corner positions
function updateBoundingBox() {
    bounds = L.latLngBounds([corners.sw.getLatLng(), corners.ne.getLatLng()]); // Define bounds using the corner positions
    drawBoundingBox(bounds);
    countCatsInBoundingBox(bounds); // Count points within the bounding box
}
// Function to update the results panel
function updateResultsPanel(catsFound) {
    const catsFoundTitle = document.getElementById('catsFoundTitle');
    const catsList = document.getElementById('catsList');

    catsFoundTitle.textContent = `${catsFound} cats found`; // Update the title with the count
    catsList.innerHTML = ''; // Clear the previous list

    if (catsFound > 0) {
        // Iterate over each cat in the found data and display them
        catData.forEach(cat => {
            if (bounds.contains(L.latLng(cat.lat, cat.lon))) { // Check if cat is within the bounds
                const catEntry = document.createElement('div');
                catEntry.className = 'cat-entry';
                // Create image element
                const catImage = document.createElement('img');
                catImage.src = cat.image_url; // Assuming you have a valid image URL
                catImage.className = 'cat-image';
                
                // Create text container for metadata
                const metadata = document.createElement('div');
                metadata.innerHTML = `
                    <strong>ID:</strong> ${cat.id}<br>
                    <strong>Found at:</strong> ${new Intl.DateTimeFormat('en-GB', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric',
                        timeZone: 'Europe/Istanbul'
                    }).format(new Date(cat.time_observed_at))} Istanbul Time<br>
                    <strong>User:</strong> ${cat.user_login}<br> 
                    <strong>Description:</strong> ${cat.description ? cat.description : "None Provided"}<br>
                    <strong>Certainty of Cat:</strong> ${cat.certainty*100}%<br>
                    <strong>Place Guess:</strong> ${cat.place_guess}<br>
                    <hr>

                `;

                catEntry.appendChild(catImage);
                catEntry.appendChild(metadata);
                catsList.appendChild(catEntry); // Add the entry to the list
            }
        });
    }
}

// Update the counting function to include the updateResultsPanel call
function countCatsInBoundingBox(bounds) {
    const catsFound = catData.filter(cat => {
        return bounds.contains(L.latLng(cat.lat, cat.lon));
    }).length;

    console.log(`${catsFound} cats found!`);
    updateResultsPanel(catsFound); // Update the results panel with found cats
}


// Function to enable dragging the bounding box
function enableBoundingBoxDragging() {
    let isDragging = false;
    let originalMousePosition = null; // Track the original mouse position
    let initialBoundingBoxPositions = null; // Store the initial positions of the bounding box corners

    // Change bounding box color on mouseover
    boundingBox.on('mouseover', () => {
        boundingBox.setStyle({ color: '#000000' }); // Change to highlight color
        console.log('Mouse over bounding box: color changed to black');
    });

    // Revert bounding box color on mouseout
    boundingBox.on('mouseout', () => {
        boundingBox.setStyle({ color: isBoundingBoxSelected ? '#ff0000' : '#ff7800' }); // Change back to original or selected color
        console.log('Mouse out of bounding box: color reverted');
    });

    // Mouse down event for dragging
    boundingBox.on('mousedown', function(e) {
        if (isDragging) return; // Prevent multiple mousedown events

        isDragging = true; // Set dragging flag
        originalMousePosition = e.latlng; // Store the original mouse position
        initialBoundingBoxPositions = {
            nw: corners.nw.getLatLng(),
            ne: corners.ne.getLatLng(),
            se: corners.se.getLatLng(),
            sw: corners.sw.getLatLng()
        }; // Store initial bounding box positions

        console.log('Mousedown on bounding box at:', originalMousePosition);

        // Disable map dragging while dragging the bounding box
        map.dragging.disable();

        function onMouseMove(e) {
            if (!isDragging) return;

            // Calculate the new positions for the corners based on the current mouse position
            const deltaLat = e.latlng.lat - originalMousePosition.lat;
            const deltaLng = e.latlng.lng - originalMousePosition.lng;

            corners.nw.setLatLng([initialBoundingBoxPositions.nw.lat + deltaLat, initialBoundingBoxPositions.nw.lng + deltaLng]);
            corners.ne.setLatLng([initialBoundingBoxPositions.ne.lat + deltaLat, initialBoundingBoxPositions.ne.lng + deltaLng]);
            corners.se.setLatLng([initialBoundingBoxPositions.se.lat + deltaLat, initialBoundingBoxPositions.se.lng + deltaLng]);
            corners.sw.setLatLng([initialBoundingBoxPositions.sw.lat + deltaLat, initialBoundingBoxPositions.sw.lng + deltaLng]);

            // Update bounding box
            updateBoundingBox();

            // Log distances
            console.log('Mouse moved to:', e.latlng);
        }

        function onMouseUp() {
            isDragging = false; // Reset dragging state
            map.off('mousemove', onMouseMove);
            map.dragging.enable(); // Re-enable map dragging
            console.log('Mouse up: dragging stopped');

            // Reattach mouse events to allow for multiple interactions
            enableBoundingBoxDragging();
        }

        map.on('mousemove', onMouseMove);
        map.on('mouseup', onMouseUp);
    });

    // Detect mousedown on the map to enable dragging the map itself
    map.on('mousedown', function(e) {
        if (!isDragging) {
            console.log('Mousedown on map at:', e.latlng);
        }
    });
}

// Initial bounding box setup
updateBoundingBox();
enableBoundingBoxDragging();  // Enable dragging events
