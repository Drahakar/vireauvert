<script lang="ts">
import * as Sentry from "@sentry/vue";
import { List } from 'immutable';
import { BrowserTracing } from "@sentry/tracing";
import { defineComponent, reactive, ref, PropType } from "vue";
import { useCandidateStore } from "./stores/candidates";
import { useCatastropheStore } from "./stores/catastrophes";
import { useStatisticStore } from "./stores/statistics";
import { FILTER_ALL_CATASTROPHES, Catastrophe } from "./models/catastrophes";
import { REFERENCE_YEAR } from "./models/constants";
import { DEFAULT_USER_STATE } from "./models/user";
import CallToAction from './components/CallToAction.vue';
import CatastropheToggle from "./components/CatastropheToggle.vue";
import Header from "./components/Header.vue";
import LoadingSpinner from "./components/LoadingSpinner.vue";
import MapView from "./components/MapView.vue";
import RegionSearch from "./components/RegionSearch.vue";
import Thermometer from './components/Thermometer.vue';
import Timeline from "./components/Timeline.vue";
import { useMapStore } from "./stores/map";
import About from "./components/About.vue";

export default defineComponent({
    components: {
    CallToAction,
    CatastropheToggle,
    Header,
    LoadingSpinner,
    MapView,
    RegionSearch,
    Thermometer,
    Timeline,
    About
},
    data() {
        return {
            showAbout: false
        };
    },
    methods: {
        selectDistrict(id: number) {
            this.state.district = id;
        },
        selectYear(year: number) {
            this.state.year = year;
        },
        mapMoved(location: [number, number]) {
            this.state.location = location;
        },
        mapZoomed(zoom: number) {
            this.state.zoom = zoom;
        },
    },
    setup() {
        const candidateStore = useCandidateStore();
        const catastropheStore = useCatastropheStore();
        const statisticStore = useStatisticStore();
        const mapStore = useMapStore();

        const loadingCompleted = ref<boolean>(false);

        const storeLoads = Promise.allSettled([
            candidateStore.loadCandidates(),
            catastropheStore.loadCatastrophes(),
            statisticStore.loadStatistics(),
            mapStore.loadMap()
        ]);
        storeLoads.then(promises => {
            loadingCompleted.value = true;
            for (const promise of promises) {
                if (promise.status === 'rejected') {
                    Sentry.captureException(promise.reason);
                }
            }
        });

        return {
            state: reactive(DEFAULT_USER_STATE),
            statisticStore,
            catastropheStore,
            loadingCompleted,
        };
    },
    computed: {
        selectedStatistics() {
            return this.statisticStore.findStatistics(this.state.year,
                this.state.district);
        },
        referenceYearStatistics() {
            return this.statisticStore.findStatistics(REFERENCE_YEAR,
                this.state.district);
        },
        catastrophes(): List<Catastrophe> {
            return this.catastropheStore.findCatastrophes(
                this.state.year, this.state.district, this.state.catastropheFilter)
        },
        allCatastrophes(): List<Catastrophe> {
            return this.catastropheStore.findCatastrophes(
                this.state.year, this.state.district, FILTER_ALL_CATASTROPHES)
        },
    },
});

Sentry.init({
    dsn: "https://28318a44bb0b42b38e6b0df57cbe1986@o1340974.ingest.sentry.io/6613977",
    integrations: [new BrowserTracing()],
    tracesSampleRate: 1.0,
    environment: import.meta.env.MODE
});
</script>

<template>
    <div class="main">
        <MapView class="map" :district="state.district"
            :year="state.year" :catastrophes="catastrophes"
            @district-selected="selectDistrict"
            :location="state.location" @location-changed="mapMoved"
            :zoom="state.zoom" @zoom-changed="mapZoomed"
            :zoom-limit-offset="-1"></MapView>
        <div class="map-overlay">
            <div class="container">
                <div class="content-container">
                    <section class="primary-content content-section">
                        <div class="filter-inputs">
                            <RegionSearch class="region-search"
                                :district="state.district"
                                @district-selected="selectDistrict"></RegionSearch>
                            <CatastropheToggle class="catastrophe-toggle"
                                v-model:filter="state.catastropheFilter"
                                :allCatastrophes="allCatastrophes"
                                :currentCatastrophesCount="catastrophes.size"></CatastropheToggle>
                        </div>
                        <Timeline class="timeline" :year="state.year"
                            @year-selected="selectYear"
                            :district="state.district"></Timeline>
                    </section>
                    <section class="secondary-content content-section">
                        <Thermometer :statistics="selectedStatistics"
                            :reference-statistics="referenceYearStatistics"></Thermometer>
                        <CallToAction class="call-to-action"></CallToAction>
                    </section>
                </div>
                <Header class="header" @about-requested="showAbout = true"></Header>
            </div>
        </div>
        <About :show-modal="showAbout" @modal-closed="showAbout = false"></About>
    </div>

    <div v-if="!loadingCompleted" class="loading-overlay">
        <LoadingSpinner role="status"></LoadingSpinner>
        <p class="loading-message" v-t="'loading'"></p>
    </div>
</template>

<style scoped>
.main {
    width: 100%;
    height: 100%;
}

.container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.content-container {
    display: flex;
    min-height: 0;  /* undo min-height: auto from being a flex child */
    height: 100%;
    flex-direction: row;
    gap: var(--sz-100);
    justify-content: space-between;
}

.content-section {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: var(--sz-100);
}

.primary-content {
    width: 100%;
    height: 100%;
    min-width: 0;  /* undo min-width: auto from being a flex child */
}

.secondary-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: var(--sz-800);
    align-items: center;
}

.header {
    padding-right: 110px;  /* space for OpenStreetMap attribution */
}

.map-overlay {
    position:absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    /* Note: must be this high to be over the overleaf z-index. */
    z-index: 1000;
    padding: var(--size-map-padding);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    pointer-events: none;
    gap: var(--sz-50);
}

.filter-inputs {
    flex: 1;
    width: 100%;
    min-height: 0;  /* don't expand to children content -- undo auto min-height */
    max-height: 100%;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    justify-content: start;
    gap: var(--size-map-controls-gap);
}

.call-to-action {
    pointer-events: auto;
}

.catastrophe-toggle {
    min-height: 0;  /* undo min-height: auto from being a flex child */
    height: 100%;
    width: 100%;
}

.region-search {
    pointer-events: auto;
    --vs-font-size: var(--default-font-size);
    --sz-margin-left: calc(var(--sz-100) + var(--size-map-zoom-control));
    --vs-selected-color: var(--color-text);
    --vs-border-radius: var(--border-radius);
    --vs-border-color: var(--color-border);
    --vs-dropdown-max-height: 750%;
}

.timeline {
    pointer-events: auto;
    color: var(--color-heading);
    font-weight: var(--fw-regular);
    font-size: var(--sz-400);
    background-color: var(--color-background-accent);
    border-radius: var(--border-radius);
    padding: var(--sz-200);
    max-width: 1280px;
}

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 1000;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.loading-message {
    font-size: var(--sz-600);
}
</style>

<style>  /* global */
.region-search > div {
    background-color: var(--color-background);
}
</style>
