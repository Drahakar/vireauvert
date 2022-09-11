<script lang="ts">
import * as Sentry from "@sentry/vue";
import { BrowserTracing } from "@sentry/tracing";
import { defineComponent, reactive, ref } from "vue";
import { useCandidateStore } from "./stores/candidates";
import { useCatastropheStore } from "./stores/catastrophes";
import { useStatisticStore } from "./stores/statistics";
import { DEFAULT_USER_STATE } from "./models/user";
import CallToAction from './components/CallToAction.vue';
import Thermometer from './components/Thermometer.vue';
import { useMapStore } from "./stores/map";

export default defineComponent({
    components: {
        CallToAction,
        Thermometer,
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
            statisticStore,
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
                <div class="statistics">
                    <h1 class="header">Température / année</h1>
                    <div class="graph">TODO: graph</div>
                </div>
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

.statistics {
    background-color: var(--clr-beige);
    border-radius: var(--sz-600);
    padding: var(--sz-400) var(--sz-200);
}

.statistics .header {
    color: var(--color-heading);
    font-weight: 500;
    font-size: var(--sz-400);
}

.graph {
    min-height: 70px;  /* TODO: remove */
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
