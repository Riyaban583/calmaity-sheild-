var map = L.map('map').setView([20.5937, 78.9629], 3); // Global view

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
}).addTo(map);

// Predefined historically high-risk disaster areas
var historicalDisasters = [
    { lat: 35.6895, lon: 139.6917, type: "Earthquake", severity: "high" },  // Tokyo, Japan
    { lat: 19.4326, lon: -99.1332, type: "Earthquake", severity: "high" }, // Mexico City, Mexico
    { lat: 31.2304, lon: 121.4737, type: "Flood", severity: "moderate" },  // Shanghai, China
    { lat: -33.8688, lon: 151.2093, type: "Wildfire", severity: "high" },  // Sydney, Australia
    { lat: 12.8797, lon: 121.7740, type: "Typhoon", severity: "high" }    // Philippines
];

function addMarker(lat, lon, disasterType, severity, url = "#", language) {
    let iconMap = {
        "Earthquake": "https://cdn-icons-png.flaticon.com/128/4823/4823086.png",
        "Flood": "https://cdn-icons-png.flaticon.com/128/3176/3176299.png",
        "Wildfire": "https://cdn-icons-png.flaticon.com/128/1492/1492855.png",
        "Typhoon": "https://cdn-icons-png.flaticon.com/128/848/848485.png",
        "Unknown": "https://cdn-icons-png.flaticon.com/128/565/565509.png"
    };

    let iconUrl = iconMap[disasterType] || iconMap["Unknown"];
    let translatedType = translate(disasterType, language); // Translate disaster type
    let translatedSeverity = translate(severity.toUpperCase(), language); // Translate severity level

    let customIcon = L.icon({
        iconUrl: iconUrl,
        iconSize: [30, 30],
        iconAnchor: [15, 30]
    });

    L.marker([lat, lon], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
            <b>Type:</b> ${translatedType}<br>
            <b>Severity:</b> ${translatedSeverity}<br>
            <a href='${url}' target='_blank'>More Info</a>
        `);
}

// Add historical disaster markers with default language as 'en' (English)
historicalDisasters.forEach(disaster => {
    addMarker(disaster.lat, disaster.lon, disaster.type, disaster.severity, "#", "en");
});

async function fetchDisasterData(language = "en") {
    try {
        let response = await fetch('https://api.reliefweb.int/v1/reports?appname=demo&profile=full&limit=10');
        let data = await response.json();

        document.getElementById('last-updated').innerText = translate(`Last Updated: ${new Date().toLocaleString()}`, language);

        data.data.forEach(report => {
            let lat = report.fields.primary_country.geo?.lat || 20.5937;
            let lon = report.fields.primary_country.geo?.lon || 78.9629;
            let disasterType = report.fields.disaster_type ? report.fields.disaster_type[0].name : 'Unknown';
            let severity = disasterType.includes('Earthquake') ? 'high' :
                           (disasterType.includes('Flood') ? 'moderate' : 'low');

            addMarker(lat, lon, disasterType, severity, report.fields.url, language);
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        L.popup()
            .setLatLng(map.getCenter())
            .setContent(translate('<b>Error:</b> Unable to fetch disaster data!', language))
            .openOn(map);
    }
}

// Placeholder translation function
function translate(text, language) {
    // Replace with integration to a real translation API like Google Translate
    const translations = {
        "en": { "Earthquake": "Earthquake", "Flood": "Flood", "Wildfire": "Wildfire", "Typhoon": "Typhoon", "high": "High", "moderate": "Moderate", "low": "Low", "Last Updated:": "Last Updated:" },
        "es": { "Earthquake": "Terremoto", "Flood": "Inundación", "Wildfire": "Incendio forestal", "Typhoon": "Tifón", "high": "Alto", "moderate": "Moderado", "low": "Bajo", "Last Updated:": "Última actualización:" },
        "fr": { "Earthquake": "Tremblement de terre", "Flood": "Inondation", "Wildfire": "Feu de forêt", "Typhoon": "Typhon", "high": "Élevé", "moderate": "Modéré", "low": "Faible", "Last Updated:": "Dernière mise à jour:" }
        // Add more language mappings here
    };

    return translations[language]?.[text] || text; // Return translated text or original if not available
}

// Event listener for language selection
document.getElementById('language-selector').addEventListener('change', function(event) {
    let selectedLanguage = event.target.value;
    fetchDisasterData(selectedLanguage); // Fetch and update map data based on selected language
});

fetchDisasterData();