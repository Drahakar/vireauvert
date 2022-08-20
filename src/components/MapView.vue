<template>
    <div id="wrapper">
        <keep-alive>
            <div class="map" ref="mapElement"></div>
        </keep-alive>
        <Thermometre id="thermo" :statistics="selectedStatistics" :district="district"></Thermometre>
    </div>
</template>

<script lang="ts">
import "leaflet/dist/leaflet.css"
import L from "leaflet";
import { defineComponent, PropType, ref, watch } from "vue";
import { Catastrophe } from "@/models/catastrophes";
import axios from "axios";
import { Polygon } from "geojson";
import { List } from "immutable";
import { DistrictProperties } from "@/models/map";
import { useStatisticStore } from "@/stores/statistics";
import Thermometre from "./Thermometre.vue";
import { createMapMarker, DistrictLayer, setMapLayerColour } from "@/utils/map_helpers";
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
        const updateColour = (district: DistrictLayer) => {
            const statistics = statisticStore.findStatistics(props.year, district.feature.properties.id);
            setMapLayerColour(district.layer, district.feature.properties.id === props.district, statistics.temp_delta);
        };
        const districtLayers = new Map<string, DistrictLayer>();
        const mapLayer = L.geoJSON(undefined, {
            onEachFeature: (feature, layer) => {
                const properties: DistrictProperties = feature.properties;
                const district: DistrictLayer = { feature, layer: layer as L.GeoJSON };
                districtLayers.set(properties.id.toString(), { feature, layer: layer as L.GeoJSON });
                layer.addEventListener("click", () => {
                    const newId = props.district !== properties.id ? properties.id : 0;
                    emit("districtSelected", newId);
                });
                layer.bindTooltip(properties.name);
                updateColour(district);
            }
        });
        watch(() => props.district, (newId, oldId) => {
            const oldLayer = districtLayers.get(oldId.toString());
            if (oldLayer) {
                updateColour(oldLayer);
            }
            const newLayer = districtLayers.get(newId.toString());
            if (newLayer) {
                updateColour(newLayer);
                if (map.value) {
                    map.value.fitBounds(newLayer.layer.getBounds(), {
                        animate: true
                    });
                }
            }
        });
        watch(() => props.year, () => {
            for (const district of districtLayers.values()) {
                updateColour(district);
            }
        });
        watch(() => statisticStore.statistics, stats => {
            if (stats.has(props.year)) {
                for (const district of districtLayers.values()) {
                    updateColour(district);
                }
            }
        });
        const iconLayer = L.layerGroup();
        watch(() => props.catastrophes, catastrophes => {
            iconLayer.clearLayers();
            for (const catastrophe of catastrophes) {
                const marker = createMapMarker(catastrophe);
                marker.addTo(iconLayer);
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

</script>

<style scoped>
.map {
    height: 100%;
}

#wrapper {
    position: relative;
}

#thermo {
    position: absolute;
    z-index: 400;
    right: 16px;
    top: 16px;
    max-height: calc(100% - 48px);
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(127, 127, 127, 0.7) rgba(255, 255, 255, 0.7);

}

#thermo::-webkit-scrollbar {
    width: 4px;
}

#thermo::-webkit-scrollbar-track {
    background-color: rgba(255, 255, 255, 0.7);
}

#thermo::-webkit-scrollbar-thumb {
    background-color: rgba(127, 127, 127, 0.7);
    border-radius: 4px;
}
</style>
<style>
.leaflet-control-container {
    width: 100%;
    height: 100%;
}
</style>
