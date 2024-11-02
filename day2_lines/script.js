// Initialize the map
const map = L.map('map', {
    zoomControl: false // Disable zoom controls
}).setView([20, 0], 3);

// Add Carto Positron tile layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: 'Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL.'
}).addTo(map);

// Function to add GeoJSON data to the map
function addGeoJsonLayer(data, isBackground = false) {
    L.geoJson(data, {
        style: function (feature) {
            if (isBackground) {
                return {
                    color: 'grey', // Stroke color for background layer
                    weight: 1,
                    fillOpacity: 0 // No fill
                };
            } else {
                return {
                    color: getColor(feature.properties.iuu_pct),
                    weight: Math.max(feature.properties.iuu_quantity / 100, 2), // Adjust thickness based on iuu_quantity
                    opacity: 0.7,
                };
            }
        },
        onEachFeature: function (feature, layer) {
            if (!isBackground) {
                layer.bindPopup(`
                    <strong>Direct Supplier Country:</strong> ${feature.properties.partner_desc}<br>
                    <strong>Area of Harvest:</strong> ${feature.properties.area_desc}<br>
                    <strong>Species Type:</strong> ${feature.properties.species_aggregate}<br>
                    <strong>Species Subtype:</strong> ${feature.properties.species_group}<br>
                    <strong>IUU Quantity:</strong> ${feature.properties.iuu_quantity} metric tons<br>
                    <strong>IUU Value:</strong> $${feature.properties.iuu_value}<br>
                    <strong>Total Quantity:</strong> ${feature.properties.quantity} metric tons<br>
                    <strong>Total Value:</strong> $${feature.properties.value}<br>
                    <strong>IUU Product Quantity as % of Import:</strong> ${(feature.properties.iuu_pct * 100).toFixed(2)}%<br>
                    <strong>FAO major fishing area:</strong> ${feature.properties.fao_area}<br>
                `);
            }
        }
    }).addTo(map);
}

// Function to get color based on iuu_pct with the Viridis palette
function getColor(iuu_pct) {
    if (iuu_pct < 0.2) return '#35C4EB'; // Low value - Yellow
    else if (iuu_pct < 0.5) return '#A965A6'; // Medium value - Green
    else return '#DC194D'; // High value - Blue
}

// Function to populate the species dropdown
function populateSpeciesDropdown(data) {
    const speciesSelect = document.getElementById('speciesSelect');
    const species = [...new Set(data.features.map(f => f.properties.species_aggregate))];

    // Sort species array alphabetically
    species.sort((a, b) => a.localeCompare(b));

    species.forEach(spec => {
        const option = document.createElement('option');
        option.value = spec;
        option.textContent = spec;
        speciesSelect.appendChild(option);
    });
}

// Function to populate the level dropdown
function populateLevelDropdown(data) {
    const levelSelect = document.getElementById('levelFilter');
    const levels = [...new Set(data.features.map(f => f.properties.level))]; // Assuming there is a 'level' property

    levels.forEach(level => {
        const option = document.createElement('option');
        option.value = level;
        option.textContent = level;
        levelSelect.appendChild(option);
    });
}

// Function to filter data by level based on iuu_pct ranges
function filterDataByLevel(selectedLevel, data) {
    if (selectedLevel === 'All') return data; // Return all data if 'All' is selected

    return {
        "type": "FeatureCollection",
        "features": data.features.filter(f => {
            const iuu_pct = f.properties.iuu_pct; // Access iuu_pct from properties
            
            if (iuu_pct === undefined || iuu_pct === null) {
                console.warn('Feature with undefined iuu_pct:', f);
                return false; // Skip this feature if iuu_pct is undefined or null
            }

            // Define ranges based on levels
            if (selectedLevel === 'Low') {
                return iuu_pct < 0.2; // Low level
            } else if (selectedLevel === 'Medium') {
                return iuu_pct >= 0.2 && iuu_pct < 0.5; // Medium level
            } else if (selectedLevel === 'High') {
                return iuu_pct >= 0.5; // High level
            }

            return false; // Default to false if no level matches
        })
    };
}

// Add event listener for radio buttons
const levelRadios = document.querySelectorAll('input[name="level"]');
levelRadios.forEach(radio => {
    radio.addEventListener('change', function () {
        const selectedLevel = this.value;
        const speciesSelect = document.getElementById('speciesSelect').value; // Get selected species
        const filteredDataByLevel = filterDataByLevel(selectedLevel, mergedData); // Use your existing merged data variable
        const filteredDataBySpecies = filterDataBySpecies(speciesSelect, filteredDataByLevel); // You might want to filter by species too
        updateMap(selectedSpecies, filteredDataBySpecies); // Update the map with the filtered data

    });
});

// Function to update map based on selected species and selected level
function updateMap(selectedSpecies, selectedLevel, data) {
    map.eachLayer(layer => {
        if (layer instanceof L.GeoJSON) {
            map.removeLayer(layer);
        }
    });

    let filteredData = filterDataByLevel(selectedLevel, data);

    if (selectedSpecies !== 'All') {
        filteredData = {
            "type": "FeatureCollection",
            "features": filteredData.features.filter(f => f.properties.species_aggregate === selectedSpecies)
        };
    }

    addGeoJsonLayer(filteredData);
}

// Fetch GeoJSON files and add layers to the map
Promise.all([
    fetch('fao_bounds.geojson').then(response => response.json()),
    fetch('merged_data.geojson').then(response => response.json())
]).then(data => {
    const [faoBounds, mergedData] = data;

    // Add the background layer
    addGeoJsonLayer(faoBounds, true);
    // Populate the dropdowns and add GeoJSON data to the map
    populateSpeciesDropdown(mergedData);
    populateLevelDropdown(mergedData);
    addGeoJsonLayer(mergedData);

    // Event listeners for dropdown changes
    document.getElementById('speciesSelect').addEventListener('change', function () {
        const selectedSpecies = this.value;
        const selectedLevel = document.getElementById('levelFilter').value; // Get currently selected level
        updateMap(selectedSpecies, selectedLevel, mergedData); // Pass both selected values
    });

    document.getElementById('levelFilter').addEventListener('change', function () {
        const selectedLevel = this.value;
        const selectedSpecies = document.getElementById('speciesSelect').value; // Get currently selected species
        updateMap(selectedSpecies, selectedLevel, mergedData); // Pass both selected values
    });

}).catch(error => console.error('Error loading GeoJSON files:', error));
