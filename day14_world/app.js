// Initialize Map ////////////////////////////////////////////////////////////////////////////////////////

// Access token for your Mapbox API key
//const mapboxToken = process.env.MAPBOX_API_KEY;
//const mapboxStyleUrl = process.env.MAPBOX_STYLE_URL;
mapboxToken = 'pk.eyJ1IjoiamFhbmVrYS1yYXN0ZXIiLCJhIjoiY20zdDN3bTllMDUwZjJrcjAyaGg4NWpoYSJ9.tnQGSL1nwQuqyPPezqNaSg'
mapboxStyleUrl = 'mapbox://styles/jaaneka-raster/cm3t3yvur002n01qu3ojc7cz4'
const satelliteStyleUrl = 'mapbox://styles/mapbox/satellite-v9'; // Satellite style URL

mapboxgl.accessToken = mapboxToken;

//console.log('Mapbox API Key:', process.env.MAPBOX_API_KEY);
//console.log('Mapbox Style URL:', process.env.MAPBOX_STYLE_URL);

// Create the map object and set the style to your custom Mapbox Studio style URL
const map = new mapboxgl.Map({
  container: 'map', // The container where the map will be displayed
  style: mapboxStyleUrl, // Replace with your own style URL
  center: [-77.0369,38.9072], // Set the initial map center [longitude, latitude]
  zoom: 12.23 // Set the initial zoom level
});

let isSatelliteView = false; // Track the current style
const currentMapButton = document.getElementById('currentMapButton');
const satelliteMapButton = document.getElementById('satelliteMapButton');
const cloudOverlay = document.getElementById('cloudOverlay'); // The cloud overlay element

let isTransitioning = false; // Flag to track transition state

// Marker Control ////////////////////////////////////////////////////////////////////////////////////////

// Set marker colors here
const colors = {
    main: '#f1d5d5', // Main color for the square
    glow: '#fc0000', // Glow color
};

// Global variable to hold user points data
let userPointsData = {
    type: 'FeatureCollection',
    features: [] // This will hold all the points added by the user
};

// Function to generate a PNG image using canvas with rounded square, glowing halo, and line
function createMarkerImage() {
    const { main, glow } = colors; // Destructure colors

    // Create a canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions (50x50 pixels)
    const size = 50;
    canvas.width = size;
    canvas.height = size;

    // Draw glowing halo (larger circle)
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 + 5, 0, 2 * Math.PI);
    ctx.fillStyle = glow;
    ctx.globalAlpha = 0.5; // Glow effect opacity
    ctx.fill();

    // Draw rounded square
    const squareSize = 30; // Adjust size of the square
    const padding = 10;
    ctx.beginPath();
    ctx.rect(padding, padding, squareSize, squareSize);
    ctx.fillStyle = main;
    ctx.globalAlpha = 1; // Solid color for the square
    ctx.fill();

    // Draw the glowing line on top of the square (fading with distance)
    const lineHeight = 0;
    ctx.beginPath();
    ctx.moveTo(size / 2, padding - lineHeight); // Starting point of line
    ctx.lineTo(size / 2, padding);             // Ending point of line
    ctx.lineWidth = 10;
    ctx.strokeStyle = glow;
    ctx.globalAlpha = 0.8; // Glow opacity
    ctx.stroke();

    // Convert canvas to Image object
    const image = new Image();
    image.src = canvas.toDataURL('image/png'); // You can use 'image/jpg' if preferred
    return image;
}

map.on('load', () => {
    // Create the initial image
    const initialImage = createMarkerImage();

    // Ensure the image is loaded before adding to the map
    initialImage.onload = () => {
        map.addImage('rounded-square', initialImage);

        // Add GeoJSON source and layers
        if (!map.getSource('user-points')) {
            map.addSource('user-points', {
                type: 'geojson',
                data: userPointsData, // Your GeoJSON data
            });
        }

        map.addLayer({
            id: 'user-points-layer',
            type: 'symbol',
            source: 'user-points',
            layout: {
                'icon-image': 'rounded-square',
                'icon-size': 0.5,
                'icon-anchor': 'center',
            },
        });
    };
});

