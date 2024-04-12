const map = L.map('mapAjax', {
    center: [28.345, 84.34],
    zoom: 7,
    zoomControl: true
});

const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const hotosm = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
});

const earthquakeLayer = L.layerGroup();
//const earthquakeLayer = L.markerClusterGroup();


// $(document).ready(function () {
// // API endpoint for earthquakes in Nepal. change the parameters using the API documentation
// const apiUrl = 'https://earthquake.usgs.gov/fdsnws/event/1/query?' +
// 'format=geojson&starttime=2000-01-01&minlatitude=26&maxlatitude=31&minlongitude=80&maxlongitude=89&limit=20';
//     // Use jQuery AJAX to fetch the earthquakes in Nepal
//     $.ajax({
//         url: apiUrl,
//         method: 'GET',
//         dataType: 'json',
//         success: function (data) {
//             // Handle the data
//             displayEarthquakes(data.features);
//             //console.log(data.features);
//         },
//         error: function (error) {
//             console.error('Error fetching earthquake data:', error);
//         }
//     });
// });



function displayEarthquakes(earthquakes) {
    const earthquakeList = $('#earthquakeList');

    earthquakes.forEach(function (earthquake) {
        // Create a marker for each earthquake
        const marker = L.marker([earthquake.geometry.coordinates[1], earthquake.geometry.coordinates[0]])
            .bindPopup(earthquake.properties.place + ' - Magnitude: ' + earthquake.properties.mag)
        // .addTo(earthquakeLayer);
        earthquakeLayer.addLayer(marker);

        // Add earthquake details to the list
        const listItem = $('<li></li>').text(earthquake.properties.place + ' - Magnitude: ' + earthquake.properties.mag);
        earthquakeList.append(listItem);
    });
}
const apiUrl = 'https://earthquake.usgs.gov/fdsnws/event/1/query?' +
    'format=geojson&starttime=2000-01-01&minlatitude=26&maxlatitude=31&minlongitude=80&maxlongitude=89&limit=10';


try {
    //Using fetch to access the API
    fetch(apiUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            //console.log(data);
            displayEarthquakes(data.features);
        })
        .catch(function (error) {
            console.error('Error fetching data:', error);
        });
}
catch (error) {
    alert(`The problem is ${error}`)
}

const baseMaps = {
    "OpenStreetMap": tiles,
    "Hot OSM": hotosm
};

const overlayMaps = {
    "Earthquakes": earthquakeLayer
};
const layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);


// $.getJSON(apiUrl, function (data) {
//     console.log(data);
// })

