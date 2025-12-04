// Drawing and Saving Polygonsd
let polygons = [];
let polygonList = [];
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var drawControl = new L.Control.Draw({
  position: "topright",
  draw: {
    polygon: {
      allowIntersection: false,
      showArea: true,
      shapeOptions: { color: "red" },
    },
    polyline: false,
    rectangle: false,
    circle: false,
    marker: false,
    circlemarker: false,
  },
  edit: {
    featureGroup: drawnItems,
  },
});
map.addControl(drawControl);
map.on(L.Draw.Event.CREATED, async function (event) {
    var layer = event.layer;

    if (event.layerType === "polygon") {
        const latlngs = layer.getLatLngs()[0];
        const coords = latlngs.map((p) => [p.lat, p.lng]);

        const farmData = {
            name: `Farm ${Date.now()}`,
            color: "#FF0000",
            responsiblePerson: "Default User",
            farmType: "None",
            polygon: coords
        };

        try {
            const response = await fetch("http://localhost:5212/api/farm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(farmData)
            });

            if (!response.ok) {
                console.error("Server error:", await response.text());
                alert("❌ Failed to save farm!");
                return;
            }

            const result = await response.json();
            console.log("Farm saved! ID:", result.id);
        }
        catch (err) {
            console.error("Fetch failed:", err);
            alert("❌ Cannot connect to server");
        }
    }

    drawnItems.addLayer(layer);
});
async function loadFarmsFromDB() {
    try {
        const response = await fetch("http://localhost:5212/api/farm");
        const farms = await response.json();

        farms.forEach(farm => {
            if (!farm.polygon || farm.polygon.length === 0) return;

            // Convert [[lat, lng], [lat, lng]] to Leaflet LatLng objects
            const latlngs = farm.polygon.map(p => L.latLng(p[0], p[1]));

            // Draw polygon
            const polygon = L.polygon(latlngs, {
                color: farm.color || "green",
                weight: 2
            }).addTo(map);

            polygon.bindPopup(`<b>${farm.name}</b><br>ID: ${farm.id}`);
        });

        console.log("Loaded farms:", farms);
    } catch (err) {
        console.error("Error loading farms:", err);
    }
}
