<template>
    <div id="wrapper">
        <div id="map" ref="mapElement"></div>
    </div>
</template>

<script lang="ts">
import "leaflet/dist/leaflet.css"
import L from "leaflet";
import { defineComponent, ref, watch } from 'vue';
import { useStore } from "@/stores/store";
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

const unselectedStyle: L.PathOptions = {
    fillColor: '#ffffff',
    color: '#333333',
    opacity: 0.5,
    weight: 1
};
const selectedStyle: L.PathOptions = {
    fillColor: '#0099ff',
    color: '#333333',
    opacity: 0.7,
    fillOpacity: 0.3,
    weight: 2
};

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

        const districtLayers = new Map<string, L.GeoJSON>();
        const electoralLayer = L.geoJSON(undefined, {
            onEachFeature: (feature, layer) => {
                const properties: DistrictProperties = feature.properties;
                layer.bindTooltip(properties.name);
                layer.addEventListener('click', () => {
                    store.district = store.district !== properties.id ? properties.id : 0;
                });
                const geo = layer as L.GeoJSON;
                if (properties.id === store.district) {
                    geo.setStyle(selectedStyle);
                } else {
                    geo.setStyle(unselectedStyle);
                }
                districtLayers.set(properties.id.toString(), geo);
            }
        });

        watch(() => store.district, (newDistrict, oldDistrict) => {
            const oldLayer = districtLayers.get(oldDistrict.toString());
            if (oldLayer) {
                oldLayer.setStyle(unselectedStyle);
            }
            const newLayer = districtLayers.get(newDistrict.toString());
            if (newLayer) {
                newLayer.setStyle(selectedStyle);
            }
        });

        watch(() => store.electoralMap, elec => {
            electoralLayer.clearLayers();
            electoralLayer.addData(elec);
        });

        const iconLayer = L.layerGroup();

        const selectYearLayer = (newYear: number, oldYear?: number) => {
            if (oldYear) {
                const oldLayer = yearLayers.get(oldYear.toString());
                if (oldLayer) {
                    iconLayer.removeLayer(oldLayer);
                }
            } else {
                iconLayer.clearLayers();
            }
            const newLayer = yearLayers.get(newYear.toString());
            if (newLayer) {
                iconLayer.addLayer(newLayer);
            }
        };

        const yearLayers = new Map<string, L.LayerGroup>();
        watch(() => store.yearlyData, data => {
            for (const [key, snapshot] of data) {
                if (yearLayers.has(key.toString())) {
                    continue;
                }
                const yearLayer = L.layerGroup();
                for (const catastrophe of snapshot.catastrophes) {
                    const title = formatDescription(catastrophe);
                    const marker = L.marker(catastrophe.location, {
                        title: title,
                        icon: icons.get(catastrophe.type)
                    });
                    marker.bindTooltip(title);
                    marker.addTo(yearLayer);
                }
                yearLayers.set(key.toString(), yearLayer);
            }
            selectYearLayer(store.year);
        });

        watch(() => store.year, selectYearLayer);

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
                attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
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
    height: 100%;
}
</style>
<style>
.leaflet-control-container {
    width: 100%;
    height: 100%;
}
</style>