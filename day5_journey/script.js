// Set up the map using Leaflet
// const map = L.map('map', {
//     zoomControl: false // Disable zoom controls
// }).setView([20, -40], 2);

const map = L.map('map', {
    zoomControl: false // Disable zoom controls
}).setView([22.912584123496092, -21.889706377524313], 3);

// Add a tile layer to the map
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     maxZoom: 19,
//     attribution: '&copy; OpenStreetMap contributors'
// }).addTo(map);

// Add Carto Positron tile layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: 'Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL.'
}).addTo(map);

// SVG overlay for D3 elements
const svgLayer = L.svg().addTo(map);
const svg = d3.select("#map").select("svg");
const g = svg.append("g");
const rootStyles = getComputedStyle(document.documentElement);
// Set up a global object to hold the path layers
let pathLayers = {
    step1toStep2: L.layerGroup(),
    step2toStep3: L.layerGroup(),
    step3toStep4: L.layerGroup(),
    step4toStep5: L.layerGroup(),
    step5toStep6: L.layerGroup(),
    step6toStep7: L.layerGroup()
};

// Helper function to interpolate points between start and end coordinates
function interpolatePoints(start, end, numPoints = 10) {
    const latitudes = d3.range(numPoints).map(i => start[0] + (end[0] - start[0]) * (i / (numPoints - 1)));
    const longitudes = d3.range(numPoints).map(i => start[1] + (end[1] - start[1]) * (i / (numPoints - 1)));
    return latitudes.map((lat, i) => new L.LatLng(lat, longitudes[i]));
}

