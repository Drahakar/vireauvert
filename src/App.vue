<script lang="ts">
import * as Sentry from "@sentry/vue";
import { List } from 'immutable';
import { BrowserTracing } from "@sentry/tracing";
import { defineComponent, reactive, ref, PropType } from "vue";
import { useCandidateStore } from "./stores/candidates";
import { useCatastropheStore } from "./stores/catastrophes";
import { useStatisticStore } from "./stores/statistics";
import { Catastrophe } from "./models/catastrophes";
import { DEFAULT_USER_STATE, UserState } from "./models/user";
import CallToAction from './components/CallToAction.vue';
import CatastropheToggle from "./components/CatastropheToggle.vue";
import Header from "./components/Header.vue";
import MapView from "./components/MapView.vue";
import RegionSearch from "./components/RegionSearch.vue";
import Thermometer from './components/Thermometer.vue';
import Timeline from "./components/Timeline.vue";
import { useMapStore } from "./stores/map";

export default defineComponent({
    components: {
        CallToAction,
        CatastropheToggle,
        Header,
        MapView,
        RegionSearch,
        Thermometer,
        Timeline,
    },
    computed: {
        catastrophes(): List<Catastrophe> {
            return this.catastropheStore.findCatastrophes(
                this.state.year, this.state.district, this.state.catastrophe)
        },
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

        // TODO: still needed?
        const query = window.matchMedia('(min-width: 768px)');
        const isDesktop = ref<boolean>(query.matches);
        query.addEventListener('change', query => {
            isDesktop.value = query.matches;
        });

        return {
            state: reactive(DEFAULT_USER_STATE),
            statisticStore,
            catastropheStore,
            loadingCompleted,
            isDesktop
        };
    },
    computed: {
        selectedStatistics() {
            return this.statisticStore.findStatistics(this.year, this.district);
        }
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
        <!-- TODO: use real components -->
        <Header></Header>

        <section class="content-container">
            <div class="primary-content content-section">
                <div class="map-container">
                    <!-- TODO: start fully zoomed out? -->
                    <MapView class="map" :district="state.district"
                        :year="state.year" :catastrophes="catastrophes"
                        @district-selected="selectDistrict"
                        :location="state.location" @location-changed="mapMoved"
                        :zoom="state.zoom" @zoom-changed="mapZoomed"
                        :zoom-limit-offset="-1"></MapView>
                    <div class="map-overlay">
                        <CatastropheToggle
                            class="catastrophe-toggle"></CatastropheToggle>
                        <!-- TODO: change icon style -->
                        <!-- TODO: change to pop above? -->
                        <RegionSearch class="region-search"
                            :district="state.district"
                            @district-selected="selectDistrict"></RegionSearch>
                    </div>
                </div>
                <Timeline class="timeline" :year="state.year"
                    @year-selected="selectYear"
                    :district="state.district"></Timeline>
            </div>
            <div class="secondary-content content-section">
                <Thermometer :statistics="selectedStatistics"
                    :district="state.district"></Thermometer>
                <CallToAction></CallToAction>
            </div>
        </section>

        <!-- TODO: desktop layout, ideally no split components -->

        <div v-if="!loadingCompleted" class="loading-overlay">
            <!-- TODO: add spinner, e.g. with https://loading.io/css/ -->
            <div class="spinner-border" role="status" style="width: 5rem; height: 5rem;"></div>
            <p class="loading-message" v-t="'loading'"></p>
        </div>
    </div>
</template>

<style scoped>
.main {
    min-height: 100vh;
    padding: var(--sz-100);
    display: flex;
    flex-direction: column;
    gap: var(--sz-100);
}

.content-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex-grow: 1;
    gap: var(--sz-100);
}

.content-section {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: var(--sz-100);
}

.primary-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.secondary-content {
    align-items: center;
}

.map-container {
    min-height: 200px;
    min-width: 100px;
    flex-grow: 1;
    position: relative;
}

.map {
    width: 100%;
    height: 100%;
    border-radius: var(--sz-600);
    overflow: hidden;
}

.map-overlay {
    position:absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    /* Note: must be this high to be over the overleaf z-index. */
    z-index: 1000;
    padding: var(--sz-200) var(--sz-200);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    pointer-events: none;
}

.catastrophe-toggle {
}

.region-search {
    pointer-events: auto;
    --vs-selected-color: var(--color-text);
    --vs-border-radius: var(--sz-400);
    --vs-border-color: var(--color-border);
    --vs-dropdown-max-height: 400%;
    /* space for the map attribution */
    margin-bottom: var(--sz-400);
}

.timeline {
    color: var(--color-heading);
    font-weight: var(--fw-regular);
    font-size: var(--sz-400);
    background-color: var(--color-background-accent);
    border-radius: var(--sz-600);
    padding: var(--sz-200);
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
