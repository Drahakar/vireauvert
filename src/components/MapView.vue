<template>
    <div id="wrapper" ref="mapWrapper">
        <div class="map" ref="mapElement"></div>
    </div>
</template>

<script lang="ts">
import "leaflet/dist/leaflet.css"
import L from "leaflet";
import { AppContext, defineComponent, PropType, ref, watch } from "vue";
import { Catastrophe, groupCatastrophes, MapObject } from "@/models/catastrophes";
import { List } from "immutable";
import { DistrictProperties } from "@/models/map";
import { getStatisticsForRegion, useStatisticStore } from "@/stores/statistics";
import Thermometer from "./Thermometer.vue";
import { createHighlightMarker, createMapMarker, DistrictLayer, setGlobalIconSize, setMapLayerColour } from "@/utils/map_helpers";
import { useMapStore } from "@/stores/map";
import { YearlyStatistics } from "@/models/yearly_data";
import { getAppContext } from "@/main";
import { DEFAULT_ZOOM, MAX_ZOOM, MIN_ZOOM } from "@/models/user";
import { Highlight } from "@/models/highlights";

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
        highlights: {
            type: Object as PropType<List<Highlight>>,
            default: List()
        },
        location: {
            type: Object as PropType<L.LatLngTuple>,
            default: [0, 0]
        },
        zoom: {
            type: Number,
            default: DEFAULT_ZOOM
        }
    },
    setup(props, { emit }) {
        const statisticStore = useStatisticStore();
        const mapStore = useMapStore();

        const updateAllColours = (allStats: YearlyStatistics | undefined) => {
            if (allStats) {
                for (const district of districtLayers.values()) {
                    const id = district.feature.properties.id;
                    const stats = getStatisticsForRegion(allStats, id);
                    setMapLayerColour(district.layer, id === props.district, stats.temp_delta);
                }
            }
        };

        const catastropheIcons = new MapIcons();
        const highlightIcons = new MapIcons();

        const map = ref<L.Map | null>(null);
        const districtLayers = new Map<string, DistrictLayer>();
        const mapLayer = L.geoJSON(mapStore.districts, {
            onEachFeature: (feature, layer) => {
                const properties: DistrictProperties = feature.properties;
                const district: DistrictLayer = { feature, layer: layer as L.GeoJSON };
                districtLayers.set(properties.id.toString(), { feature, layer: layer as L.GeoJSON });
                layer.addEventListener("click", () => {
                    const popupMarker = catastropheIcons.getOpenedPopup() ?? highlightIcons.getOpenedPopup();
                    if (popupMarker) {
                        popupMarker.closePopup();
                        return;
                    }
                    const newId = props.district !== properties.id ? properties.id : 0;
                    emit("districtSelected", newId);
                });
                layer.bindTooltip(properties.name);
                setMapLayerColour(district.layer, district.feature.properties.id === props.district, undefined)
            }
        });
        watch(() => mapStore.districts, data => {
            mapLayer.clearLayers();
            if (data) {
                mapLayer.addData(data);
                if (map.value) {
                    updateMapBounds(map.value as L.Map, mapLayer);
                }
                const allStats = statisticStore.findStatisticsByYear(props.year);
                updateAllColours(allStats);
            }
        });

        const maskLayer = L.geoJSON(mapStore.mask, {
            interactive: false,
            style: {
                fillColor: "#000000",
                color: 'var(--clr-gris-fonce)',
                opacity: 0.6,
                fillOpacity: 0.4,
                weight: 2
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
                const stats = statisticStore.findStatistics(props.year, oldLayer.feature.properties.id);
                setMapLayerColour(oldLayer.layer, false, stats.temp_delta);
            }
            const newLayer = districtLayers.get(newId.toString());
            if (newLayer) {
                const stats = statisticStore.findStatistics(props.year, newLayer.feature.properties.id);
                setMapLayerColour(newLayer.layer, true, stats.temp_delta);
                if (map.value) {
                    map.value.fitBounds(newLayer.layer.getBounds(), {
                        animate: true
                    });
                }
            }
        });

        watch(() => props.year, year => {
            const allStats = statisticStore.findStatisticsByYear(year);
            updateAllColours(allStats);
        });

        watch(() => statisticStore.statistics, storedStats => {
            const allStats = storedStats.get(props.year);
            updateAllColours(allStats);
        });

        watch(() => props.catastrophes, catastrophes => {
            catastropheIcons.refreshCatastrophes(map.value as L.Map | null, catastrophes);
        });

        watch(() => props.highlights, highlights => {
            highlightIcons.refreshHighlights(map.value as L.Map | null, highlights);
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
            catastropheIcons,
            highlightIcons,
            statisticStore,
            mapWrapper: ref<HTMLDivElement | null>(null),
            mapResizeObserver: mapResizeObserver,
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
                minZoom: MIN_ZOOM,
                maxZoom: MAX_ZOOM,
                zoomControl: true,
                bounceAtZoomLimits: false,
                maxBoundsViscosity: 1
            });
            
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(map);
            this.maskLayer.addTo(map);
            this.mapLayer.addTo(map);

            this.catastropheIcons.refreshCatastrophes(map, this.catastrophes);
            this.highlightIcons.refreshHighlights(map, this.highlights);
            this.catastropheIcons.layer.addTo(map);
            this.highlightIcons.layer.addTo(map);

            map.addEventListener('click', ev => {
                const marker = this.catastropheIcons.getOpenedPopup() ?? this.highlightIcons.getOpenedPopup();;
                if(marker) {
                    marker.closePopup();
                    ev.originalEvent.stopPropagation();
                }                
            });
            map.addEventListener('moveend', () => {
                this.$emit('locationChanged', map.getCenter());
            });
            map.addEventListener('zoomend', () => {
                const zoom = map.getZoom();
                setGlobalIconSize(zoom / (map.getMaxZoom() - map.getMinZoom()));
                this.$emit('zoomChanged', zoom);
            });

            this.map = map;
            updateMapBounds(map, this.mapLayer);
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
    components: { Thermometer }
});