// Load data from CSV files
Promise.all([
    d3.csv("1_materials.csv"),
    d3.csv("2_processing.csv"),
    d3.csv("3_suppliers.csv"),
    d3.csv("4_processing_locs.csv"),
    d3.csv("5_distribution.csv"),
    d3.csv("6_retailmarkets.csv"),
    d3.csv("7_disposal.csv")
]).then(([materialsData, processingData, suppliersData,processingLocsData,distributionData,retailMarketsData,disposalData]) => {
    // Convert numeric columns to numbers
    materialsData.forEach(d => {
        d.lat = +d.lat;
        d.lon = +d.lon;
    });
    processingData.forEach(d => {
        d.lat = +d.lat;
        d.lon = +d.lon;
    });
    suppliersData.forEach(d => {
        d.lat = +d.lat;
        d.lon = +d.lon;
        d.item_id = +d.item_id; // Convert item_id to a number for matching
    });
    processingLocsData.forEach(d => {
        d.lat = +d.lat;
        d.lon = +d.lon;
    });
    distributionData.forEach(d => {
        d.lat = +d.lat;
        d.lon = +d.lon;
    });
    retailMarketsData.forEach(d => {
        d.lat = +d.lat;
        d.lon = +d.lon;
    });
    disposalData.forEach(d => {
        d.lat = +d.lat;
        d.lon = +d.lon;
    });


    // Plot material locations
    materialsData.forEach(d => {
        const popupContent = `
        <b class="popupHeader">Processing Location</b><br>
        <strong>Role:</strong> Production Facility<br>
        <strong>Activity:</strong> ${d.description}<br>
        <strong>Location:</strong> ${d.country}<br>
        `
        
        L.marker([d.lat, d.lon], {
            icon: L.divIcon({
                className: 'square-marker', // Custom class for the marker
                html: '<div style="width: 10px; height: 10px; background-color: ' + rootStyles.getPropertyValue('--color-material').trim() + ';"></div>', 
                iconSize: [10, 10] // Size of the square
            })
        }).addTo(map).bindPopup(popupContent);
    });

    // Plot processing locations
    processingData.forEach(d => {
        const popupContent = `
        <b class="popupHeader">Processing Location</b><br>
        <strong>Role:</strong> ${d.description}<br>
        <strong>Location:</strong> ${d.country}<br>
        `
        L.marker([d.lat, d.lon], {
            icon: L.divIcon({
                className: 'square-marker', // Custom class for the marker
                html: '<div style="width: 10px; height: 10px; background-color: ' + rootStyles.getPropertyValue('--color-processing').trim() + ';"></div>', 
                iconSize: [10, 10] // Size of the square
            })
        }).addTo(map).bindPopup(popupContent);
    });

    // Plot supplier locations
    suppliersData.forEach(d => {
        const popupContent = `
        <b class="popupHeader">Supplier Processing Facility</b><br>
        <strong>Supplier:</strong> ${d.company}<br>
        <strong>Location:</strong> ${d.city}, ${d.country}<br>
        `

        L.marker([d.lat, d.lon], {
            icon: L.divIcon({
                className: 'square-marker', // Custom class for the marker
                html: '<div style="width: 5px; height: 5px; background-color: ' + rootStyles.getPropertyValue('--color-supplier').trim() + ';"></div>', 
                iconSize: [10, 10] // Size of the square
            })
        }).addTo(map).bindPopup(popupContent);
    });
    
    // Plot processingLocs locations
    processingLocsData.forEach(d => {

        const popupContent = `
        <b class="popupHeader">Processing Location</b><br>
        <strong>Role:</strong> LEGO Production Facility<br>
        <strong>Activity:</strong> ${d.activity}<br>
        <strong>Location:</strong> ${d.city}, ${d.country}<br>
        <strong>Year Opened:</strong> ${d.year_opened}<br>
        <strong>Employees:</strong> ${d.employees}<br>
        <strong>Estimated Water (m³) in 2023:</strong> ${d.est_water_m3_2023}<br>
        <strong>Estimated Heating (GWh) in 2023:</strong> ${d.est_heating_gwh_2023}<br>
        <strong>Estimated Gas (GWh) in 2023:</strong> ${d.est_gas_gwh_2023}<br>
        <strong>Estimated Electricity (GWh) in 2023:</strong> ${d.est_electric_gwh_2023}<br>
        `;

        L.marker([d.lat, d.lon], {
            icon: L.divIcon({
                className: 'square-marker', // Custom class for the marker
                html: '<div style="width: 10px; height: 10px; background-color: ' + rootStyles.getPropertyValue('--color-processingLocs').trim() + ';"></div>', 
                iconSize: [10, 10] // Size of the square
            })
        }).addTo(map).bindPopup(popupContent);
    });

    // Plot processingLocs locations
    distributionData.forEach(d => {
        const popupContent = `
        <b class="popupHeader">Distribution Location</b><br>
        <strong>Role:</strong> LEGO Office/Hub<br>
        <strong>Activity:</strong> ${d.activity}<br>
        <strong>Location:</strong> ${d.city}, ${d.country}<br>
        <strong>Year Opened:</strong> ${d.year_opened}<br>
        <strong>Employees:</strong> ${d.employees}<br>
        <strong>Estimated Electricity Usage (GWh) in 2023:</strong> ${d.est_office_hub_lbr_electricity_gwh}<br>
        <p class="small-text">Note: Average estimate divided evenly between offices, hubs, retail locations due to lack of detailed data</p>
        `;

        L.marker([d.lat, d.lon], {
            icon: L.divIcon({
                className: 'square-marker', // Custom class for the marker
                html: '<div style="width: 10px; height: 10px; background-color: ' + rootStyles.getPropertyValue('--color-distribution').trim() + ';"></div>', 
                iconSize: [10, 10] // Size of the square
            })
        }).addTo(map).bindPopup(popupContent);
    });

    // Plot processingLocs locations
    retailMarketsData.forEach(d => {
        const popupContent = `
        <b class="popupHeader">Retail Market</b><br>
        <strong>Region:</strong> ${d.region_name}<br>
        `;
        L.marker([d.lat, d.lon], {
            icon: L.divIcon({
                className: 'square-marker', // Custom class for the marker
                html: '<div style="width: 10px; height: 10px; background-color: ' + rootStyles.getPropertyValue('--color-retailMarkets').trim() + ';"></div>', 
                iconSize: [10, 10] // Size of the square
            })
        }).addTo(map).bindPopup(popupContent);
    });

    // Plot processingLocs locations
    disposalData.forEach(d => {
        const popupContent = `
        <b class="popupHeader">Disposal</b><br>
        <strong>Region:</strong> ${d.city}, ${d.country}<br>
        <strong>Estimated waste volume (tonnes):</strong> ${d.est_waste_volume_tonnes}<br>
        <strong>Estimated volume - Incineration (tonnes):</strong> ${d.est_amt_incineration}<br>
        <p class="small-text"> Est. ${(d.est_pct_hazardous_incineration*100).toFixed(0)}% of this volume is hazardous.<p>
        <strong>Estimated volume - Landfill (tonnes):</strong> ${d.est_amt_landfill}<br>
        <p class="small-text"> Est. ${(d.est_pct_hazardous_landfill*100).toFixed(0)}% of this volume is hazardous.<p>
        <strong>Estimated volume - Recovery (tonnes):</strong> ${d.est_amt_recovery}<br>
        <p class="small-text"> Est. ${(d.est_pct_hazardous_recovery*100).toFixed(0)}% of this volume is hazardous.<p>
        <strong>Estimated volume - Reuse (tonnes):</strong> ${d.est_amt_reuse}<br>
        <p class="small-text"> Est. ${(d.est_pct_hazardous_reuse*100).toFixed(0)}% of this volume is hazardous.<p>
        <strong>Estimated volume - Recycled (tonnes):</strong> ${d.est_amt_recycled}<br>
        <p class="small-text"> Est. ${(d.est_pct_hazardous_recycled*100).toFixed(0)}% of this volume is hazardous.<p>
        <strong>Estimated volume - Treatment (tonnes):</strong> ${d.est_amt_treatment}<br>
        <p class="small-text"> Est. ${ (d.est_pct_hazardous_treatment * 100).toFixed(0) }% of this volume is hazardous.</p>
        <p class="small-text">Note: Average estimates divided evenly between LEGO production facilities due to lack of detailed data</p>
        `;
        
        L.marker([d.lat, d.lon], {
            icon: L.divIcon({
                className: 'square-marker', // Custom class for the marker
                html: '<div style="width: 10px; height: 10px; background-color: ' + rootStyles.getPropertyValue('--color-disposal').trim() + ';"></div>', 
                iconSize: [10, 10] // Size of the square
            })
        }).addTo(map).bindPopup(popupContent);
    });

    let layerColors = {
        step1toStep2: rootStyles.getPropertyValue('--color-step1toStep2').trim(),
        step2toStep3: rootStyles.getPropertyValue('--color-step2toStep3').trim(),
        step3toStep4: rootStyles.getPropertyValue('--color-step3toStep4').trim(),
        step4toStep5: rootStyles.getPropertyValue('--color-step4toStep5').trim(),
        step5toStep6: rootStyles.getPropertyValue('--color-step5toStep6').trim(),
        step6toStep7: rootStyles.getPropertyValue('--color-step6toStep7').trim(),
    };

    function resetLayerColors() {
        layerColors = {
            step1toStep2: rootStyles.getPropertyValue('--color-step1toStep2').trim(),
            step2toStep3: rootStyles.getPropertyValue('--color-step2toStep3').trim(),
            step3toStep4: rootStyles.getPropertyValue('--color-step3toStep4').trim(),
            step4toStep5: rootStyles.getPropertyValue('--color-step4toStep5').trim(),
            step5toStep6: rootStyles.getPropertyValue('--color-step5toStep6').trim(),
            step6toStep7: rootStyles.getPropertyValue('--color-step6toStep7').trim(),
        };
    }

    // Function to set color for completed paths
function completePath(step) {
    let newColor = rootStyles.getPropertyValue('--color-inactive').trim();
    if (step === 'step1toStep2') {
        layerColors.step1toStep2 = newColor; // Change to grey when completed
        d3.selectAll(".step1toStep2-path").attr("stroke", newColor);
        // console.log("i updated the path layer color for step",step)
    } else if (step === 'step2toStep3') {
        layerColors.step2toStep3 = newColor; // Change to grey when completed
        d3.selectAll(".step2toStep3-path").attr("stroke", newColor);
        // console.log("i updated the path layer color for step",step)
    } else if (step === 'step3toStep4') {
        layerColors.step3toStep4 = newColor; // Change to grey when completed
        d3.selectAll(".step3toStep4-path").attr("stroke", newColor);
        // console.log("i updated the path layer color for step",step)
    } else if (step === 'step4toStep5') {
        layerColors.step4toStep5 = newColor; // Change to grey when completed
        d3.selectAll(".step4toStep5-path").attr("stroke", newColor);
        // console.log("i updated the path layer color for step",step)
    } else if (step === 'step5toStep6') {
        layerColors.step5toStep6 = newColor; // Change to grey when completed
        d3.selectAll(".step5toStep6-path").attr("stroke", newColor);
        // console.log("i updated the path layer color for step",step)
    } else if (step === 'step6toStep7') {
        layerColors.step6toStep7 = newColor; // Change to grey when completed
        d3.selectAll(".step6toStep7-path").attr("stroke", newColor);
        // console.log("i updated the path layer color for step",step)
}
}


// Create and add paths (or edges) based on the step
function drawPaths() {
    // Clear all previous path layers
    for (const path in pathLayers) {
        pathLayers[path].clearLayers();
    }

    // Add paths based on the selected radio button value
    const selectedPath = document.querySelector('input[name="path"]:checked').value;

    switch (selectedPath) {
        case 'step1toStep2':
            // Draw the paths for step1toStep2 and add them to the map
            drawStep1toStep2radio();
            break;
        case 'step2toStep3':
            drawStep2toStep3();
            break;
        case 'step3toStep4':
            drawStep3toStep4();
            break;
        case 'step4toStep5':
            drawStep4toStep5();
            break;
        case 'step5toStep6':
            drawStep5toStep6();
            break;
        case 'step6toStep7':
            drawStep6toStep7();
            break;
    }

    // Add the selected path layer to the map
    pathLayers[selectedPath].addTo(map);
}


// Draw paths between materials (Step 1) and processing locations (Step 2)
function drawStep1toStep2Paths() {
    return new Promise((resolve) => {

    materialsData.forEach(material => {
        const processingId = material.est_nextstep_item_id; // Get the processing ID

        // Find the corresponding processing step using the item_id
        const processing = processingData.find(p => p.item_id === processingId);

        // Debugging log to check if processing step is found
        if (!processing) {
            console.warn(`No processing step found for material: ${material.material_type} (est_nextstep_item_id: ${processingId})`);
            return; // Skip to the next material if no processing found
        }

        const start = [material.lat, material.lon]; // Material coordinates
        const end = [processing.lat, processing.lon]; // Processing coordinates

        // Debugging log to check coordinates
        // console.log(`Drawing path from Material: [${start}] to Processing: [${end}]`);

        // Create interpolated points for the path
        const pathData = interpolatePoints(start, end, 10).map(d => map.latLngToLayerPoint(d));

        const lineGenerator = d3.line()
            .x(d => d.x)
            .y(d => d.y);

        // Append the path to the SVG
        g.append("path")
            .datum(pathData)
            .attr("d", lineGenerator)
            .attr("fill", "none")
            .attr("stroke", layerColors.step1toStep2)
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "0,100")
            .attr("class", "step1toStep2-path") // Add class for easy selection
            .transition()
            .duration(4000)
            .ease(d3.easeLinear)
            .attrTween("stroke-dasharray", function() {
                const length = this.getTotalLength();
                return d3.interpolateString("0," + length, length + "," + length);
            });
    });
    // Simulate edge drawing and reaching destination
    setTimeout(() => {
        // console.log("Edge has reached the destination node.");
        completePath("step1toStep2");
        resolve(); // Resolve the promise when the edge reaches its destination
    }, 5000); // Example delay (2 seconds)
});
}

    // Draw paths between processing locations (Step 2) and suppliers (Step 3)
    function drawStep2toStep3Paths() {
        return new Promise((resolve) => {

        processingData.forEach(processing => {
            const supplierIds = processing.supplier_ids.split(";").map(id => +id);

            supplierIds.forEach(supplierId => {
                const supplier = suppliersData.find(s => s.item_id === supplierId);

                if (supplier) {
                    const start = [processing.lat, processing.lon];
                    const end = [supplier.lat, supplier.lon];
                    const pathData = interpolatePoints(start, end, 10).map(d => map.latLngToLayerPoint(d));

                    const lineGenerator = d3.line()
                        .x(d => d.x)
                        .y(d => d.y);

                    g.append("path")
                        .datum(pathData)
                        .attr("d", lineGenerator)
                        .attr("fill", "none")
                        .attr("stroke", layerColors.step2toStep3)
                        .attr("stroke-width", 2)
                        .attr("stroke-dasharray", "0,100")
                        .attr("class", "step2toStep3-path") // Add class for easy selection
                        .transition()
                        .duration(4000)
                        .ease(d3.easeLinear)
                        .attrTween("stroke-dasharray", function() {
                            const length = this.getTotalLength();
                            return d3.interpolateString("0," + length, length + "," + length);
                        });
                }
            });
        });
    // Simulate edge drawing and reaching destination
    setTimeout(() => {
        // console.log("Edge has reached the destination node.");
        completePath("step2toStep3");
        resolve(); // Resolve the promise when the edge reaches its destination
    }, 5000); // Example delay (2 seconds)
});
    }

    // Draw paths between suppliers (Step 3) and processing locations (Step 4)
    function drawStep3toStep4Paths() {
        return new Promise((resolve) => {

        suppliersData.forEach(supplier => {
            const processingLocId = supplier.est_nextstep_item_id; // Get the processingLoc ID
    
            // Find the corresponding processing step using the item_id
            const processingLoc = processingLocsData.find(p => p.item_id === processingLocId);
    
            // Debugging log to check if processing step is found
            if (!processingLoc) {
                console.warn(`No processingLoc step found for supplier: ${supplier.item_id} (est_nextstep_item_id: ${processingLocId})`);
                return; // Skip to the next material if no processing found
            }
    
            const start = [supplier.lat, supplier.lon]; // Supplier coordinates
            const end = [processingLoc.lat, processingLoc.lon]; // ProcessingLoc coordinates
    
            // Debugging log to check coordinates
            // console.log(`Drawing path from Supplier: [${start}] to ProcessingLoc: [${end}]`);
    
            // Create interpolated points for the path
            const pathData = interpolatePoints(start, end, 10).map(d => map.latLngToLayerPoint(d));
    
            const lineGenerator = d3.line()
                .x(d => d.x)
                .y(d => d.y);
    
            // Append the path to the SVG
            g.append("path")
                .datum(pathData)
                .attr("d", lineGenerator)
                .attr("fill", "none")
                .attr("stroke", layerColors.step3toStep4)
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "0,100")
                .attr("class", "step3toStep4-path") // Add class for easy selection
                .transition()
                .duration(4000)
                .ease(d3.easeLinear)
                .attrTween("stroke-dasharray", function() {
                    const length = this.getTotalLength();
                    return d3.interpolateString("0," + length, length + "," + length);
                });
        });
            // Simulate edge drawing and reaching destination
    setTimeout(() => {
        // console.log("Edge has reached the destination node.");
        completePath("step3toStep4");
        resolve(); // Resolve the promise when the edge reaches its destination
    }, 5000); // Example delay (2 seconds)
});
    }
    
