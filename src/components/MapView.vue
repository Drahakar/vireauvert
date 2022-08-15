<template>
    <div id="wrapper">
        <div id="map" ref="mapElement"></div>
        <div id="gradient">
            <div class="step" v-for="(colour, index) of gradientSteps" :style="{ backgroundColor: colour }">
                <span class="selected" v-if="isSelectedGradientStep(store.selectedData, index)"></span>
                <span class="tooltip">
                    + {{ (index * 0.1).toLocaleString('fr-CA', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                    }} ° C
                </span>
            </div>
            <div class="label">° C</div>
        </div>
    </div>
</template>

<script lang="ts">
import "leaflet/dist/leaflet.css"
import L from "leaflet";
import { defineComponent, ref, watch } from 'vue';
import { useStore } from "@/stores/store";
import { DistrictProperties } from "@/models/map";
import { Catastrophe, CatastropheType, formatDescription, getIconUrl } from "@/models/catastrophes";
import { Feature, Geometry, Polygon } from "geojson";
import { getGradientColourIndex, temperatureGradient } from "@/models/climate";
import { RegionSnapshot } from "@/models/yearly_data";
import axios from "axios";

function generateIcons(): Map<CatastropheType, L.Icon> {
    const icons = new Map<CatastropheType, L.Icon>();
    for (const value of Object.values(CatastropheType)) {
        const icon = L.icon({
            iconUrl: getIconUrl(value),
            iconSize: [48, 48]
        });
        icons.set(value, icon);
    }
    return icons;
}

const icons = generateIcons();

function isSelectedGradientStep(snapshot: RegionSnapshot, index: number): boolean {
    return snapshot.info != undefined && getGradientColourIndex(snapshot.info.temp_increase) === index;
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

function createIcon(catastrophe: Catastrophe) {
    const title = formatDescription(catastrophe);
    const marker = L.marker(catastrophe.location, {
        title: title,
        icon: icons.get(catastrophe.type)
    });
    marker.bindTooltip(title);
    return marker;
}

export default defineComponent({
    props: ["district-selected"],
    emits: ["update:district-selected"],
    data() {
        return {
            gradientSteps: temperatureGradient,
            isSelectedGradientStep
        };
    },
    setup() {
        const store = useStore();
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

        const updateStatOverlay = () => {
            const now = store.yearlyData.get(store.year);
            for (const geo of statOverlayDistricts.values()) {
                if (now) {
                    if (geo.feature) {
                        const feature = geo.feature as Feature<Geometry, any>;
                        const properties: DistrictProperties = feature.properties;
                        const region = store.getRegion(properties.id);
                        if (region) {
                            const info = now.regions.get(region.id);
                            if (info) {
                                geo.setStyle({
                                    ...meteoOverlayStyle,
                                    fillColor: temperatureGradient[getGradientColourIndex(info.temp_increase)],
                                    fillOpacity: 0.5,
                                });
                            }
                        }
                    }
                } else {
                    geo.setStyle(meteoOverlayStyle);
                }
            }
        };

        const map = ref<L.Map | null>(null);

        watch(() => store.electoralMap, elec => {
            electoralLayer.clearLayers();
            electoralLayer.addData(elec);
            meteoLayer.clearLayers();
            meteoLayer.addData(elec);
            if (map.value) {
                map.value.setMaxBounds(electoralLayer.getBounds());
            }
        });

        const iconLayer = L.layerGroup();
        watch(() => store.selectedData, data => {
            iconLayer.clearLayers();
            for (const catastrophe of data.catastrophes) {
                const marker = createIcon(catastrophe);
                marker.addTo(iconLayer);
            }
        });

        watch(() => store.yearlyData, updateStatOverlay);
        watch(() => store.year, updateStatOverlay);

        const mapElement = ref<HTMLDivElement | null>(null);
        return { store, electoralLayer, statOverlayLayer: meteoLayer, iconLayer, mapElement, map };
    },
    async mounted() {
        if (this.mapElement) {
            const mask = await axios.get<Polygon>('data/masque_electoral.json', { responseType: 'json' });

            const map = new L.Map(this.mapElement, {
                center: [45.5001, -73.5679],
                zoom: 11,
                minZoom: 5,
                zoomControl: true
            });
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
            }).addTo(map);
            L.geoJSON(mask.data, {
                interactive: false,
                style: {
                    fillColor: '#000000', 
                    opacity: 0.5
                }
            }).addTo(map);
            this.statOverlayLayer.addTo(map);
            this.electoralLayer.addTo(map);
            this.iconLayer.addTo(map);
            this.map = map;
            this.map.setMaxBounds(this.electoralLayer.getBounds());
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

#gradient {
    position: absolute;
    right: 16px;
    top: 16px;
    z-index: 400;
    width: 42px;
    display: flex;
    flex-direction: column-reverse;
    padding: 5px;
    background-color: rgba(255, 255, 255, 0.5);
}
#gradient div.step {
    height: 8px;
}
@media (min-width: 768px) {  /* for devices >= 'md' */
    #gradient div.step {
        height: 16px;
    }
}

#gradient div.step {
    position: relative;
    opacity: 0.8;
}

#gradient>div.step+div.step {
    border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}

#gradient div.label {
    font-weight: bold;
    margin-bottom: 4px;
    text-align: center;
}

#gradient div.step .tooltip {
    visibility: hidden;
    position: absolute;
    z-index: 1;
    width: 64px;
    top: -5px;
    right: 105%;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    border-radius: 5px;
}

#gradient div.step:hover .tooltip {
    visibility: visible;
}

#gradient div.step .selected {
    position: absolute;
    z-index: 1;
    right: 110%;
    top: 2px;
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;

    border-left: 6px solid black;
}
</style>
<style>
.leaflet-control-container {
    width: 100%;
    height: 100%;
}
</style>
