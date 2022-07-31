<template>
    <div id="map"></div>
</template>

<script lang="ts">
import "leaflet/dist/leaflet.css"
import L, { icon } from "leaflet";
import { defineComponent, watch } from 'vue';
import { useStore } from "@/stores/store";

export default defineComponent({
    props: ['region-selected'],
    emits: ['update:region-selected'],
    setup() {
        const store = useStore();

        const electoralLayer = L.geoJSON(undefined, {
            onEachFeature: (feature, layer) => {
                const name: string = feature.properties.name.trim();
                layer.bindTooltip(name);
                layer.addEventListener('click', () => {
                    if (store.region !== name) {
                        store.region = name;
                    } else {
                        store.region = "";
                    }
                });
            },
            style: function(feature) {
                if(!store.region) {
                    return {}
                }
                else if(feature?.properties.name.trim() == store.region) {
                    return {
                        fillColor: '#0000ff',
                    }
                } else {
                    return {
                        fillColor: '#ffffff',
                    }
                }
            }
        });
        const iconLayer = L.layerGroup();

        watch(() => store.region, () => {
            electoralLayer.resetStyle();
        });

        watch(() => store.electoralMap, elec => {
            electoralLayer.clearLayers();
            electoralLayer.addData(elec);
        });

        watch(() => store.catastrophesForCurrentYear, catastrophes => {
            iconLayer.clearLayers();
            for (const catastrophe of catastrophes) {
                console.log(catastrophe.location.toString());
                const marker = L.marker(catastrophe.location, {
                    title: catastrophe.description
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