// Function to add or update the user-points layer (GeoJSON source)
// Function to add or update the user-points layer (GeoJSON source)
function addUserPointsLayer(mainColor = '#ffffff', glowColor = '#8b0000') {
    // Ensure the GeoJSON source exists or update its data
    if (!map.getSource('user-points')) {
        map.addSource('user-points', {
            type: 'geojson',
            data: userPointsData, // This now references the empty or updated FeatureCollection
        });
    } else {
        map.getSource('user-points').setData(userPointsData); // Update the data if source exists
    }

    // Add the glow layer if it doesn't exist
    if (!map.getLayer('user-points-layer-glow')) {
        map.addLayer({
            id: 'user-points-layer-glow',
            type: 'circle',
            source: 'user-points',
            paint: {
                'circle-radius': 10,     // Larger radius for glow
                'circle-color': glowColor,
                'circle-opacity': 0.4,  // Reduced opacity for glow effect
                'circle-blur': 0.8,     // More blur for the glow effect
            },
        });
    } else {
        // Update glow layer color dynamically
        map.setPaintProperty('user-points-layer-glow', 'circle-color', glowColor);
    }

    // Create or update the custom marker image
    const markerImage = createMarkerImage(mainColor, glowColor);
    markerImage.onload = () => {
        if (!map.hasImage('rounded-square')) {
            map.addImage('rounded-square', markerImage);
        } else {
            map.updateImage('rounded-square', markerImage);
        }

        // Add or update the main symbol layer for square markers
        if (!map.getLayer('user-points-layer')) {
            map.addLayer({
                id: 'user-points-layer',
                type: 'symbol',
                source: 'user-points',
                layout: {
                    'icon-image': 'rounded-square', // Use the custom image
                    'icon-size': 0.5,              // Adjust size as needed
                    'icon-anchor': 'center',
                },
            });
        }
    };
}

// Function to dynamically update point styles
function updatePointStyle(mainColor, glowColor) {
    // Create the updated image
    const updatedImage = createMarkerImage(mainColor, glowColor);

    // Ensure the image is loaded before updating the map
    updatedImage.onload = () => {
        map.updateImage('rounded-square', updatedImage);

        // Update the glow layer color dynamically
        if (map.getLayer('user-points-layer-glow')) {
            map.setPaintProperty('user-points-layer-glow', 'circle-color', glowColor);
        }
    };
}

// Example function to add a new marker (to simulate new marker creation)
function addNewMarker(lat, lng) {
    const newMarker = {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [lng, lat]
        },
        properties: {
            title: "New Marker",
            description: "A description of the new marker"
        }
    };

    // Add the new marker to the FeatureCollection
    userPointsData.features.push(newMarker);

    // After adding a new marker, we need to update the source with the new data
    if (map.getSource('user-points')) {
        map.getSource('user-points').setData(userPointsData);
    }
}

// Add a new point when the user clicks on the map
map.on('click', function (e) {
    const coordinates = e.lngLat;
    const newPoint = {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [coordinates.lng, coordinates.lat]
        },
        properties: {
            type: 'user-point' // You can add custom properties here
        }
    };

    // Add the new point to the userPointsData
    userPointsData.features.push(newPoint);

    // Update the source with the new point
    addUserPointsLayer(); // This will update the source with the new point

    // Optionally, you can show a popup for the newly added point
    // new mapboxgl.Popup()
    //     .setLngLat(coordinates)
    //     .setHTML('<strong>Custom Point</strong><br>Coordinates: ' + coordinates.lng + ', ' + coordinates.lat)
    //     .addTo(map);
});

// Update the style of points when clicked
map.on('click', 'user-points-layer', function (e) {
    // You can change the color and glow dynamically based on the click
    updatePointStyle('#000000', '#ffffff'); // Example: Red color with glow
});


// Ensure points layer is added and persists on style switch
function updateMapStyle(styleUrl) {
    map.setStyle(styleUrl);
    map.once('styledata', () => {
        addUserPointsLayer(); // Re-add user points layer after style change
        // console.log("i added user points again")
    });
}

