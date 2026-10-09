// ==========================================
// CIVICCONNECT MAP
// ==========================================

// Default location: Chhatrapati Sambhajinagar
const defaultLatitude = 19.8762;
const defaultLongitude = 75.3433;


// ==========================================
// MAP INITIALIZATION
// ==========================================

const map = L.map("map", {
    dragging: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    touchZoom: true,
    zoomControl: true,
    minZoom: 10,
    maxZoom: 22
}).setView(
    [defaultLatitude, defaultLongitude],
    15
);


// ==========================================
// SATELLITE MAP
// ==========================================

L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
        attribution: "Tiles &copy; Esri",
        maxZoom: 22,
        maxNativeZoom: 19
    }
).addTo(map);


// ==========================================
// ENABLE MAP DRAGGING
// ==========================================

map.dragging.enable();


// ==========================================
// MAP CURSOR
// ==========================================

const mapContainer = map.getContainer();

mapContainer.style.cursor = "grab";

map.on("mousedown", function () {
    mapContainer.style.cursor = "grabbing";
});

map.on("mouseup", function () {
    mapContainer.style.cursor = "grab";
});

map.on("mouseout", function () {
    mapContainer.style.cursor = "grab";
});


// ==========================================
// DEFAULT MARKER
// ==========================================

let marker = L.marker(
    [defaultLatitude, defaultLongitude],
    {
        draggable: true
    }
).addTo(map);

marker.bindPopup(
    "Enter a location and search.<br>" +
    "Then drag this marker to the exact issue point."
);


// ==========================================
// LOCATION INPUT
// ==========================================

const locationInput =
    document.querySelector("#location");


// ==========================================
// SELECTED COORDINATES
// ==========================================

let selectedLatitude = null;
let selectedLongitude = null;


// IMPORTANT:
// Make selected coordinates available globally
// so report.html can access them.

window.selectedLatitude = null;
window.selectedLongitude = null;


// ==========================================
// CREATE / GET HIDDEN COORDINATE INPUTS
// ==========================================

function getCoordinateInputs() {

    const form =
        locationInput
            ? locationInput.closest("form")
            : document.querySelector("#reportForm");


    if (!form) {

        console.error(
            "Report form not found."
        );

        return {
            latitudeInput: null,
            longitudeInput: null
        };
    }


    let latitudeInput =
        document.querySelector("#latitude");

    let longitudeInput =
        document.querySelector("#longitude");


    // Create latitude input if missing
    if (!latitudeInput) {

        latitudeInput =
            document.createElement("input");

        latitudeInput.type = "hidden";
        latitudeInput.id = "latitude";
        latitudeInput.name = "latitude";

        form.appendChild(latitudeInput);
    }


    // Create longitude input if missing
    if (!longitudeInput) {

        longitudeInput =
            document.createElement("input");

        longitudeInput.type = "hidden";
        longitudeInput.id = "longitude";
        longitudeInput.name = "longitude";

        form.appendChild(longitudeInput);
    }


    return {
        latitudeInput,
        longitudeInput
    };
}


// ==========================================
// SAVE COORDINATES
// ==========================================

function saveCoordinates(latitude, longitude) {

    // Make sure values are numbers
    latitude = Number(latitude);
    longitude = Number(longitude);


    // Check coordinates
    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {

        console.error(
            "Invalid coordinates:",
            latitude,
            longitude
        );

        return;
    }


    // Save locally
    selectedLatitude = latitude;
    selectedLongitude = longitude;


    // IMPORTANT:
    // Make coordinates accessible to report.html

    window.selectedLatitude = latitude;
    window.selectedLongitude = longitude;


    // Get/create hidden inputs

    const {
        latitudeInput,
        longitudeInput
    } = getCoordinateInputs();


    // Save values in hidden inputs

    if (latitudeInput) {

        latitudeInput.value =
            latitude.toFixed(6);
    }


    if (longitudeInput) {

        longitudeInput.value =
            longitude.toFixed(6);
    }


    // Debug information

    console.log(
        "================================"
    );

    console.log(
        "CivicConnect location selected"
    );

    console.log(
        "Latitude:",
        latitude.toFixed(6)
    );

    console.log(
        "Longitude:",
        longitude.toFixed(6)
    );

    console.log(
        "window.selectedLatitude:",
        window.selectedLatitude
    );

    console.log(
        "window.selectedLongitude:",
        window.selectedLongitude
    );

    console.log(
        "================================"
    );
}


// ==========================================
// UPDATE MARKER
// ==========================================

