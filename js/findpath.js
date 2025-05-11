// Initialize map variables
var map;
var bikeMarkersLayer, bikePathsLayer, waterMarkersLayer;
var allBikePaths = [];
var allWaterFountains = [];
var highlightedPath = null;

// Define custom icons for bike paths and water fountains
var bikepathIcon = L.icon({
    iconUrl: './imgs/mapicon.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

var waterIcon = L.icon({
    iconUrl: './imgs/fountain.png',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
});

// Initialize the map
map = L.map('map').setView([-27.4679, 153.0355], 18);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Enable map interaction
enableMapInteraction();

// Function to load JSON data
function loadJSONData(url, callback) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            callback(data);
        })
        .catch(error => {
            console.error("Error loading JSON file:", error);
        });
}

// Load bike path data
loadJSONData('dataset/bikeway-sections.json', function(data) {
    allBikePaths = data;

    // Process bike path data
    var features = data.map(function(item) {
        if (item.geo_shape && item.geo_shape.geometry) {
            return {
                type: "Feature",
                geometry: item.geo_shape.geometry,
                properties: item
            };
        }
    }).filter(function(item) {
        return item !== undefined;
    });

    // Create GeoJSON object
    var geojson = {
        type: "FeatureCollection",
        features: features
    };

    // Create sets for unique filter values
    var suburbs = new Set();
    var streetNames = new Set();
    var trafficTypes = new Set();
    var locationDescriptions = new Set();
    var bikewayDescriptions = new Set();

    // Populate sets with unique values
    geojson.features.forEach(function(feature) {
        var properties = feature.properties;
        if (properties.suburb) {
            suburbs.add(properties.suburb);
        }
        if (properties.street_name) {
            streetNames.add(properties.street_name);
        }
        if (properties.traffic_types_description) {
            trafficTypes.add(properties.traffic_types_description);
        }
        if (properties.locations_description) {
            locationDescriptions.add(properties.locations_description);
        }
        if (properties.section_types_description) {
            bikewayDescriptions.add(properties.section_types_description);
        }
    });

    // Populate filter options
    populateFilterOptions(suburbs, streetNames, trafficTypes, locationDescriptions, bikewayDescriptions);

    // Add bike markers to the map
    bikeMarkersLayer = L.layerGroup().addTo(map);
    geojson.features.forEach(function(feature) {
        var properties = feature.properties;
        var streetName = properties.street_name || "Bike Path";
        var latlng = getFeatureCenter(feature.geometry);

        var popupContent = `
            <div class="popup-card">
                <h3>${streetName}</h3>
            </div>
        `;

        // Add bike markers to the map
        var marker = L.marker(latlng, { icon: bikepathIcon, objectId: properties.objectid }).addTo(bikeMarkersLayer);
        marker.bindPopup(popupContent);

        // Handle click event for bike markers
        marker.on('click', function() {
            if (highlightedPath) {
                map.removeLayer(highlightedPath);
                highlightedPath = null;
            }

            // Create GeoJSON object for the clicked bike path
            var pathGeoJSON = {
                type: "Feature",
                geometry: feature.geometry,
                properties: feature.properties
            };

            // Add bike path layer to the map
            bikePathsLayer = L.geoJSON(pathGeoJSON, {
                style: {
                    color: '#006400',
                    weight: 7
                }
            }).addTo(map);

            highlightedPath = bikePathsLayer;

            // Generate Google Maps link
            var googleMapsLink = `https://www.google.com/maps/dir/?api=1&destination=${latlng.lat},${latlng.lng}`;

            // Populate info content
            var infoContent = `
                <p><strong>Bikeway Name:</strong> ${properties.bikeway_name || 'N/A'}</p>
                <p><strong>Street Name:</strong> ${properties.street_name || 'N/A'}</p>
                <p><strong>Suburb:</strong> ${properties.suburb || 'N/A'}</p>
                <p><strong>Owner:</strong> ${properties.owner || 'N/A'}</p>
                <p><strong>Hierarchy:</strong> ${properties.hierarchy || 'N/A'}</p>
                <p><strong>Traffic Type:</strong> ${properties.traffic_types_description || 'N/A'}</p>
                <p><strong>Section Type:</strong> ${properties.section_types_description || 'N/A'}</p>
                <p><strong>Location Description:</strong> ${properties.locations_description || 'N/A'}</p>
                <p><strong>Bikeway Width:</strong> ${Math.round(properties.bikeway_width)} meters</p>
                <p><strong>Shape Length:</strong> ${Math.round(properties.shape_length)} meters</p>
                <a href="${googleMapsLink}" target="_blank" class="navigate-btn">Navigate with Google Maps</a>
            `;
            document.getElementById('info-content').innerHTML = infoContent;

            // Fit map bounds to the bike path
            map.fitBounds(bikePathsLayer.getBounds());

            // Close any open popups
            bikeMarkersLayer.eachLayer(function(l) {
                l.closePopup();
            });

            showBikeInfo();
        });
    });
});

