<template>
    <div id="map" ref="mapElement"></div>
</template>

<script lang="ts">
import "leaflet/dist/leaflet.css"
import L from "leaflet";
import { defineComponent, ref, watch } from 'vue';
import { MAX_YEAR, MIN_YEAR, useStore } from "@/stores/store";
import { DistrictProperties } from "@/models/map";
import { Catastrophe, CatastropheType, formatDescription } from "@/models/catastrophes";

function generateIcons(): Map<CatastropheType, L.Icon> {
    const icons = new Map<CatastropheType, L.Icon>();
    for (const value of Object.values(CatastropheType)) {
        const icon = L.icon({
            iconUrl: `/icons/${value.toLowerCase()}_b.png`,
            iconSize: [48, 48]
        });
        icons.set(value, icon);
    }
    return icons;
}

export default defineComponent({
    props: ['district-selected'],
    emits: ['update:district-selected'],
    data() {
        return {
            map: null as L.Map | null
        };
    },
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
                        fillColor: properties.id === store.district ? '#0000ff' : '#ffffff'
                    }
                }
                return {};
            }
        });

        watch(() => store.district, () => {
            electoralLayer.resetStyle();
        });

        watch(() => store.electoralMap, elec => {
            electoralLayer.clearLayers();
            electoralLayer.addData(elec);
        });

        const iconLayer = L.layerGroup();

        const yearLayers = new Map<string, L.LayerGroup>();
        watch(() => store.yearlyData, data => {
            for (let year = MIN_YEAR; year <= MAX_YEAR; ++year) {
                if (yearLayers.has(year.toString())) {
                    continue;
                }
                const yearData = data.get(year);
                if (!yearData) {
                    continue;
                }

                const yearLayer = L.layerGroup();
                for (const catastrophe of yearData.catastrophes) {
                    const title = formatDescription(catastrophe);
                    const marker = L.marker(catastrophe.location, {
                        title: title,
                        icon: icons.get(catastrophe.type)
                    });
                    marker.bindTooltip(title);
                    marker.addTo(yearLayer);
                }
                yearLayers.set(year.toString(), yearLayer);
            }
            const layer = yearLayers.get(store.year.toString());
            if (layer) {
                iconLayer.clearLayers();
                iconLayer.addLayer(layer);
            }
        });

        watch(() => store.year, year => {
            const layer = yearLayers.get(year.toString());
            if (layer) {
                iconLayer.clearLayers();
                iconLayer.addLayer(layer);
            }
        });

        const mapElement = ref<HTMLDivElement | null>(null);
        return { store, electoralLayer, iconLayer, mapElement };
    },

    async mounted() {
        await this.store.loadAdminRegionData();
        await this.store.loadElectoralMap();

        if (this.mapElement) {
            const map = new L.Map(this.mapElement, {
                center: [45.5001, -73.5679],
                zoom: 11
            });
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: "&copy; OpenStreetMap"
            }).addTo(map);
            this.electoralLayer.addTo(map);
            this.iconLayer.addTo(map);

            this.map = map;
        }
    },

    methods: {
        focusCatastrophe(catastrophe: Catastrophe) {
            if (this.map) {
                this.map.setView(catastrophe.location, this.map.getZoom(), {
                    animate: true
                });
            }
        }
    }
})

</script>

<style scoped>
#map {
    width: 75%;
    height: 90%;
}
</style>