<template>
    <div id="map"></div>
</template>

<script lang="ts">
import "leaflet/dist/leaflet.css"
import L from "leaflet";

export default {
    mounted() {
        var map = new L.Map("map", {
            center: [45.5001, -73.5679],
            zoom: 15
        });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap"
        }).addTo(map);
    }
}
</script>

<style scoped>
#map {
    width: 100%;
    height: 100%;
}
</style>