// Function to populate filter options
function populateFilterOptions(suburbs, streetNames, trafficTypes, locationDescriptions, bikewayDescriptions) {
    var suburbSelect = document.getElementById('suburb-select');
    var streetSelect = document.getElementById('street-select');
    var trafficSelect = document.getElementById('traffic-select');
    var locationSelect = document.getElementById('location-select');
    var bikewaySelect = document.getElementById('bikeway-on-off-road-select');

    suburbs = Array.from(suburbs).sort();
    streetNames = Array.from(streetNames).sort();
    trafficTypes = Array.from(trafficTypes).sort();
    locationDescriptions = Array.from(locationDescriptions).sort();
    bikewayDescriptions = Array.from(bikewayDescriptions).sort();

    // Populate suburb select options
    suburbs.forEach(function(suburb) {
        var option = document.createElement('option');
        option.value = suburb;
        option.textContent = suburb;
        suburbSelect.appendChild(option);
    });

    // Populate street select options
    streetNames.forEach(function(street) {
        var option = document.createElement('option');
        option.value = street;
        option.textContent = street;
        streetSelect.appendChild(option);
    });

    // Populate traffic type select options
    trafficTypes.forEach(function(trafficType) {
        var option = document.createElement('option');
        option.value = trafficType;
        option.textContent = trafficType;
        trafficSelect.appendChild(option);
    });

    // Populate location description select options
    locationDescriptions.forEach(function(locationDescription) {
        var option = document.createElement('option');
        option.value = locationDescription;
        option.textContent = locationDescription;
        locationSelect.appendChild(option);
    });

    // Populate bikeway on/off road select options
    bikewayDescriptions.forEach(function(bikewayDescription) {
        var option = document.createElement('option');
        option.value = bikewayDescription;
        option.textContent = bikewayDescription;
        bikewaySelect.appendChild(option);
    });

    // Add event listeners to filter options
    suburbSelect.addEventListener('change', applyFilters);
    streetSelect.addEventListener('change', applyFilters);
    trafficSelect.addEventListener('change', applyFilters);
    locationSelect.addEventListener('change', applyFilters);
    bikewaySelect.addEventListener('change', applyFilters);
}

// Implement the reset functionality for bike filters
document.getElementById('bike-reset-btn').addEventListener('click', function() {
    location.reload();
});

// Function to apply filters
function applyFilters() {
    var selectedSuburb = document.getElementById('suburb-select').value;
    var selectedStreet = document.getElementById('street-select').value;
    var selectedTrafficType = document.getElementById('traffic-select').value;
    var selectedLocationDescription = document.getElementById('location-select').value;
    var selectedBikewayDescription = document.getElementById('bikeway-on-off-road-select').value;

    if (highlightedPath) {
        map.removeLayer(highlightedPath);
        highlightedPath = null;
    }

    // Filter bike paths based on selected filters
    filteredBikePaths = allBikePaths.filter(function(item) {
        var suburbMatch = selectedSuburb ? item.suburb === selectedSuburb : true;
        var streetMatch = selectedStreet ? item.street_name === selectedStreet : true;
        var trafficMatch = selectedTrafficType ? item.traffic_types_description === selectedTrafficType : true;
        var locationMatch = selectedLocationDescription ? item.locations_description === selectedLocationDescription : true;
        var bikewayMatch = selectedBikewayDescription ? item.section_types_description === selectedBikewayDescription : true;
        return suburbMatch && streetMatch && trafficMatch && locationMatch && bikewayMatch;
    });

    if (filteredBikePaths.length > 0) {
        showFilteredBikePathCards();

        // Focus on the first matched outcome
        var firstLatLng = getFeatureCenter(filteredBikePaths[0].geo_shape.geometry);
        map.setView(firstLatLng, 18);
    } else {
        showNoResultsCard('bike');
    }
}

