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
import OverlayControl from "./OverlayControl.vue";

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
const meteoOverlayStyle: L.PathOptions = {
    fillColor: '#ffffff',
    fillOpacity: 0,
    opacity: 0,
    weight: 0
}

export default defineComponent({
    props: ["district-selected"],
    emits: ["update:district-selected"],
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
                layer.addEventListener("click", () => {
                    store.district = store.district !== properties.id ? properties.id : 0;
                });
                const geo = layer as L.GeoJSON;
                if (properties.id === store.district) {
                    geo.setStyle(selectedStyle);
                }
                else {
                    geo.setStyle(unselectedStyle);
                }
                districtLayers.set(properties.id.toString(), geo);
            }
        });
        const statOverlayDistricts = new Map<string, L.GeoJSON>();
        const meteoLayer = L.geoJSON(undefined, {
            interactive: false,
            style: meteoOverlayStyle,
            onEachFeature: (feature, layer) => {
                const properties: DistrictProperties = feature.properties;
                statOverlayDistricts.set(properties.id.toString(), layer as L.GeoJSON);
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
            meteoLayer.clearLayers();
            meteoLayer.addData(elec);
        });
        const iconLayer = L.layerGroup();
        const updateStatOverlay = () => {
            /*const now = store.yearlyData.get(store.year);
            for (const geo of statOverlayDistricts.values()) {
                if (store.currentStatOverlay && now) {
                    if (geo.feature) {
                        const feature = geo.feature as Feature<Geometry, any>;
                        const properties: DistrictProperties = feature.properties;
                        const region = store.getRegion(properties.id);
                        if (region) {
                            const delta = now.statistics.get(region.id);
                            if (delta) {
                                const { color, opacity } = store.currentStatOverlay.translateToOpacity(delta);
                                geo.setStyle({
                                    ...meteoOverlayStyle,
                                    fillColor: color,
                                    fillOpacity: Math.min(1, Math.max(0, opacity))
                                });
                            }
                        }
                    }
                } else {
                    geo.setStyle(meteoOverlayStyle);
                }
            }*/
        };
        const onYearChanged = (newYear: number, oldYear?: number) => {
            if (oldYear) {
                const oldLayer = yearLayers.get(oldYear.toString());
                if (oldLayer) {
                    iconLayer.removeLayer(oldLayer);
                }
            }
            else {
                iconLayer.clearLayers();
            }
            const newLayer = yearLayers.get(newYear.toString());
            if (newLayer) {
                iconLayer.addLayer(newLayer);
            }
            updateStatOverlay();
        };
        const yearLayers = new Map<string, L.LayerGroup>();
        watch(() => store.yearlyData, (data, oldData) => {
            for (const [year, snapshot] of data.filterNot((_, k) => oldData.has(k))) {
                if (yearLayers.has(year.toString())) {
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
                yearLayers.set(year.toString(), yearLayer);
            }
            onYearChanged(store.year);
        });
        watch(() => store.year, onYearChanged);
        watch(() => store.currentStatOverlay, updateStatOverlay);
        const mapElement = ref<HTMLDivElement | null>(null);
        return { store, electoralLayer, statOverlayLayer: meteoLayer, iconLayer, mapElement };
    },
    async mounted() {
        if (this.mapElement) {
            const map = new L.Map(this.mapElement, {
                center: [45.5001, -73.5679],
                zoom: 11
            });
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
            }).addTo(map);
            this.statOverlayLayer.addTo(map);
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
    },
    components: { OverlayControl }
})

</script>

<style scoped>
#map {
    height: 100%;
}

#overlay {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 400;
}
</style>
<style>
.leaflet-control-container {
    width: 100%;
    height: 100%;
}
</style>