// Draw paths between processing locations (Step 4) and distribution locations (Step 5)
function drawStep4toStep5Paths() {
    return new Promise((resolve) => {

    processingLocsData.forEach(processingLoc => {
        const distributionId = processingLoc.est_nextstep_item_id; // Get the processingLoc ID

        // Find the corresponding processing step using the item_id
        const distribution = distributionData.find(p => p.item_id === distributionId);

        // Debugging log to check if processing step is found
        if (!distribution) {
            console.warn(`No distribution step found for processingLoc: ${processingLoc.item_id} (est_nextstep_item_id: ${distributionId})`);
            return; // Skip to the next material if no processing found
        }

        const start = [processingLoc.lat, processingLoc.lon]; // Supplier coordinates
        const end = [distribution.lat, distribution.lon]; // ProcessingLoc coordinates

        // Debugging log to check coordinates
        // console.log(`Drawing path from ProcessingLoc: [${start}] to Distribution: [${end}]`);

        // Create interpolated points for the path
        const pathData = interpolatePoints(start, end, 10).map(d => map.latLngToLayerPoint(d));

        const lineGenerator = d3.line()
            .x(d => d.x)
            .y(d => d.y);

        // Append the path to the SVG
        g.append("path")
            .datum(pathData)
            .attr("d", lineGenerator)
            .attr("fill", "none")
            .attr("stroke", layerColors.step4toStep5)
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "0,100")
            .attr("class", "step4toStep5-path") // Add class for easy selection
            .transition()
            .duration(4000)
            .ease(d3.easeLinear)
            .attrTween("stroke-dasharray", function() {
                const length = this.getTotalLength();
                return d3.interpolateString("0," + length, length + "," + length);
            });
    });
        // Simulate edge drawing and reaching destination
        setTimeout(() => {
            // console.log("Edge has reached the destination node.");
            completePath("step4toStep5");
            resolve(); // Resolve the promise when the edge reaches its destination
        }, 4000); // Example delay (2 seconds)
    });
}