// Function to show filtered bike path cards
function showFilteredBikePathCards() {
    var cardsContainer = document.createElement('div');
    cardsContainer.id = 'filtered-results';
    cardsContainer.style.marginTop = '20px';

    filteredBikePaths.forEach(function(item) {
        var card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <h3>${item.street_name || 'Unnamed Path'}</h3>
            <p>Suburb: ${item.suburb || 'N/A'}</p>
            <button onclick="showBikePathDetails(${item.objectid})">View Details</button>
        `;
        cardsContainer.appendChild(card);
    });

    // Add cards container to the filter container
    var filterContainer = document.getElementById('filter-container');
    var existingResults = document.getElementById('filtered-results');
    if (existingResults) {
        filterContainer.removeChild(existingResults);
    }
    filterContainer.appendChild(cardsContainer);
}

// Function to show bike path details
function showBikePathDetails(objectId) {
    var bikePath = allBikePaths.find(item => item.objectid == objectId);
    if (bikePath) {
        showBikeInfo(bikePath);
        var latlng = getFeatureCenter(bikePath.geo_shape.geometry);

        if (highlightedPath) {
            map.removeLayer(highlightedPath);
            highlightedPath = null;
        }

        // Create GeoJSON object for the bike path
        var pathGeoJSON = {
            type: "Feature",
            geometry: bikePath.geo_shape.geometry,
            properties: bikePath
        };

        // Add bike path layer to the map
        bikePathsLayer = L.geoJSON(pathGeoJSON, {
            style: {
                color: '#006400',
                weight: 7
            }
        }).addTo(map);

        highlightedPath = bikePathsLayer;

        // Fit map bounds to the bike path
        map.fitBounds(bikePathsLayer.getBounds());

        map.setView(latlng, 18);

        if (bikeMarkersLayer) {
            bikeMarkersLayer.eachLayer(function(layer) {
                if (layer.options.objectId == objectId) {
                    layer.openPopup();
                }
            });
        }
    }
}

// Function to get the center of a feature
function getFeatureCenter(geometry) {
    var coords = geometry.coordinates;
    var latlngs = [];

    if (geometry.type === "LineString") {
        coords.forEach(function(coord) {
            latlngs.push([coord[1], coord[0]]);
        });
    } else if (geometry.type === "MultiLineString") {
        coords.forEach(function(line) {
            line.forEach(function(coord) {
                latlngs.push([coord[1], coord[0]]);
            });
        });
    }

    return L.latLngBounds(latlngs).getCenter();
}

// Load water fountain data
loadWaterFountainData();

function loadWaterFountainData() {
    loadJSONData('dataset/park-drinking-fountain-tap-locations.json', function(data) {
        allWaterFountains = data;

        var features = data.map(function(item) {
            return {
                type: "Feature",
                geometry: item.geo_shape.geometry,
                properties: item
            };
        });

        var geojson = {
            type: "FeatureCollection",
            features: features
        };

        var parkNames = new Set();
        var itemDescriptions = new Set();

        geojson.features.forEach(function(feature) {
            var properties = feature.properties;
            if (properties.park_name) {
                parkNames.add(properties.park_name);
            }
            if (properties.item_description) {
                itemDescriptions.add(properties.item_description);
            }
        });

        // Populate filter options
        populateWaterFilterOptions(parkNames, itemDescriptions);

        waterMarkersLayer = L.layerGroup().addTo(map);
        geojson.features.forEach(function(feature) {
            var properties = feature.properties;
            var parkName = properties.park_name || "Water Fountain";
            var latlng = L.latLng(properties.y, properties.x);

            var popupContent = `
                <div class="popup-card">
                    <h3>${parkName}</h3>
                </div>
            `;

            var marker = L.marker(latlng, { icon: waterIcon, objectId: properties.objectid }).addTo(waterMarkersLayer);
            marker.bindPopup(popupContent);

            marker.on('click', function() {
                var googleMapsLink = `https://www.google.com/maps/dir/?api=1&destination=${latlng.lat},${latlng.lng}`;
                var infoContent = `
                    <p><strong>Park Name:</strong> ${properties.park_name || 'N/A'}</p>
                    <p><strong>Item Type:</strong> ${properties.item_type || 'N/A'}</p>
                    <p><strong>Description:</strong> ${properties.item_description || 'N/A'}</p>
                    <p><strong>Park Number:</strong> ${properties.park_number || 'N/A'}</p>
                    <p><strong>Equipment ID:</strong> ${properties.sap_equipment || 'N/A'}</p>
                    <p><strong>Location:</strong> ${properties.sap_functional_location || 'N/A'}</p>
                    <a href="${googleMapsLink}" target="_blank" class="navigate-btn">Navigate with Google Maps</a>
                `;
                document.getElementById('water-info-content').innerHTML = infoContent;

                map.setView(latlng, 18);

                waterMarkersLayer.eachLayer(function(l) {
                    l.closePopup();
                });

                showWaterInfo();
            });
        });
    });
}