// Function to completely remove markers from the map and reset the FeatureCollection
function clearMarkers() {
    // Check if the source and layers exist before attempting to remove them
    if (map.getLayer('user-points-layer')) {
        map.removeLayer('user-points-layer');
    }
    
    if (map.getLayer('user-points-layer-glow')) {
        map.removeLayer('user-points-layer-glow');
    }

    if (map.getSource('user-points')) {
        // Remove the source (which holds the GeoJSON data)
        map.removeSource('user-points');
    }
    
    // Reset the GeoJSON data to an empty FeatureCollection
    userPointsData = {
        "type": "FeatureCollection",
        "features": []
    };

    // console.log('Markers and layers removed from the map.');
}

// Add the "Clear Markers" functionality
function addClearMarkersButton() {
    const button = document.getElementById('clear-markers-button');
    
    // Add event listener to clear markers when clicked
    button.addEventListener('click', () => {
        clearMarkers(); // Call the function to remove markers
    });
}

// Call this function to add the button once the map is loaded
map.on('load', () => {
    addClearMarkersButton();
});


// Function to handle adding points to the map
map.on('click', function (e) {
    const coords = e.lngLat;
    const newPoint = {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [coords.lng, coords.lat]
        },
        properties: {}
    };

    // Add new point to the global data (for persistence)
    userPointsData.features.push(newPoint);

    // Check if the source exists, and if it does, update its data
    const source = map.getSource('user-points');
    if (source) {
        source.setData(userPointsData);
    } else {
        console.error("GeoJSON source not found");
    }

    // Optional: Popup for the added point
    // const popup = new mapboxgl.Popup({ offset: 25 })
    //     .setLngLat([coords.lng, coords.lat])
    //     .setHTML('<strong>Custom Point</strong><br>Coordinates: ' + coords.lng + ', ' + coords.lat)
    //     .addTo(map);
});




// Map Style Controls ////////////////////////////////////////////////////////////////////////////////////////

// Event listener for the current map button (custom style)
currentMapButton.addEventListener('click', () => {
    if (isSatelliteView) {
        cloudOverlay.style.opacity = 1;
        updateMapStyle(mapboxStyleUrl); // Switch to custom style
        isSatelliteView = false;

        currentMapButton.classList.add('active');
        satelliteMapButton.classList.remove('active');

        // Fade out the cloud overlay
        setTimeout(() => {
            cloudOverlay.style.opacity = 0;
        }, 2000);
    }
});

// Event listener for the satellite map button
satelliteMapButton.addEventListener('click', () => {
    if (!isSatelliteView) {
        cloudOverlay.style.opacity = 1;
        updateMapStyle(satelliteStyleUrl); // Switch to satellite style
        isSatelliteView = true;

        satelliteMapButton.classList.add('active');
        currentMapButton.classList.remove('active');

        // Fade out the cloud overlay
        setTimeout(() => {
            cloudOverlay.style.opacity = 0;
        }, 2000);
    }
});

// Event listener for fetching map data ////////////////////////////////////////////////////////////////////////////////////////

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.open('mapbox-cache').then((cache) => {
            return cache.match(event.request).then((response) => {
                return response || fetch(event.request).then((fetchedResponse) => {
                    cache.put(event.request, fetchedResponse.clone());
                    return fetchedResponse;
                });
            });
        })
    );
});

// Cloud transition ////////////////////////////////////////////////////////////////////////////////////////

function applyCloudTransition(callback) {
    if (isTransitioning) return; // If a transition is in progress, exit the function
    
    isTransitioning = true; // Set the flag to true to indicate transition is in progress
    
    const cloudOverlay = document.getElementById('cloudOverlay');
    cloudOverlay.style.opacity = 1; // Show the clouds (start the transition)

    // Trigger the callback function (e.g., map style change, center change, etc.)
    if (callback && typeof callback === 'function') {
        callback(); // Execute the callback (e.g., change map style or center)
    }

    // Delay fade-out after transition, adjusting for your specific timing needs
    setTimeout(() => {
        cloudOverlay.style.opacity = 0; // Fade out the clouds
        isTransitioning = false; // Reset the flag to allow future transitions
    }, 2500); // Adjust this delay to match your transition timing
}