class MapIcons {
    public layer: L.LayerGroup;
    public index: Map<string, L.Marker>;

    constructor() {
        this.layer = L.layerGroup();
        this.index = new Map<string, L.Marker>();
    }

    getOpenedPopup() {
        for (const marker of this.index.values()) {
            if (marker.isPopupOpen()) {
                return marker;
            }
        }
        return null;
    }

    refreshCatastrophes(map: L.Map | null, catastrophes: List<Catastrophe>) {
        this.refreshIcons(map, groupCatastrophes(catastrophes), createMapMarker);
    }

    refreshHighlights(map: L.Map | null, highlights: List<Highlight>) {
        this.refreshIcons(map, highlights, createHighlightMarker);
    }

    refreshIcons<T extends MapObject>(map: L.Map | null, items: List<T>, markerFactory: (item: T, context: AppContext) => L.Marker) {
        const missing = new Set<string>(this.index.keys());
        for (const item of items) {
            if (!this.index.has(item.id)) {
                const marker = markerFactory(item, getAppContext());
                if (map) {
                    marker.addEventListener('click', () => {
                        map.panTo(item.location, {
                            animate: true
                        });
                    });
                }
                this.index.set(item.id, marker);
                marker.addTo(this.layer);
            }
            missing.delete(item.id);
        }
        for (const id of missing) {
            const marker = this.index.get(id);
            if (marker) {
                this.index.delete(id);
                this.layer.removeLayer(marker);
            }
        }
    }
}


function updateMapBounds(map: L.Map, mapLayer: L.GeoJSON) {
    const bounds = mapLayer.getBounds();
    if (bounds.isValid()) {
        map.setMaxBounds(bounds.pad(0.5));
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

.catastrophe-popup .leaflet-popup-content {
    margin: 0;
    min-width: var(--popup-width);
}

.catastrophe-popup .leaflet-popup-content .list-group-flush {
    border-radius: var(--border-radius);
}

.leaflet-popup-close-button:hover {
    opacity: 0.8;
}

.leaflet-left .leaflet-control {
    margin-left: var(--size-map-padding);
    /* IFCHANGE: change App */
    /* 2x controls + 2x gaps between other controls and this one, + extra
       pixels due to 4x 1px borders on the way. */
    margin-top: calc(var(--size-map-padding) + var(--size-map-zoom-control) * 2 + var(--size-map-controls-gap) * 2 + 4px);
}

.leaflet-bar a {
    color: var(--color-text);
    background-color: var(--color-background);
}

.leaflet-touch .leaflet-bar a:first-child,
.leaflet-touch .leaflet-bar {
    /* IFCHANGE: change CatastropheToggle */
    border-top-left-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
}

.leaflet-touch .leaflet-bar a:last-child,
.leaflet-touch .leaflet-bar {
    border-bottom-left-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
}

.leaflet-touch .leaflet-bar {
    border-color: var(--color-border);
    border-width: 1px;
}

.leaflet-touch .leaflet-bar a {
    font-size: var(--sz-800);
    line-height: var(--sz-800);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--ff-primary);
    font-weight: var(--fw-regular);
    width: var(--size-map-zoom-control);
    height: var(--size-map-zoom-control);
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.2);
}
</style>