// Function to populate water filter options
function populateWaterFilterOptions(parkNames, itemDescriptions) {
    var parkSelect = document.getElementById('park-select');
    var itemDescriptionSelect = document.getElementById('item-description-select');

    parkNames = Array.from(parkNames).sort();
    itemDescriptions = Array.from(itemDescriptions).sort();

    // Populate park select options
    parkNames.forEach(function(park) {
        var option = document.createElement('option');
        option.value = park;
        option.textContent = park;
        parkSelect.appendChild(option);
    });

    // Populate item description select options
    itemDescriptions.forEach(function(description) {
        var option = document.createElement('option');
        option.value = description;
        option.textContent = description;
        itemDescriptionSelect.appendChild(option);
    });

    parkSelect.addEventListener('change', applyWaterFilters);
    itemDescriptionSelect.addEventListener('change', applyWaterFilters);
}

// Implement the reset functionality for water fountain filters
document.getElementById('water-reset-btn').addEventListener('click', function() {
    location.reload();
});

// Function to apply water filters
function applyWaterFilters() {
    var selectedPark = document.getElementById('park-select').value;
    var selectedItemDescription = document.getElementById('item-description-select').value;

    if (highlightedPath) {
        map.removeLayer(highlightedPath);
        highlightedPath = null;
    }

    // Filter water fountains based on selected filters
    filteredWaterFountains = allWaterFountains.filter(function(item) {
        var parkMatch = selectedPark ? item.park_name === selectedPark : true;
        var descriptionMatch = selectedItemDescription ? item.item_description === selectedItemDescription : true;
        return parkMatch && descriptionMatch;
    });

    if (filteredWaterFountains.length > 0) {
        showFilteredWaterFountainCards();

        // Focus on the first matched outcome
        var firstLatLng = L.latLng(filteredWaterFountains[0].y, filteredWaterFountains[0].x);
        map.setView(firstLatLng, 18);
    } else {
        showNoResultsCard('water');
    }
}