// Reset map view on click ////////////////////////////////////////////////////////////////////////////////////////

// Function to reset map view
function resetMapView(lat, lng, zoom) {
    applyCloudTransition(() => {
        // Wait for 200ms before setting the map center and zoom
        setTimeout(() => {
            map.setCenter([lng, lat]);  // Set the center (longitude, latitude)
            map.setZoom(zoom);          // Set the zoom level
        }, 200); // Wait for 200ms before setting the center and zoom
    });
}
document.getElementById('buttons').addEventListener('click', function(event) {
    // Check if the clicked element is a button
    if (event.target && event.target.matches('.button')) {
        // Remove the 'active' class from all buttons
        const buttons = document.querySelectorAll('.button');
        buttons.forEach(button => button.classList.remove('active'));
        
        // Add the 'active' class to the clicked button
        event.target.classList.add('active');
    }
});

// Function to reset the map to the user's location
function resetMapToUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLongitude = position.coords.longitude;
                const userLatitude = position.coords.latitude;

                applyCloudTransition(() => {
                    // Wait for 200ms before setting the map center and zoom
                    setTimeout(() => {
                        // Fly the map to the user's location
                        map.flyTo({
                            center: [userLongitude, userLatitude],
                            zoom: 12, // Adjust zoom level as desired
                            essential: true // Ensures smooth animation
                        });
                    }, 2500); // Wait for 200ms before setting the center and zoom
                });

            },
            (error) => {
                alert('Unable to retrieve your location. Make sure location services are enabled.');
                console.error(error);
            }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
    }
}

// Add event listener to the button
document.getElementById('button-nav').addEventListener('click', resetMapToUserLocation);

document.getElementById('button-hylia').addEventListener('click', function() {
    resetMapView(-40.2227459, -72.4110606, 10.22);
});

document.getElementById('button-gerudo').addEventListener('click', function() {
    resetMapView(15.8929, 48.6987, 10.56); 
    });

document.getElementById('button-lon').addEventListener('click', function() {
    resetMapView(27.50767, -97.88502, 12.27); 
    });

document.getElementById('button-kokiri').addEventListener('click', function() {
    resetMapView(25.405142, 90.392385, 12.27); 
    });
document.getElementById('button-woods').addEventListener('click', function() {
    resetMapView(48.576677, 8.293948, 10.88); 
    });
document.getElementById('button-castle').addEventListener('click', function() {
    resetMapView(35.02071, 135.76545, 12); 
    });
document.getElementById('button-mountain').addEventListener('click', function() {
    resetMapView(-1.5683, 29.2483, 11.52); 
    });

//lake hylia: 13.0261, 14.5505, 10.22 (lake chad, chad)
//gerudo valley: 10.56/15.8929/48.6987 (hadramout, yemen)
//death mountain: 11.52/-1.5683/29.2483 (nyiragongo, DRC)
//lost woods: 10.88/48.9157/13.2556 (black forest, germany)
//lon lon ranch: 12.27/27.50767/-97.88502 (king ranch, texas)
//hyrule castle: 13.24/35.02071/135.76545 (kyoto, japan)
//kokiri forest: 9.56/27.5501/96.4487 (miao,,arunachal pradesh, india)

// Time and Temperature Controls ////////////////////////////////////////////////////////////////////////////////////////

const proxyUrl = 'https://corsproxy.io/?';
const apiUrl = 'http://worldtimeapi.org/api/timezone/Etc/GMT.json';

const url = `${proxyUrl}${encodeURIComponent(apiUrl)}`;

// Function to calculate the time zone offset based on longitude
function getTimeZoneOffset(longitude) {
    // Each 15 degrees of longitude corresponds to 1 hour of time offset from UTC
    let offset = Math.floor(longitude / 15);

    // Check for Daylight Saving Time (DST)
    const currentDate = new Date();
    const isDST = isDaylightSavingTime(currentDate);

    // If DST is in effect, adjust the offset by 1 hour
    if (isDST) {
        offset += 1;
    }

    return offset;
}

