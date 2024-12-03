// Set up the size and margin for the globe
const width = window.innerWidth;
const height = window.innerHeight;

// Create an orthographic projection for the globe
const projection = d3.geoOrthographic() // Orthographic projection for globe
  .scale(Math.min(width, height) / 2.5) // Slightly smaller globe
  .translate([width / 2, height / 2]) // Center the globe
  .rotate([90, 0]); // Initial rotation

// Create a path generator with the projection
const path = d3.geoPath().projection(projection);

// Create an SVG element to hold the globe
const svg = d3.select("#globe").append("svg")
  .attr("width", width)
  .attr("height", height);

// Add a circle for the globe background (ocean)
svg.append("circle")
  .attr("cx", width / 2)
  .attr("cy", height / 2)
  .attr("r", projection.scale())
  .attr("fill", "#2a2a2a"); // Dark grey for ocean

const canvas = d3.select("#globe").append("canvas")
  .attr("width", width)
  .attr("height", height);
var context = canvas.node().getContext("2d");

// Load the GeoTIFF using geotiff.js
// const tiffUrl = "GHS_POP_E2000_GLOBE_R2023A_54009_100_V1_0_R5_C25.tif";  // Replace with the path to the GeoTIFF file
// var context = canvas.node().getContext("2d");
// fetch(tiffUrl)
//   .then(response => response.arrayBuffer())
//   .then(tiffData => {
//     const tiff = GeoTIFF.parse(tiffData);
//     const image = tiff.getImage();
//     const rasters = image.readRasters();
    // var tiepoint = image.getTiePoints()[0];
    // var pixelScale = image.getFileDirectory().ModelPixelScale;
    // var geoTransform = [tiepoint.x, pixelScale[0], 0, tiepoint.y, 0, -1*pixelScale[1]];
    // var invGeoTransform = [-geoTransform[0]/geoTransform[1], 1/geoTransform[1],0,-geoTransform[3]/geoTransform[5],0,1/geoTransform[5]];
  
    // var tempData = new Array(image.getHeight());
    // for (var j = 0; j<image.getHeight(); j++){
    //     tempData[j] = new Array(image.getWidth());
    //     for (var i = 0; i<image.getWidth(); i++){
    //         tempData[j][i] = rasters[1][i + j*image.getWidth()];
    //     }
    // }
    // Additional processing logic...
  // })
  // .catch(error => console.error("Error loading TIFF data:", error));
 