// Draw paths between processing locations (Step 4) and distribution locations (Step 5)
function drawStep5toStep6Paths() {
    return new Promise((resolve) => {

    distributionData.forEach(distribution => {
        // For each processing location, connect to all distribution locations
        retailMarketsData.forEach(retailMarket => {
            const start = [distribution.lat, distribution.lon]; // ProcessingLoc coordinates
            const end = [retailMarket.lat, retailMarket.lon]; // Distribution coordinates

            // Debugging log to check coordinates
            // console.log(`Drawing path from Distribution: [${start}] to Retail Market: [${end}]`);

            // Create interpolated points for the path
            const pathData = interpolatePoints(start, end, 10).map(d => map.latLngToLayerPoint(d));

            const lineGenerator = d3.line()
                .x(d => d.x)
                .y(d => d.y);

            // Append the path to the SVG
            g.append("path")
                .datum(pathData)
                .attr("d", lineGenerator)
                .attr("fill", "none")
                .attr("stroke", layerColors.step5toStep6)
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "0,100")
                .attr("class", "step5toStep6-path") // Add class for easy selection
                .transition()
                .duration(4000)
                .ease(d3.easeLinear)
                .attrTween("stroke-dasharray", function() {
                    const length = this.getTotalLength();
                    return d3.interpolateString("0," + length, length + "," + length);
                });
        });
    });
        // Simulate edge drawing and reaching destination
        setTimeout(() => {
            // console.log("Edge has reached the destination node.");
            completePath("step5toStep6");
            resolve(); // Resolve the promise when the edge reaches its destination
        }, 5000); // Example delay (2 seconds)
    });
}