// Simple function to determine if DST is in effect (March to November for simplicity)
function isDaylightSavingTime(date) {
    const month = date.getMonth() + 1; // months are zero-indexed (0-11)
    return month >= 3 && month <= 11; // Assume DST is in effect between March and November
}

// Function to fetch and display time with the adjusted time zone
async function getCurrentTime(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching time: ${response.status}`);
        }
        const data = await response.json();
        const rawTime = data.current_weather.time; // ISO string format

        // Convert to a user-friendly format
        const datetime = new Date(rawTime);

        // Calculate the time zone offset and apply it
        const timeZoneOffset = getTimeZoneOffset(lon);
        datetime.setHours(datetime.getHours() + timeZoneOffset);

        // Formatting options for time display
        const options = { 
            hour: '2-digit', minute: '2-digit', hour12: true,
            
        };

        let formattedTime = datetime.toLocaleString('en-GB', options).replace(',', '').replace(/\//g, ' ');
        formattedTime = formattedTime.replace('am', 'AM').replace('pm', 'PM');
        
        // Display the formatted time
        document.getElementById("time").innerText = `${formattedTime}`;
    } catch (error) {
        console.error("Failed to fetch time:", error);
        document.getElementById("time").innerText = "Could not fetch time.";
    }
}

//day: '2-digit', month: 'short', year: 'numeric'

// Function to fetch and display temperature
async function fetchTemperature(lat, lon) {
    try {
        // Fetch data from Open-Meteo
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await response.json();

        // Get the current temperature
        const temperatureC = data.current_weather.temperature;
        const temperatureF = (temperatureC * 9/5) + 32;

        // Display the temperature below the time
        document.getElementById('temperature').innerHTML = `${temperatureC}°C | ${temperatureF.toFixed(1)}°F`;
    } catch (error) {
        console.error("Error fetching temperature data:", error);
        document.getElementById('temperature').innerHTML = "Temperature: N/A";
    }
}

// Function to update both time and temperature for the map's center
function updateMapInfo() {
    const center = map.getCenter(); // Get the current map center
    // Update time and temperature for the center point
    getCurrentTime(center.lat, center.lng); 
    fetchTemperature(center.lat, center.lng);
}

// Initial update of time and temperature
updateMapInfo();

// Update time and temperature whenever the map is moved
map.on('moveend', updateMapInfo);

// Custom Cursor ////////////////////////////////////////////////////////////////////////////////////////

// Create the custom cursor element dynamically
const cursor = document.createElement('div');
cursor.classList.add('custom-cursor');
document.body.appendChild(cursor);

// Add corner triangles
const topRight = document.createElement('div');
topRight.classList.add('top-right');
cursor.appendChild(topRight);

const bottomLeft = document.createElement('div');
bottomLeft.classList.add('bottom-left');
cursor.appendChild(bottomLeft);

// Update cursor position on mouse movement
document.body.addEventListener('mousemove', (event) => {
    cursor.style.left = `${event.pageX - cursor.offsetWidth / 2}px`;
    cursor.style.top = `${event.pageY - cursor.offsetHeight / 2}px`;
});

// Create a popup element dynamically
const popup = document.createElement('div');
popup.className = 'popup';
document.body.appendChild(popup);

// Map mousemove event
map.on('mousemove', (e) => {
    const layers = ['Transit points', 'Shrines']; // Layers to check
    const features = map.queryRenderedFeatures(e.point, { layers });

    if (features.length > 0) {
        const feature = features[0];
        const popupText = feature.properties.name; // Get property from feature

        // Show the popup
        popup.style.display = 'block';
        popup.innerHTML = `<strong>${popupText}</strong>`;
        popup.style.left = `${e.originalEvent.pageX + 50}px`;
        popup.style.top = `${e.originalEvent.pageY - 25}px`;

        // Change triangle colors based on layer
        if (feature.layer.id === 'Transit points') {
            cursor.style.setProperty('--triangle-color', 'rgba(19, 233, 97, 0.8)'); // Green
            popup.style.color = 'rgba(19, 233, 97, 0.8)'; // Green for Transit points
        } else if (feature.layer.id === 'Shrines') {
            cursor.style.setProperty('--triangle-color', 'rgba(79, 185, 224, 0.8)'); // Blue
            popup.style.color = 'rgba(79, 185, 224, 0.8)'; // Blue for Shrines
        }

        // Adjust cursor to larger square
        cursor.style.width = '50px';
        cursor.style.height = '50px';
        cursor.classList.add('active', 'expanded');
        map.getCanvas().style.cursor = 'none'; // Hide default cursor

    } else {
        // Hide the popup and reset cursor
        popup.style.display = 'none';
        resetCursor();
    }
});

// Map mouseleave event for Transit points
map.on('mouseleave', 'Transit points', () => {
    popup.style.display = 'none';
    resetCursor();
});

// Map mouseleave event for Shrines
map.on('mouseleave', 'Shrines', () => {
    popup.style.display = 'none';
    resetCursor();
});

// Function to reset the cursor to the default square with triangles
function resetCursor() {
    cursor.style.width = '40px';
    cursor.style.height = '40px';
    cursor.classList.remove('active', 'expanded'); // Remove active and expanded states
    cursor.style.setProperty('--triangle-color', '#87ceeb'); // Default blue
    map.getCanvas().style.cursor = ''; // Restore default cursor
}

// Optionally add zoom and navigation controls
map.addControl(new mapboxgl.NavigationControl());

// Music Controls ////////////////////////////////////////////////////////////////////////////////////////

// Define GeoJSON source for sound points
const soundPoints = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            properties: { id: 1, name: 'Point 1' },
            geometry: {
                type: 'Point',
                coordinates: [77.1025, 28.7041], // Example: Delhi coordinates
            },
        },
        {
            type: 'Feature',
            properties: { id: 2, name: 'Point 2' },
            geometry: {
                type: 'Point',
                coordinates: [72.8777, 19.0760], // Example: Mumbai coordinates
            },
        },
    ],
};


// Add sound points to the map
map.on('load', () => {
    // Add the GeoJSON source
    map.addSource('sound-points', {
        type: 'geojson',
        data: soundPoints,
    });

    // Add a layer for the sound points
    map.addLayer({
        id: 'sound-point-layer',
        type: 'circle',
        source: 'sound-points',
        paint: {
            'circle-radius': 8,
            'circle-color': '#FFD700', // Gold color
            'circle-stroke-width': 2,
            'circle-stroke-color': '#8B0000', // Red border
        },
    });
});

// Spotify API Example: Fetch Music Based on Region
const SPOTIFY_ACCESS_TOKEN = 'BQB_EEQyamatNnJCM5rqTlbNsy9tvABMQ2rBuzKEylJv1ssgz_z_O-1394R8cbbT21ztfFQ5Irj3iovoQ2NFecdTyFrvguDcRn3maVu62Z20gv8PtCc'
const fetchMusic = async (lat, lon) => {
    const token = SPOTIFY_ACCESS_TOKEN;
    const url = `https://api.spotify.com/v1/browse/categories/travel/playlists`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();

        // Get the first playlist URL (modify based on API response structure)
        const playlistUrl = data.playlists.items[0]?.external_urls.spotify;
        const embedUrl = playlistUrl.replace('https://open.spotify.com', 'https://open.spotify.com/embed');

        // Update the Spotify embed player
        const player = document.getElementById('music-player');
        const iframe = document.getElementById('spotify-embed');
        iframe.src = embedUrl;
        player.style.display = 'block';

    } catch (error) {
        console.error('Error fetching Spotify data:', error);
    }
};

// Add click event listener for sound points
map.on('click', 'sound-point-layer', (e) => {
    const coordinates = e.features[0].geometry.coordinates;
    const name = e.features[0].properties.name;

    console.log(`Clicked on sound point: ${name}`);
    
    // Use coordinates to fetch music
    fetchMusic(coordinates[1], coordinates[0]); // Latitude, Longitude
});

// Change the cursor to a pointer when over the points
map.on('mouseenter', 'sound-point-layer', () => {
    map.getCanvas().style.cursor = 'pointer';
});

// Reset the cursor when leaving the points
map.on('mouseleave', 'sound-point-layer', () => {
    map.getCanvas().style.cursor = '';
});



