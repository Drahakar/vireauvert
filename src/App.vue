<script lang="ts">
import * as Sentry from "@sentry/vue";
import { List } from 'immutable';
import { BrowserTracing } from "@sentry/tracing";
import { defineComponent, reactive, ref } from "vue";
import { useCandidateStore } from "./stores/candidates";
import { useCatastropheStore } from "./stores/catastrophes";
import { useStatisticStore } from "./stores/statistics";
import { Catastrophe } from "./models/catastrophes";
import { DEFAULT_USER_STATE, UserState } from "./models/user";
import Timeline from "./components/Timeline.vue";
import { useMapStore } from "./stores/map";

export default defineComponent({
    components: {
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

        const query = window.matchMedia('(min-width: 768px)');
        const isDesktop = ref<boolean>(query.matches);
        query.addEventListener('change', query => {
            isDesktop.value = query.matches;
        });

        return {
            state: reactive(DEFAULT_USER_STATE),
            catastropheStore,
            loadingCompleted,
            isDesktop
        };
    }
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
        <header>
            <!-- TODO: proper logo -->
            <p>terre os</p>
            <!-- TODO: proper logo -->
            <p>Éqt*x(*)</p>
        </header>

        <section class="content-container">
            <div class="primary-content content-section">
                <div class="map">
                    Map (+ inputs)
                </div>
                <Timeline class="timeline" :year="state.year"
                    @year-selected="selectYear"
                    :district="state.district"></Timeline>
            </div>
            <div class="secondary-content content-section">
                <div class="thermometer">
                </div>
                <button class="call-to-action">Contactez vos candidats</button>
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

header {
    display: flex;
    justify-content: space-between;
    font-size: 24px;  /* TODO: remove, use logos instead */
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

.map {
    background-color: green;  /* TODO: remove */
    color: white;  /* TODO: remove */
    min-height: 200px;
    min-width: 100px;
    flex-grow: 1;
    border-radius: var(--sz-600);
    padding: var(--sz-400) var(--sz-200);
}

.timeline {
    color: var(--color-heading);
    font-weight: 500;
    font-size: var(--sz-400);
    background-color: var(--color-background-accent);
    border-radius: var(--sz-600);
    padding: var(--sz-200);
}

.thermometer {
    width: 12px;  /* TODO: remove */
    min-height: 300px;  /* TODO: remove */
    border-radius: 16px;  /* TODO: remove */
    border-style: solid;
    border-width: 2px;
    border-color: var(--clr-chaud);
}

.call-to-action {
    font-size: var(--sz-400);
    color: var(--clr-blanc);
    background-color: var(--clr-orange);
    border-radius: var(--sz-600);
    width: min-content;
    border: none;
    cursor: pointer;
    padding: var(--sz-300);
    /* TODO: style on hover? */
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
