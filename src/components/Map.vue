<template>
    <div id="map"></div>
</template>

<script lang="ts">
import "leaflet/dist/leaflet.css"
import L from "leaflet";
import axios from 'axios';
import { kml } from "@tmcw/togeojson";
import { defineComponent } from 'vue';
import { useStore } from "@/stores/store";

export default defineComponent ({
    props: ['region-selected'],
    emits: ['update:region-selected'],
    async mounted() {
        const store = useStore();

        const elect = await axios.get('data/carte2017simple.kml', { responseType: 'text' });
        const doc = new DOMParser().parseFromString(elect.data, 'text/xml');
        const geojson = kml(doc);

        let map = new L.Map("map", {
            center: [45.5001, -73.5679],
            zoom: 11
        });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap"
        }).addTo(map);
        L.geoJSON(geojson, {
            onEachFeature: (feature, layer) => {
                const name: string = feature.properties.name.trim();
                layer.bindTooltip(name);
                layer.addEventListener('click', () => {
                    store.region = name;
                });
            }
        }).addTo(map);
    }
})

</script>

<style scoped>
#map {
    width: 75%;
    height: 90%;
}
</style>