<template>
    <div id="wrapper">
        <div id="map" ref="mapElement"></div>
        <Thermometre :statistics="selectedStatistics"></Thermometre>
    </div>
</template>

<script lang="ts">
import "leaflet/dist/leaflet.css"
import L from "leaflet";
import { defineComponent, PropType, ref, watch } from "vue";
import { Catastrophe, CatastropheType, formatDescription, getIconUrl } from "@/models/catastrophes";
import axios from "axios";
import { Feature, Geometry, Polygon } from "geojson";
import { List } from "immutable";
import { DistrictProperties } from "@/models/map";
import { useStatisticStore } from "@/stores/statistics";
import { getGradientColourIndex, colourToHex, multiplyColours, parseColour, temperatureGradient } from "@/models/climate";
import Thermometre from "./Thermometre.vue";
export default defineComponent({
    emits: ["districtSelected"],
    props: {
        district: {
            type: Number,
            default: 0,
        },
        year: {
            type: Number,
            default: 0
        },
        catastrophes: {
            type: Object as PropType<List<Catastrophe>>,
            default: List()
        }
    },
    setup(props, { emit }) {
        const statisticStore = useStatisticStore();
        const mapElement = ref<HTMLDivElement | null>(null);
        const map = ref<L.Map | null>(null);
        const updateColour = (feature: Feature<Geometry, DistrictProperties>, layer: L.GeoJSON) => {
            const statistics = statisticStore.findStatistics(props.year, feature.properties.id);
            setColour(layer, feature.properties.id === props.district, statistics.temp_delta);
        };
        const districtLayers = new Map<string, {
            feature: Feature<Geometry, DistrictProperties>;
            layer: L.GeoJSON;
        }>();
        const mapLayer = L.geoJSON(undefined, {
            onEachFeature: (feature, layer) => {
                const properties: DistrictProperties = feature.properties;
                districtLayers.set(properties.id.toString(), { feature, layer: layer as L.GeoJSON });
                layer.addEventListener("click", () => {
                    const newId = props.district !== properties.id ? properties.id : 0;
                    emit("districtSelected", newId);
                });
                layer.bindTooltip(properties.name);
                updateColour(feature, layer as L.GeoJSON);
            },
            style: unselectedStyle
        });
        watch(() => props.district, (newId, oldId) => {
            const oldLayer = districtLayers.get(oldId.toString());
            if (oldLayer) {
                updateColour(oldLayer.feature, oldLayer.layer);
            }
            const newLayer = districtLayers.get(newId.toString());
            if (newLayer) {
                updateColour(newLayer.feature, newLayer.layer);
                if (map.value) {
                    map.value.fitBounds(newLayer.layer.getBounds(), {
                        animate: true
                    });
                }
            }
        });
        watch(() => props.year, () => {
            for (const { feature, layer } of districtLayers.values()) {
                updateColour(feature, layer);
            }
        });
        watch(() => statisticStore.statistics, () => {
            if (statisticStore.statistics.has(props.year)) {
                for (const { feature, layer } of districtLayers.values()) {
                    updateColour(feature, layer);
                }
            }
        });
        const iconLayer = L.layerGroup();
        watch(() => props.catastrophes, catastrophes => {
            iconLayer.clearLayers();
            for (const catastrophe of catastrophes) {
                const icon = createIcon(catastrophe);
                icon.addTo(iconLayer);
            }
        });
        return { mapElement, map, mapLayer, iconLayer, statisticStore };
    },
    computed: {
        selectedStatistics() {
            return this.statisticStore.findStatistics(this.year, this.district);
        }
    },
    async mounted() {
        if (this.mapElement) {
            const mapDataResponse = await axios.get<Polygon>("data/carte_electorale.json", { responseType: "json" });
            const maskDataResponse = await axios.get<Polygon>("data/masque_electoral.json", { responseType: "json" });
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
            L.geoJSON(maskDataResponse.data, {
                interactive: false,
                style: {
                    fillColor: "#000000",
                    opacity: 0.5
                }
            }).addTo(map);
            this.mapLayer.addData(mapDataResponse.data);
            this.mapLayer.addTo(map);
            this.iconLayer.addTo(map);
            this.map = map;
            this.map.setMaxBounds(this.mapLayer.getBounds());
            this.map.attributionControl.setPrefix("");
        }
    },
    methods: {
        focusCatastrophe(catastrophe: Catastrophe) {
            if (this.map) {
                this.map.panTo(catastrophe.location, {
                    animate: true
                });
            }
        }
    },
    components: { Thermometre }
});

const unselectedStyle: L.PathOptions = {
    fillColor: '#cccccc',
    color: '#333333',
    opacity: 0.5,
    weight: 1
};
const selectedStyle: L.PathOptions = {
    ...unselectedStyle,
    fillColor: '#ffffff',
    opacity: 0.7,
    fillOpacity: 0.3,
    weight: 2
};

function setColour(layer: L.GeoJSON, selected: boolean, tempDelta?: number) {
    let style = selected ? selectedStyle : unselectedStyle;
    if (tempDelta) {
        const tempColour = temperatureGradient[getGradientColourIndex(tempDelta)];
        const newColour = colourToHex(multiplyColours(parseColour(style.fillColor), tempColour));
        style = {
            ...style,
            fillColor: newColour
        };
    }
    layer.setStyle(style);
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