// Draw paths between retail market locations (Step 6) and disposal locations (Step 7)
function drawStep6toStep7Paths() {
    return new Promise((resolve) => {

    retailMarketsData.forEach(retailMarket => {
        // For each processing location, connect to all distribution locations
        disposalData.forEach(disposal => {
            const start = [retailMarket.lat, retailMarket.lon]; // ProcessingLoc coordinates
            const end = [disposal.lat, disposal.lon]; // Distribution coordinates

            // Debugging log to check coordinates
            // console.log(`Drawing path from Retail Market: [${start}] to Disposal: [${end}]`);

            // Create interpolated points for the path
            const pathData = interpolatePoints(start, end, 10).map(d => map.latLngToLayerPoint(d));

            const lineGenerator = d3.line()
                .x(d => d.x)
                .y(d => d.y);

            // Append the path to the SVG
            g.append("path")
                .datum(pathData)
                .attr("d", lineGenerator)
                .attr("fill", "none")
                .attr("stroke", layerColors.step6toStep7)
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "0,100")
                .attr("class", "step6toStep7-path") // Add class for easy selection
                .transition()
                .duration(4000)
                .ease(d3.easeLinear)
                .attrTween("stroke-dasharray", function() {
                    const length = this.getTotalLength();
                    return d3.interpolateString("0," + length, length + "," + length);
                });
        });
    });
        // Simulate edge drawing and reaching destination
        setTimeout(() => {
            // console.log("Edge has reached the destination node.");
            completePath("step6toStep7");
            resolve(); // Resolve the promise when the edge reaches its destination
        }, 5000); // Example delay (2 seconds)
    });
}

    // Function to reset map view
    function resetMapView(lat, lng, zoom) {
        map.setView([lat, lng], zoom);
    }

    // Event listeners for each button
    document.getElementById('viewAll').addEventListener('click', function() {
        resetMapView(22.912584123496092, -21.889706377524313,3); // Global view
        resetLayerColors();
        updatePaths();
    });

    document.getElementById('viewAmericas').addEventListener('click', function() {
        resetMapView(30, -90, 5); // Focus on Americas
        resetLayerColors();
        updatePaths();
        });

    document.getElementById('viewEurope').addEventListener('click', function() {
        resetMapView(55, 10, 4); // Focus on Europe
        resetLayerColors();
        updatePaths();
        });

    document.getElementById('viewAsia').addEventListener('click', function() {
        resetMapView(20, 100, 4); // Focus on Asia
        resetLayerColors();
        updatePaths();
        });

    // Function to update paths on zoom or move to keep them aligned
    function updatePaths() {
        g.selectAll("path").remove(); // Clear all paths to redraw
        drawStep1toStep2Paths()
        .then(drawStep2toStep3Paths)
        .then(drawStep3toStep4Paths)
        .then(drawStep4toStep5Paths)
        .then(drawStep5toStep6Paths)
        .then(drawStep6toStep7Paths)
        .then(() => {
            // console.log("All steps completed.");
        })
        .catch((error) => {
            console.error("An error occurred:", error);
        });
    }

    // Initial drawing of paths
    // Chaining the steps
    drawStep1toStep2Paths()
        .then(drawStep2toStep3Paths)
        .then(drawStep3toStep4Paths)
        .then(drawStep4toStep5Paths)
        .then(drawStep5toStep6Paths)
        .then(drawStep6toStep7Paths)
    .then(() => {
        // console.log("All steps completed.");
    })
    .catch((error) => {
        console.error("An error occurred:", error);
    });

    // Redraw paths on map movement
    map.on("zoomend", updatePaths);
    map.on("moveend", updatePaths);
    map.on('moveend', function() {
        var center = map.getCenter();  // Gets the current center of the map
        var zoom = map.getZoom();  // Gets the current zoom level
    
        // console.log('Current Coordinates:', center.lat, center.lng);
        // console.log('Current Zoom Level:', zoom);
    });

}).catch(error => console.error("Error loading data: ", error));

