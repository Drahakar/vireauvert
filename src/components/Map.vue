district<template>
    <div id="map"></div>
</template>

<script lang="ts">
import "leaflet/dist/leaflet.css"
import L from "leaflet";
import { defineComponent, watch } from 'vue';
import { useStore } from "@/stores/store";
import { DistrictProperties } from "@/models/map";
import { CatastropheType } from "@/models/catastrophes";

function generateIcons(): Map<CatastropheType, L.Icon> {
    const icons = new Map<CatastropheType, L.Icon>();
    for (const value of Object.values(CatastropheType)) {
        const icon = L.icon({
            iconUrl: `/icons/${value.toLowerCase()}.png`,
            iconSize: [32, 32]
        });
        icons.set(value, icon);
    }
    return icons;
}

export default defineComponent({
    props: ['district-selected'],
    emits: ['update:district-selected'],
    setup() {
        const store = useStore();
        const icons = generateIcons();

        const electoralLayer = L.geoJSON(undefined, {
            onEachFeature: (feature, layer) => {
                const properties: DistrictProperties = feature.properties;
                layer.bindTooltip(properties.name);
                layer.addEventListener('click', () => {
                    store.district = store.district !== properties.id ? properties.id : 0;
                });
            },
            style: function (feature) {
                if (store.district && feature) {
                    const properties: DistrictProperties = feature.properties;
                    return {
                        fill: true,
                        fillColor: properties.id === store.district ? '#0000ff' : '#ffffff'
                    }
                }
                return {};
            }
        });
        const iconLayer = L.layerGroup();

        watch(() => store.district, () => {
            electoralLayer.resetStyle();
        });

        watch(() => store.electoralMap, elec => {
            electoralLayer.clearLayers();
            electoralLayer.addData(elec);
        });

        watch(() => store.catastrophesForCurrentYear, catastrophes => {
            iconLayer.clearLayers();
            for (const catastrophe of catastrophes) {
                const marker = L.marker(catastrophe.location, {
                    title: catastrophe.description,
                    icon: icons.get(catastrophe.type)
                });
                marker.bindTooltip(catastrophe.description);
                marker.addTo(iconLayer);
            }
        });
        return { store, electoralLayer, iconLayer };
    },

    async mounted() {
        await this.store.loadElectoralMap();
        const map = new L.Map("map", {
            center: [45.5001, -73.5679],
            zoom: 11
        });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap"
        }).addTo(map);
        this.electoralLayer.addTo(map);
        this.iconLayer.addTo(map);
    }
})

</script>

<style scoped>
#map {
    width: 75%;
    height: 90%;
}
</style>