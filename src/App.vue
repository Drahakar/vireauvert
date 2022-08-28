<script lang="ts">
import * as Sentry from "@sentry/vue";
import { BrowserTracing } from "@sentry/tracing";
import { defineComponent, reactive, ref } from "vue";
import { useCandidateStore } from "./stores/candidates";
import { useCatastropheStore } from "./stores/catastrophes";
import { useStatisticStore } from "./stores/statistics";
import { DEFAULT_USER_STATE } from "./models/user";
import MobileApp from "./MobileApp.vue";
import DesktopApp from "./DesktopApp.vue";

export default defineComponent({
    components: {
        MobileApp,
        DesktopApp
    },
    setup() {
        const candidateStore = useCandidateStore();
        const catastropheStore = useCatastropheStore();
        const statisticStore = useStatisticStore();

        const loadingCompleted = ref<boolean>(false);

        const storeLoads = Promise.allSettled([
            candidateStore.loadCandidates(),
            catastropheStore.loadCatastrophes(),
            statisticStore.loadStatistics()
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
    <div id="main" class="mx-0">
        <DesktopApp v-if="isDesktop" class="desktop-layout" :userState="state"></DesktopApp>
        <MobileApp v-else class="mobile-layout" :userState="state"></MobileApp>
        <div id="loading-overlay" v-if="!loadingCompleted">
            <div class="spinner-border" role="status" style="width: 5rem; height: 5rem;"></div>
            <h3 class="mt-2">Chargement des données...</h3>
        </div>
    </div>
</template>

<style scoped>
#main {
    height: 100vh;
}

#loading-overlay {
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
</style>

<style>
/* global */
.mobile-layout {}
.desktop-layout {}
.tab-panel {
    padding-top: 10px;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.tab-panel>* {
    margin-top: 10px;
}
</style>