function updateMarker(latitude, longitude) {

    latitude = Number(latitude);
    longitude = Number(longitude);


    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {

        console.error(
            "Invalid marker coordinates."
        );

        return;
    }


    selectedLatitude = latitude;
    selectedLongitude = longitude;


    // Keep global values synchronized

    window.selectedLatitude = latitude;
    window.selectedLongitude = longitude;


    // Move marker

    marker.setLatLng([
        latitude,
        longitude
    ]);


    // Save coordinates

    saveCoordinates(
        latitude,
        longitude
    );
}


// ==========================================
// CLEAN USER LOCATION
// ==========================================

function cleanLocationQuery(query) {

    let cleaned = query;

    // Remove unnecessary words
    cleaned = cleaned.replace(
        /\b(near|nearby|beside|besides|opposite|close to|around|at|behind|in front of)\b/gi,
        " "
    );

    // Common spelling variations
    cleaned = cleaned.replace(
        /\baurangabad\b/gi,
        "Chhatrapati Sambhajinagar"
    );

    cleaned = cleaned.replace(
        /\bmaharastra\b/gi,
        "Maharashtra"
    );

    cleaned = cleaned.replace(
        /\bmaharashtra state\b/gi,
        "Maharashtra"
    );

    // Remove unnecessary punctuation
    cleaned = cleaned.replace(
        /[,]+/g,
        " "
    );

    // Remove extra spaces
    cleaned = cleaned.replace(
        /\s+/g,
        " "
    );

    return cleaned.trim();
}


// ==========================================
// CREATE SEARCH QUERIES
// ==========================================

function createSearchQueries(originalQuery) {

    const cleanedQuery =
        cleanLocationQuery(originalQuery);


    const queries = [];


    // 1. Original query
    queries.push(originalQuery);


    // 2. Cleaned query
    if (
        cleanedQuery &&
        cleanedQuery !== originalQuery
    ) {

        queries.push(cleanedQuery);
    }


    // 3. Add Chhatrapati Sambhajinagar
    if (
        !/chhatrapati sambhajinagar/i.test(
            cleanedQuery
        ) &&
        !/aurangabad/i.test(cleanedQuery)
    ) {

        queries.push(
            cleanedQuery +
            ", Chhatrapati Sambhajinagar, Maharashtra"
        );
    }


    // 4. If query contains MIT
    if (/mit/i.test(cleanedQuery)) {

        queries.push(
            "MIT College Chhatrapati Sambhajinagar Maharashtra"
        );

        queries.push(
            "MIT Satara Parisar Chhatrapati Sambhajinagar"
        );
    }


    // 5. Remove road names if necessary
    const withoutRoad =
        cleanedQuery.replace(
            /\b(road|rd|street|st|lane|main road|bypass)\b/gi,
            " "
        ).replace(/\s+/g, " ").trim();


    if (
        withoutRoad &&
        withoutRoad !== cleanedQuery
    ) {

        queries.push(
            withoutRoad +
            ", Chhatrapati Sambhajinagar, Maharashtra"
        );
    }


    // Remove duplicate queries
    return [...new Set(queries)];
}


// ==========================================
// SEARCH ONE QUERY
// ==========================================

