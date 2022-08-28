<template>
    <div id="wrapper" ref="mapWrapper">
        <keep-alive>
            <div class="map" ref="mapElement"></div>
        </keep-alive>
        <Thermometre :statistics="selectedStatistics" :district="district"></Thermometre>
    </div>
</template>

<script lang="ts">
import "leaflet/dist/leaflet.css"
import L from "leaflet";
import { defineComponent, PropType, ref, watch } from "vue";
import { Catastrophe, groupCatastrophes } from "@/models/catastrophes";
import { List } from "immutable";
import { DistrictProperties } from "@/models/map";
import { useStatisticStore } from "@/stores/statistics";
import Thermometre from "./Thermometre.vue";
import { createMapMarker, DistrictLayer, setMapLayerColour } from "@/utils/map_helpers";
import { Composer, useI18n } from "vue-i18n";
import { useMapStore } from "@/stores/map";

const MIN_ZOOM = 5;
const MAX_ZOOM = 15;

export default defineComponent({
    emits: ["districtSelected", 'locationChanged', 'zoomChanged'],
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
        },
        location: {
            type: Object as PropType<L.LatLngTuple>,
            default: [0, 0]
        },
        zoom: {
            type: Number,
            default: MIN_ZOOM
        },
        zoomLimitOffset: {
            type: Number,
            default: 0
        }
    },
    setup(props, { emit }) {
        const statisticStore = useStatisticStore();
        const mapStore = useMapStore();

        const map = ref<L.Map | null>(null);
        const updateColour = (district: DistrictLayer) => {
            const statistics = statisticStore.findStatistics(props.year, district.feature.properties.id);
            setMapLayerColour(district.layer, district.feature.properties.id === props.district, statistics.temp_delta);
        };

        const districtLayers = new Map<string, DistrictLayer>();
        const mapLayer = L.geoJSON(mapStore.districts, {
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
        watch(() => mapStore.districts, data => {
            mapLayer.clearLayers();
            if (data) {
                mapLayer.addData(data);
                const bounds = mapLayer.getBounds();
                if (map.value && bounds.isValid()) {
                    map.value.setMaxBounds(bounds.pad(0.05));
                }
            }
        });

        const maskLayer = L.geoJSON(mapStore.mask, {
            interactive: false,
            style: {
                fillColor: "#000000",
                opacity: 0.5
            }
        });
        watch(() => mapStore.mask, data => {
            maskLayer.clearLayers();
            if (data) {
                maskLayer.addData(data);
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
        const icons: MapIcons = {
            layer: L.layerGroup(),
            index: new Map<string, L.Marker>()
        };
        const i18n = useI18n();
        watch(() => props.catastrophes, catastrophes => {
            refreshIcons(icons, catastrophes, i18n);
        });

        const mapResizeObserver = new ResizeObserver(entries => {
            const rect = entries[0].contentRect;
            if (map.value && rect.width > 0 && rect.height > 0) {
                map.value.invalidateSize({
                    pan: true,
                });
            }
        });
        return {
            mapElement: ref<HTMLDivElement | null>(null),
            map,
            mapLayer,
            maskLayer,
            icons,
            statisticStore,
            mapWrapper: ref<HTMLDivElement | null>(null),
            mapResizeObserver: mapResizeObserver,
            i18n,
            districtLayers
        };
    },
    computed: {
        selectedStatistics() {
            return this.statisticStore.findStatistics(this.year, this.district);
        }
    },
    async mounted() {
        if (this.mapElement) {
            const map = new L.Map(this.mapElement, {
                center: this.location,
                zoom: this.zoom,
                minZoom: MIN_ZOOM + this.zoomLimitOffset,
                maxZoom: MAX_ZOOM + this.zoomLimitOffset,
                zoomControl: true
            });
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(map);
            this.maskLayer.addTo(map);
            this.mapLayer.addTo(map);

            refreshIcons(this.icons, this.catastrophes, this.i18n);
            this.icons.layer.addTo(map);

            map.addEventListener('moveend', () => {
                this.$emit('locationChanged', map.getCenter());
            });
            map.addEventListener('zoomend', () => {
                this.$emit('zoomChanged', map.getZoom());
            });

            L.control.scale({
                imperial: false
            }).addTo(map);

            this.map = map;
            const bounds = this.mapLayer.getBounds();
            if (bounds.isValid()) {
                this.map.setMaxBounds(bounds.pad(0.05));
            }
            this.map.attributionControl.setPrefix('');

            if (this.mapWrapper) {
                this.mapResizeObserver.observe(this.mapWrapper);
            }

            if (this.district) {
                const layer = this.districtLayers.get(this.district.toString());
                if (layer) {
                    map.fitBounds(layer.layer.getBounds(), {
                        animate: false
                    });
                }
            }
        }
    },
    unmounted() {
        if (this.mapWrapper) {
            this.mapResizeObserver.unobserve(this.mapWrapper);
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

interface MapIcons {
    layer: L.LayerGroup;
    index: Map<string, L.Marker>;
}

function refreshIcons(icons: MapIcons, catastrophes: List<Catastrophe>, i18n: Composer) {
    const missing = new Set<string>(icons.index.keys());
    for (const group of groupCatastrophes(catastrophes)) {
        if (!icons.index.has(group.id)) {
            const marker = createMapMarker(group, i18n);
            icons.index.set(group.id, marker);
            marker.addTo(icons.layer);
        }
        missing.delete(group.id);
    }
    for (const id of missing) {
        const marker = icons.index.get(id);
        if (marker) {
            icons.index.delete(id);
            icons.layer.removeLayer(marker);
        }
    }
}

</script>

<style scoped>
.map {
    height: 100%;
}

#wrapper {
    position: relative;
}
</style>
<style>
.leaflet-control-container {
    width: 100%;
    height: 100%;
}
</style>