// Function to show filtered water fountain cards
function showFilteredWaterFountainCards() {
    var cardsContainer = document.createElement('div');
    cardsContainer.id = 'filtered-water-results';
    cardsContainer.style.marginTop = '20px';

    filteredWaterFountains.forEach(function(item) {
        var card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <h3>${item.park_name || 'Unnamed Park'}</h3>
            <p>Type: ${item.item_type || 'N/A'}</p>
            <button onclick="showWaterFountainDetails(${item.objectid})">View Details</button>
        `;
        cardsContainer.appendChild(card);
    });

    var filterContainer = document.getElementById('water-filter-container');
    var existingResults = document.getElementById('filtered-water-results');
    if (existingResults) {
        filterContainer.removeChild(existingResults);
    }
    filterContainer.appendChild(cardsContainer);
}

// Function to show water fountain details
function showWaterFountainDetails(objectId) {
    var waterFountain = allWaterFountains.find(item => item.objectid == objectId);
    if (waterFountain) {
        showWaterInfo(waterFountain);
        var latlng = L.latLng(waterFountain.y, waterFountain.x);

        map.setView(latlng, 18);

        if (waterMarkersLayer) {
            waterMarkersLayer.eachLayer(function(layer) {
                if (layer.options.objectId == objectId) {
                    layer.openPopup();
                }
            });
        }
    }
}

// Function to show water fountain info
function showWaterInfo(waterFountain) {
    if (!waterInfoVisible) {
        document.getElementById('water-info').style.display = 'block';
        document.getElementById('water-filter-container').style.display = 'none';
        document.getElementById('filter-container').style.display = 'none';
        waterInfoVisible = true;
        bikeInfoVisible = false;
    }

    var googleMapsLink = `https://www.google.com/maps/dir/?api=1&destination=${waterFountain.y},${waterFountain.x}`;
    var infoContent = `
        <p><strong>Park Name:</strong> ${waterFountain.park_name || 'N/A'}</p>
        <p><strong>Item Type:</strong> ${waterFountain.item_type || 'N/A'}</p>
        <p><strong>Description:</strong> ${waterFountain.item_description || 'N/A'}</p>
        <p><strong>Park Number:</strong> ${waterFountain.park_number || 'N/A'}</p>
        <p><strong>Equipment ID:</strong> ${waterFountain.sap_equipment || 'N/A'}</p>
        <p><strong>Location:</strong> ${waterFountain.sap_functional_location || 'N/A'}</p>
        <a href="${googleMapsLink}" target="_blank" class="navigate-btn">Navigate with Google Maps</a>
    `;
    document.getElementById('water-info-content').innerHTML = infoContent;

    var latlng = L.latLng(waterFountain.y, waterFountain.x);
    map.setView(latlng, 18);
}

// Function to hide water fountain info
function hideWaterInfo() {
    document.getElementById('water-info').style.display = 'none';
    document.getElementById('water-filter-container').style.display = 'block';
    document.getElementById('filter-container').style.display = 'block';
    waterInfoVisible = false;
}

// Function to show water filter
function showWaterFilter() {
    hideWaterInfo();
    hideBikeInfo();
}

// Function to enable map interaction
function enableMapInteraction() {
    map.scrollWheelZoom.enable();
    map.dragging.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
    document.getElementById('explore-map-btn').style.display = 'none';
    document.getElementById('exit-map-btn').style.display = 'block';
}

// Function to disable map interaction
function disableMapInteraction() {
    map.scrollWheelZoom.disable();
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    document.getElementById('explore-map-btn').style.display = 'block';
    document.getElementById('exit-map-btn').style.display = 'none';
}

// Initialize bike info visibility
var bikeInfoVisible = false;

// Function to show bike info
function showBikeInfo(bikePath) {
    if (!bikeInfoVisible) {
        document.getElementById('bike-info').style.display = 'block';
        document.getElementById('filter-container').style.display = 'none';
        document.getElementById('water-filter-container').style.display = 'none';
        bikeInfoVisible = true;
        waterInfoVisible = false;
    }

    var googleMapsLink = `https://www.google.com/maps/dir/?api=1&destination=${bikePath.y},${bikePath.x}`;
    var infoContent = `
        <p><strong>Bikeway Name:</strong> ${bikePath.bikeway_name || 'N/A'}</p>
        <p><strong>Street Name:</strong> ${bikePath.street_name || 'N/A'}</p>
        <p><strong>Suburb:</strong> ${bikePath.suburb || 'N/A'}</p>
        <p><strong>Owner:</strong> ${bikePath.owner || 'N/A'}</p>
        <p><strong>Hierarchy:</strong> ${bikePath.hierarchy || 'N/A'}</p>
        <p><strong>Traffic Type:</strong> ${bikePath.traffic_types_description || 'N/A'}</p>
        <p><strong>Section Type:</strong> ${bikePath.section_types_description || 'N/A'}</p>
        <p><strong>Location Description:</strong> ${bikePath.locations_description || 'N/A'}</p>
        <p><strong>Bikeway Width:</strong> ${Math.round(bikePath.bikeway_width)} meters</p>
        <p><strong>Shape Length:</strong> ${Math.round(bikePath.shape_length)} meters</p>
        <a href="${googleMapsLink}" target="_blank" class="navigate-btn">Navigate with Google Maps</a>
    `;
    document.getElementById('info-content').innerHTML = infoContent;

    var latlng = getFeatureCenter(bikePath.geo_shape.geometry);
    map.setView(latlng, 18);
}

// Function to hide bike info
function hideBikeInfo() {
    document.getElementById('bike-info').style.display = 'none';
    document.getElementById('filter-container').style.display = 'block';
    document.getElementById('water-filter-container').style.display = 'block';
    bikeInfoVisible = false;
}

// Function to show filter
function showFilter() {
    hideBikeInfo();
    hideWaterInfo();
}

// Show filter initially
showFilter();

// Initialize filtered paths
var filteredBikePaths = [];
var filteredWaterFountains = [];

function showNoResultsCard(type) {
    var container = type === 'bike' ? document.getElementById('filter-container') : document.getElementById('water-filter-container');
    var existingResults = type === 'bike' ? document.getElementById('filtered-results') : document.getElementById('filtered-water-results');
    if (existingResults) {
        container.removeChild(existingResults);
    }

    var noResultsCard = document.createElement('div');
    noResultsCard.id = type === 'bike' ? 'filtered-results' : 'filtered-water-results';
    noResultsCard.className = 'result-card';
    noResultsCard.innerHTML = `
        <h3>No Results Found</h3>
        <p>Sorry, there are no ${type === 'bike' ? 'bike paths' : 'water fountains'} matching your current filter criteria. Please try different filter options.</p>
    `;
    container.appendChild(noResultsCard);
}