// Load world map data (TopoJSON format)
d3.json("https://raw.githubusercontent.com/d3/d3.github.com/refs/heads/master/world-110m.v1.json")
  .then(function (world) {
    const countries = topojson.feature(world, world.objects.countries).features;

    // Draw countries
    svg.selectAll(".country")
      .data(countries)
      .enter().append("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("fill", "none") // Green for countries
      .attr("stroke", "#ffffff") // White borders
      .attr("stroke-width", 0.5);
  })
  .catch(function (error) {
    console.error("Error loading or processing the world map data:", error);
  });

  // Load in GeoJSON data (Arctic Sea Ice 2023)
d3.json("arctic_sea_ice_2023_reproj_4326.geojson")
.then(function (json) {
  // Bind data and create one path per GeoJSON feature for arctic sea ice
  svg.selectAll(".arctic") // Use a separate class for arctic features
    .data(json.features)
    .enter()
    .append("path")
    .attr("class", "arctic")
    .attr("d", path)  // Convert each feature to path
    .attr("fill", "#FFFFFF35")  // Set color for polygons
    .attr("stroke", "#ffffff") // White borders
    .attr("stroke-width", 1);  // Optional: Add stroke width to distinguish features
})
.catch(function (error) {
  console.error("Error loading or processing the arctic data:", error);
});

// Load in GeoJSON data (Timezones)
d3.json("timezones_4326.geojson")
  .then(function (json) {
    // Bind data and create one path per GeoJSON feature for timezones
    svg.selectAll(".timezone") // Use a separate class for timezones
      .data(json.features)
      .enter()
      .append("path")
      .attr("class", "timezone")
      .attr("d", path)  // Convert each feature to path
      .attr("fill", "none")  // Set color for polygons
      .attr("stroke", "#218C1CFF") // White borders
      .attr("stroke-width", 0.5);  // Optional: Add stroke width to distinguish features
  })
  .catch(function (error) {
    console.error("Error loading or processing the timezone data:", error);
  });


// Cities in UTC+0 timezone (longitude, latitude)
const santaPaths = [
  {
    timezone: "+12",
    path: [
      { coords: [0, 90], city: "North Pole", country: "Restocking Point", contents: 100 }, // North Pole (Restocking Point)
      // { coords: [160.0, -53.0], city: "Petropavlovsk-Kamchatsky", country: "Russia", contents: 100 }, // Petropavlovsky-Kamchatsky, Russia (UTC+12)
      { coords: [179.2, -18.1], city: "Suva", country: "Fiji", contents: 100 }, // Suva, Fiji (UTC+12)
      { coords: [172.6, -43.5], city: "Christchurch", country: "New Zealand", contents: 100 }, // Christchurch, New Zealand (UTC+12)
    ],
  },
  {
      timezone: "+11",
      path: [
        { coords: [159.8, -9.0], city: "Honiara", country: "Solomon Islands", contents: 100 },
         // Honiara, Solomon Islands (UTC+11)
      ],
    },
    {
          timezone: "+10",
          path: [
            // { coords: [131.9, 43.1], city: "Vladivostok", country: "Russia", contents: 100 }, // Vladivostok, Russia (UTC+10)
            { coords: [147.2, -9.4], city: "Port Moresby", country: "Papua New Guinea", contents: 100 }, // Port Moresby, Papua New Guinea (UTC+10)
            // { coords: [153.0, -27.5], city: "Brisbane", country: "Australia", contents: 100 }, // Brisbane, Australia (UTC+10)
            { coords: [151.2, -33.9], city: "Sydney", country: "Australia", contents: 100 }, // Sydney, Australia (UTC+10)
            // { coords: [144.9, -37.8], city: "Melbourne", country: "Australia", contents: 100 } // Melbourne, Australia (UTC+10)
          ],
        },
        {
          timezone: "+9",
          path: [
            // { coords: [130.9, -12.5], city: "Darwin", country: "Australia", contents: 100 }, // Darwin, Australia (UTC+9)
            { coords: [138.6, -34.9], city: "Adelaide", country: "Australia", contents: 100 }, // Adelaide, Australia (UTC+9)
            { coords: [126.9, 37.6], city: "Seoul", country: "South Korea", contents: 100 }, // Seoul, South Korea (UTC+9)
          ],
        },
        {
          timezone: "+8",
          path: [
            { coords: [120.9, 14.6], city: "Manila", country: "Philippines", contents: 100 },
            // { coords: [115.9, -31.9], city: "Perth", country: "Australia", contents: 100 },
          ],
        },
        {
          timezone: "+7",
          path: [
            { coords: [82.9, 55.0], city: "Novosibirsk", country: "Russia", contents: 100 },
          ],
        },
        {
          timezone: "+6",
          path: [
            { coords: [73.3, 54.9], city: "Omsk", country: "Russia", contents: 100 },
            // { coords: [71.4, 51.2], city: "Astana", country: "Kazakhstan", contents: 100 },
            { coords: [72.8, 19.1], city: "Mumbai", country: "India", contents: 100 },
            // { coords: [73.8, 15.5], city: "Panjim", country: "India", contents: 100 },
            { coords: [76.3, 9.9], city: "Kochi", country: "India", contents: 100 },
          ],
        },
        {
          timezone: "+4",
          path: [
            { coords: [44.8, 41.7], city: "Tbilisi", country: "Georgia", contents: 100 },
            { coords: [40.2, 44.5], city: "Yerevan", country: "Armenia", contents: 100 },
          ],
        },
        {
          timezone: "+3",
          path: [
            // { coords: [39.3, 15.3], city: "Asmara", country: "Eritrea", contents: 100 },
            { coords: [38.7, 9.0], city: "Addis Ababa", country: "Ethiopia", contents: 100 },
            { coords: [36.8, -1.3], city: "Nairobi", country: "Kenya", contents: 100 },
            // { coords: [37.6, 55.8], city: "Moscow", country: "Russia", contents: 100 },
            { coords: [30.3, 59.9], city: "St Petersburg", country: "Russia", contents: 100 },
            // { coords: [47.4, -18.9], city: "Antananarivo", country: "Madagascar", contents: 100 },
          ],
        },
        {
          timezone: "+2",
          path: [
            { coords: [24.9, 60.1], city: "Helsinki", country: "Finland", contents: 100 },
            // { coords: [24.7, 59.4], city: "Tallinn", country: "Estonia", contents: 100 },
            // { coords: [24.1, 56.9], city: "Riga", country: "Latvia", contents: 100 },
            // { coords: [25.3, 54.9], city: "Vilnius", country: "Lithuania", contents: 100 },
            // { coords: [27.0, 53.9], city: "Minsk", country: "Belarus", contents: 100 },
            { coords: [30.5, 50.4], city: "Kiev", country: "Ukraine", contents: 100 },
            // { coords: [28.9, 47.0], city: "Chisinau", country: "Moldova", contents: 100 },
            // { coords: [26.1, 44.4], city: "Bucharest", country: "Romania", contents: 100 },
            // { coords: [23.3, 42.7], city: "Sofia", country: "Bulgaria", contents: 100 },
            // { coords: [23.7, 37.9], city: "Athens", country: "Greece", contents: 100 },
            // { coords: [33.0, 35.1], city: "Nicosia", country: "Cyprus", contents: 100 },
            { coords: [35.2, 31.9], city: "Jerusalem", country: "Israel", contents: 100 },
            { coords: [31.2, 30.0], city: "Cairo", country: "Egypt", contents: 100 },
            // { coords: [32.6, 0.3], city: "Kampala", country: "Uganda", contents: 100 },
            // { coords: [31.1, -17.8], city: "Harare", country: "Zimbabwe", contents: 100 },
            { coords: [18.4, -33.9], city: "Cape Town", country: "South Africa", contents: 100 },
            // { coords: [17.1, -22.6], city: "Windhoek", country: "Namibia", contents: 100 },
          ],
        },
      {
        timezone: "+1",
        path: [
          // { coords: [18.6, 4.4], city: "Bangui", country: "Central African Republic", contents: 100 }, // Bangui, Central African Republic (UTC+1)
          // { coords: [13.2, -8.8], city: "Luanda", country: "Angola", contents: 100 }, // Luanda, Angola (UTC+1)
          { coords: [-3.7, 40.4], city: "Madrid", country: "Spain", contents: 100 }, // Madrid, Spain (UTC+1)
          { coords: [12.5, 41.9], city: "Rome", country: "Italy", contents: 100 }, // Rome, Italy (UTC+1)
          // { coords: [7.5, 46.9], city: "Bern", country: "Switzerland", contents: 100 }, // Bern, Switzerland (UTC+1)
          // { coords: [14.5, 46.0], city: "Ljubljana", country: "Slovenia", contents: 100 }, // Ljubljana, Slovenia (UTC+1)
          // { coords: [15.9, 45.2], city: "Zagreb", country: "Croatia", contents: 100 }, // Zagreb, Croatia (UTC+1)
          // { coords: [20.5, 44.8], city: "Belgrade", country: "Serbia", contents: 100 }, // Belgrade, Serbia (UTC+1)
          // { coords: [19.0, 47.5], city: "Budapest", country: "Hungary", contents: 100 }, // Budapest, Hungary (UTC+1)
          // { coords: [16.4, 48.2], city: "Vienna", country: "Austria", contents: 100 }, // Vienna, Austria (UTC+1)
          // { coords: [17.1, 48.2], city: "Bratislava", country: "Slovakia", contents: 100 }, // Bratislava, Slovakia (UTC+1)
          // { coords: [14.4, 50.1], city: "Prague", country: "Czech Republic", contents: 100 }, // Prague, Czech Republic (UTC+1)
          { coords: [19.0, 52.4], city: "Warsaw", country: "Poland", contents: 100 }, // Warsaw, Poland (UTC+1)
          // { coords: [13.4, 52.5], city: "Berlin", country: "Germany", contents: 100 }, // Berlin, Germany (UTC+1)
          // { coords: [4.0, 50.8], city: "Brussels", country: "Belgium", contents: 100 }, // Brussels, Belgium (UTC+1)
          // { coords: [4.9, 52.4], city: "Amsterdam", country: "Netherlands", contents: 100 }, // Amsterdam, Netherlands (UTC+1)
          // { coords: [12.5, 55.6], city: "Copenhagen", country: "Denmark", contents: 100 }, // Copenhagen, Denmark (UTC+1)
          // { coords: [18.1, 59.3], city: "Stockholm", country: "Sweden", contents: 100 }, // Stockholm, Sweden (UTC+1)
          { coords: [10.8, 59.9], city: "Oslo", country: "Norway", contents: 100 }, // Oslo, Norway (UTC+1)
        ],
      },
      {
        timezone: "0",
        path: [
            { coords: [-0.1,51.5], city: "London", country: "United Kingdom", contents: 100 }, // London, United Kingdom (UTC+0)
            // { coords: [53.2, -6.9], city: "Dublin", country: "Ireland", contents: 100 }, // Dublin, Ireland (UTC+0)
        ]
    },
    {
        timezone: "-1",
        path: [
            { coords: [-17.6,14.9], city: "Praia", country: "Cape Verde", contents: 100 }, // Praia, Cape Verde (UTC-1)
            // { coords: [38.0, -25.0], city: "Horta", country: "Portugal (Azores)", contents: 100 }, // Horta, Portugal (Azores) (UTC-1)
            // { coords: [37.0, -25.0], city: "Ponta Delgada", country: "Portugal (Azores)", contents: 100 }, // Ponta Delgada, Portugal (Azores) (UTC-1)
        ]
    },
    {
        timezone: "-2",
        path: [
          { coords: [-51.7,64.2], city: "Nuuk", country: "Greenland", contents: 100 }, // Nuuk, Greenland (UTC-2)
        ]
    },
    {
      timezone: "-3",
      path: [
        { coords: [-58.4,-34.6], city: "Buenos Aires", country: "Argentina", contents: 100 }, // Buenos Aires, Argentina (UTC-3)
        { coords: [-43.2,-22.9], city: "Rio de Janeiro", country: "Brazil", contents: 100 }, // Rio de Janeiro, Brazil (UTC-3)
        // { coords: [-33.4, -70.6], city: "Santiago", country: "Chile", contents: 100 }, // Santiago, Chile (UTC-3)
        { coords: [-77.0,-12.0], city: "Lima", country: "Peru", contents: 100 }, // Lima, Peru (UTC-3)
      ]
    },
    {
      timezone: "-4",
      path: [
          // { coords: [10.5,-66.9,], city: "Caracas", country: "Venezuela", contents: 100 }, // Caracas, Venezuela (UTC-4)
          { coords: [-61.2,-10.6], city: "Trinidad", country: "Trinidad and Tobago", contents: 100 }, // Trinidad, Trinidad and Tobago (UTC-2)
          // { coords: [13.0, -59.6], city: "Bridgetown", country: "Barbados", contents: 100 }, // Bridgetown, Barbados (UTC-4)
      ]
    },
    {
      timezone: "-5",
      path: [
          { coords: [-99.1,19.4], city: "Mexico City", country: "Mexico", contents: 100 }, // Mexico City, Mexico (UTC-5)
          // { coords: [25.7, -80.3], city: "Miami", country: "United States", contents: 100 }, // Miami, United States (UTC-5)
          // { coords: [18.5, -77.0], city: "Kingston", country: "Jamaica", contents: 100 }, // Kingston, Jamaica (UTC-5)
      ]
    },
    {
      timezone: "-6",
      path: [
          { coords: [-90.5,14.6], city: "Guatemala City", country: "Guatemala", contents: 100 }, // Guatemala City, Guatemala (UTC-6)
          // { coords: [6.9, -79.9], city: "Panama City", country: "Panama", contents: 100 }, // Panama City, Panama (UTC-6)
          // { coords: [13.0, -83.0], city: "Managua", country: "Nicaragua", contents: 100 }, // Managua, Nicaragua (UTC-6)
      ]
    },
    {
      timezone: "-7",
      path: [
          { coords: [-117.1,32.8], city: "Tijuana", country: "Mexico", contents: 100 }, // Tijuana, Mexico (UTC-7)
          { coords: [-104.9,39.7], city: "Denver", country: "United States", contents: 100 }, // Denver, United States (UTC-7)
          // { coords: [14.9, -92.0], city: "Tuxtla Gutierrez", country: "Mexico", contents: 100 }, // Tuxtla Gutierrez, Mexico (UTC-7)
      ]
    },
    {
      timezone: "-8",
      path: [
          { coords: [-118.2,34.1], city: "Los Angeles", country: "USA", contents: 100 }, // Los Angeles, USA (UTC-8)
          // { coords: [37.8, -122.4], city: "San Francisco", country: "USA", contents: 100 }, // San Francisco, USA (UTC-8)
          { coords: [-123.1,49.3], city: "Vancouver", country: "Canada", contents: 100 }, // Vancouver, Canada (UTC-8)
      ]
  },
  {
    timezone: "-9",
    path: [
        { coords: [-134.4,58.3], city: "Juneau", country: "USA", contents: 100 }, // Juneau, USA (UTC-9)
        // { coords: [52.1, -174.8], city: "Dutch Harbor", country: "USA", contents: 100 }, // Dutch Harbor, USA (UTC-9)
        // { coords: [65.7, -162.1], city: "Kotzebue", country: "USA", contents: 100 }, // Kotzebue, USA (UTC-9)
    ]
  },
  {
    timezone: "-10",
    path: [
        { coords: [-157.8,21.3], city: "Honolulu", country: "USA", contents: 100 }, // Honolulu, USA (UTC-10)
        // { coords: [-22.2, -159.8], city: "Pago Pago", country: "American Samoa", contents: 100 }, // Pago Pago, American Samoa (UTC-10)
        // { coords: [-9.2, -139.0], city: "Rarotonga", country: "Cook Islands", contents: 100 }, // Rarotonga, Cook Islands (UTC-10)
    ]
  },
  {
    timezone: "-11",
    path: [
        // { coords: [22.2, -159.8], city: "Niue", country: "Niue", contents: 100 }, // Niue, Niue (UTC-11)
        // { coords: [15.2, -151.3], city: "American Samoa", country: "USA", contents: 100 }, // American Samoa, USA (UTC-11)
        { coords: [-170.1,-13.5], city: "Apia", country: "Samoa", contents: 100 }, // Apia, Samoa (UTC-11)
    ]
  },
  {
    timezone: "-12",
    path: [
        { coords: [-157.4,-7.2], city: "Baker Island", country: "USA (unincorporated)", contents: 100 }, // Baker Island, USA (UTC-12)
        // { coords: [-6.3, -155.6], city: "Howland Island", country: "USA (unincorporated)", contents: 100 }, // Howland Island, USA (UTC-12)
        // { coords: [-7.2, -155.4], city: "Jarvis Island", country: "USA (unincorporated)", contents: 100 }, // Jarvis Island, USA (UTC-12)
        { coords: [0, 90], city: "North Pole", country: "Restocking Point", contents: 100 }, // North Pole (Restocking Point)
    ]
  }
    
    ]
      

function moveSantaSmoothly() {
  let currentStep = 0;
  let santaPath = [];

  // Ensure santaPaths are sorted by descending time zones
  //santaPaths.sort((a, b) => b.timeZone - a.timeZone);

// Iterate through each timezone object in santaPaths
santaPaths.forEach(zone => {
  const { timezone, path } = zone;

  // Map each location in the path and add to santaPath
  santaPath = [
    ...santaPath,
    ...path.map(location => ({
      timezone,               // Add the timezone
      coords: location.coords,
      city: location.city,
      country: location.country,
      contents: location.contents
    }))
  ];
});

let currentUtcTime = new Date('2024-12-24T12:00:00Z'); // Start at 12 PM UTC on Dec 24
function moveAlongPath() {
  const currentCity = santaPath[currentStep];
  const nextCity = santaPath[currentStep + 1];
  if (!nextCity) return; // End if there's no next city

  const [lon1, lat1] = currentCity.coords;
  const [lon2, lat2] = nextCity.coords;

  // Precompute interpolation points
  const interpolate = d3.geoInterpolate([lon1, lat1], [lon2, lat2]);
  const totalFrames = 200; // Total number of frames for animation
  const intermediatePoints = Array.from({ length: totalFrames }, (_, i) => interpolate(i / (totalFrames - 1)));

  let frameIndex = 0; // Start at the first frame
  const frameDuration = 0.5; // Approx. 60 FPS (16ms per frame)
  const framesToSkip = Math.max(1, Math.ceil(20 / frameDuration)); // Adjust frames skipped based on frameDuration

  function animateFrame() {
    if (frameIndex >= totalFrames) {
      // End of animation: move to the next city
      currentStep++;
      if (currentCity.timezone !== nextCity.timezone) {
        // Increment UTC time by one hour
        currentUtcTime.setHours(currentUtcTime.getHours() + 1);
      }
      updateCityInfo();
      moveAlongPath(); // Proceed to the next step
      return;
    }

    // Interpolated position for current frame
    const [currentLon, currentLat] = intermediatePoints[frameIndex];

    // Update projection rotation and redraw globe
    projection.rotate([-currentLon, -currentLat]);
    svg.selectAll(".country").attr("d", path);
    svg.selectAll(".arctic").attr("d", path);
    svg.selectAll(".timezone").attr("d", path);

    // Update marker positions (Santa, reindeer, sled)
    const [xS, yS] = projection([currentLon, currentLat]);
    sledMarker.attr("x", xS).attr("y", yS);

    const offsetReindeer = frameIndex + 5; // Reindeer slightly ahead
    if (offsetReindeer < totalFrames) {
      const [reindeerLon, reindeerLat] = intermediatePoints[offsetReindeer];
      const [xR, yR] = projection([reindeerLon, reindeerLat]);
      reindeerMarker.attr("x", xR).attr("y", yR);
    }

    const offsetSanta = frameIndex - 5; // Santa slightly behind
    if (offsetSanta >= 0) {
      const [santaLon, santaLat] = intermediatePoints[offsetSanta];
      const [xT, yT] = projection([santaLon, santaLat]);
      santaMarker.attr("x", xT).attr("y", yT);
    }

    // Increment to the next frame
    frameIndex += framesToSkip;
    setTimeout(() => requestAnimationFrame(animateFrame), frameDuration);
  }

  // Start animation
  requestAnimationFrame(animateFrame);
}

function updateCityInfo() {
  const currentCity = santaPath[currentStep];
  const nextCity = santaPath[currentStep + 1];

  // Update UTC time
  const utcDatePart = currentUtcTime.toISOString().split("T")[0]; // YYYY-MM-DD
  const utcTimePart = currentUtcTime.toISOString().split("T")[1].slice(0, 5); // HH:mm
  document.getElementById("utcTime").innerText = `${utcDatePart} ${utcTimePart}`;

  // Update current city
  document.getElementById("arrivingAtPlace").innerHTML = `${currentCity.city}, ${currentCity.country} <br> 🕛 UTC${currentCity.timezone}`;

  // Update next city
  if (nextCity) {
    document.getElementById("nextStopPlace").innerHTML = `${nextCity.city}, ${nextCity.country} <br> 🕛 UTC${nextCity.timezone}`;
  } else {
    document.getElementById("nextStopPlace").innerText = "End of path";
  }
}



// Function to create a random snowflake
function createSnowflake() {
  const snowflake = document.createElement('div');
  snowflake.classList.add('snowflake');
  
  // Randomize the snowflake properties
  const size = Math.random() * 10 + 10;  // Random size between 10px and 20px
  snowflake.style.fontSize = `${size}px`;

  // Randomize the starting position
  snowflake.style.left = `${Math.random() * 100}vw`;  // Random horizontal position

  // Random fall speed and delay
  snowflake.style.animationDuration = `${Math.random() * 3 + 2}s`;  // Random fall time
  snowflake.style.animationDelay = `-${Math.random() * 5}s`;  // Start immediately by negative delay
  
  // Random rotate effect
  snowflake.style.animationTimingFunction = 'linear';
  snowflake.innerHTML = '❄';  // Snowflake character

  // Append the snowflake to the snowflakes container
  document.getElementById('snowflakes').appendChild(snowflake);

  // Remove the snowflake after the animation to avoid memory leak
  setTimeout(() => {
      snowflake.remove();
  }, 7000);  // Match this duration with the animation duration
}

// Create snowflakes continuously
setInterval(createSnowflake, 100);

  // Add Santa's emoji markers at the end of the DOM structure to ensure layering
  let reindeerMarker = svg.append("text")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("font-size", "20px")
    .text("🦌");

  let sledMarker = svg.append("text")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("font-size", "20px")
    .text("🛷");

  let santaMarker = svg.append("text")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("font-size", "20px")
    .text("🎅");

  // Move markers to the top-most layer after each frame update
  function ensureTopLayer() {
    reindeerMarker.raise();
    sledMarker.raise();
    santaMarker.raise();
  }

  // Start the path movement and ensure correct layering
  moveAlongPath();
  ensureTopLayer();
}


// Start Santa's journey
moveSantaSmoothly();