async function searchNominatim(query) {

    const url =
        "https://nominatim.openstreetmap.org/search?" +
        "format=json" +
        "&q=" +
        encodeURIComponent(query) +
        "&limit=5" +
        "&countrycodes=in" +
        "&addressdetails=1";


    try {

        const response =
            await fetch(
                url,
                {
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        if (!response.ok) {
            return [];
        }


        const data =
            await response.json();


        return data;

    }

    catch (error) {

        console.error(
            "Nominatim search error:",
            error
        );

        return [];
    }
}


// ==========================================
// FIND BEST RESULT
// ==========================================

function chooseBestResult(results) {

    if (!results || results.length === 0) {
        return null;
    }


    const usefulResult =
        results.find(
            result => {

                const type =
                    result.type || "";

                const name =
                    result.display_name || "";

                return (
                    type === "college" ||
                    type === "university" ||
                    type === "school" ||
                    type === "road" ||
                    type === "building" ||
                    /MIT/i.test(name)
                );
            }
        );


    return usefulResult || results[0];
}


// ==========================================
// SEARCH LOCATION
// ==========================================

async function searchLocation() {

    const originalQuery =
        locationInput.value.trim();


    if (originalQuery === "") {

        alert(
            "Please enter a nearby place, landmark, road or area."
        );

        return;
    }


    marker
        .bindPopup(
            "Searching location..."
        )
        .openPopup();


    const queries =
        createSearchQueries(
            originalQuery
        );


    console.log(
        "Location search queries:",
        queries
    );


    let bestResult = null;


    for (
        const query of queries
    ) {

        console.log(
            "Searching:",
            query
        );


        const results =
            await searchNominatim(
                query
            );


        if (results.length > 0) {

            bestResult =
                chooseBestResult(
                    results
                );

            if (bestResult) {
                break;
            }
        }


        await new Promise(
            resolve =>
                setTimeout(resolve, 500)
        );
    }


    // ==========================================
    // NO RESULT
    // ==========================================

    if (!bestResult) {

        marker
            .bindPopup(
                "Location could not be found.<br><br>" +
                "Try entering a nearby landmark, " +
                "college, road or area."
            )
            .openPopup();


        alert(
            "We couldn't find that location. " +
            "Try a nearby landmark, college, road or area."
        );

        return;
    }


    // ==========================================
    // GET COORDINATES
    // ==========================================

    const latitude =
        parseFloat(bestResult.lat);

    const longitude =
        parseFloat(bestResult.lon);


    // Save coordinates

    updateMarker(
        latitude,
        longitude
    );


    // Move map

    map.setView(
        [latitude, longitude],
        17
    );


    // ==========================================
    // SHOW RESULT
    // ==========================================

    marker
        .bindPopup(
            "<b>Location Found</b><br><br>" +
            bestResult.display_name +
            "<br><br>" +
            "📍 Now drag the marker to the " +
            "exact issue location."
        )
        .openPopup();


    console.log(
        "Location found:",
        bestResult.display_name
    );
}


// ==========================================
// SEARCH WHEN INPUT CHANGES
// ==========================================

locationInput.addEventListener(
    "change",
    function () {

        searchLocation();

    }
);


// ==========================================
// SEARCH WHEN ENTER IS PRESSED
// ==========================================

locationInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            searchLocation();

        }

    }
);


// ==========================================
// CLICK MAP
// ==========================================

map.on(
    "click",
    async function (event) {

        const latitude =
            event.latlng.lat;

        const longitude =
            event.latlng.lng;


        // Save coordinates

        updateMarker(
            latitude,
            longitude
        );


        // Show selected location

        marker
            .bindPopup(
                "<b>Selected Issue Location</b><br><br>" +
                "Latitude: " +
                latitude.toFixed(6) +
                "<br>" +
                "Longitude: " +
                longitude.toFixed(6) +
                "<br><br>" +
                "Getting location name..."
            )
            .openPopup();


        // Reverse geocoding

        try {

            const response =
                await fetch(
                    "https://nominatim.openstreetmap.org/reverse?" +
                    "format=json" +
                    "&lat=" +
                    latitude +
                    "&lon=" +
                    longitude +
                    "&addressdetails=1",
                    {
                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );


            const data =
                await response.json();


            if (data.display_name) {

                marker
                    .bindPopup(
                        "<b>Exact Issue Location</b><br><br>" +
                        data.display_name +
                        "<br><br>" +
                        "Latitude: " +
                        latitude.toFixed(6) +
                        "<br>" +
                        "Longitude: " +
                        longitude.toFixed(6)
                    )
                    .openPopup();
            }

        }

        catch (error) {

            console.error(
                "Reverse geocoding error:",
                error
            );
        }

    }
);


// ==========================================
// DRAG MARKER
// ==========================================

marker.on(
    "dragend",
    async function () {

        const position =
            marker.getLatLng();


        const latitude =
            position.lat;

        const longitude =
            position.lng;


        // Save coordinates

        updateMarker(
            latitude,
            longitude
        );


        marker
            .bindPopup(
                "<b>Exact Issue Location</b><br><br>" +
                "Latitude: " +
                latitude.toFixed(6) +
                "<br>" +
                "Longitude: " +
                longitude.toFixed(6) +
                "<br><br>" +
                "Getting location name..."
            )
            .openPopup();


        // Reverse geocoding

        try {

            const response =
                await fetch(
                    "https://nominatim.openstreetmap.org/reverse?" +
                    "format=json" +
                    "&lat=" +
                    latitude +
                    "&lon=" +
                    longitude,
                    {
                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );


            const data =
                await response.json();


            if (data.display_name) {

                marker
                    .bindPopup(
                        "<b>Exact Issue Location</b><br><br>" +
                        data.display_name +
                        "<br><br>" +
                        "Latitude: " +
                        latitude.toFixed(6) +
                        "<br>" +
                        "Longitude: " +
                        longitude.toFixed(6)
                    )
                    .openPopup();

            }

        }

        catch (error) {

            console.error(
                "Reverse geocoding error:",
                error
            );

        }

    }
);