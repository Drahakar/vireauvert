<script lang="ts">
import * as Sentry from "@sentry/vue";
import { List } from 'immutable';
import { Tabs, Tab } from 'vue3-tabs-component';
import { BrowserTracing } from "@sentry/tracing";
import CandidateList from "./components/CandidateList.vue";
import CatastropheList from "./components/CatastropheList.vue";
import MapView from "./components/MapView.vue";
import RegionSearch from "./components/RegionSearch.vue";
import Statistics from "./components/Statistics.vue";
import Timeline from "./components/Timeline.vue";
import { defineComponent, reactive, ref } from "vue";
import { Catastrophe, CatastropheFilter, getTypeName } from "./models/catastrophes";
import { useCandidateStore } from "./stores/candidates";
import { useCatastropheStore } from "./stores/catastrophes";
import { useStatisticStore } from "./stores/statistics";
import { CURRENT_YEAR } from "./models/constants";
import { DEFAULT_FILTER } from "./models/user";

export default defineComponent({
    components: {
        CandidateList,
        CatastropheList,
        MapView,
        RegionSearch,
        Statistics,
        Tab,
        Tabs,
        Timeline
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

        const filter = reactive(DEFAULT_FILTER);

        const mobileMap = ref<InstanceType<typeof MapView> | null>(null);
        const desktopMap = ref<InstanceType<typeof MapView> | null>(null);
        return {
            filter,
            mobileMap,
            desktopMap,
            catastropheStore,
            loadingCompleted,
            getTypeName
        };
    },
    methods: {
        focusCatastrophe(catastrophe: Catastrophe) {
            // TODO: maybe do this through event instead, see mitt library, then we
            // don't need refs
            this.mobileMap?.focusCatastrophe(catastrophe);
            this.desktopMap?.focusCatastrophe(catastrophe);
        },
        selectDistrict(id: number) {
            this.filter.district = id;
        },
        selectYear(year: number) {
            this.filter.year = year;
        },
        selectCatastropheType(catastropheType: CatastropheFilter) {
            this.filter.catastrophe = catastropheType;
        }
    },
    computed: {
        catastrophesDisabled(): boolean {
            return this.filter.year > CURRENT_YEAR;
        },
        catastrophes(): List<Catastrophe> {
            return this.catastropheStore.findCatastrophes(
                this.filter.year, this.filter.district, this.filter.catastrophe)
        }
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
    <div id="main" class="container-fluid">
        <!-- Mobile layout -->
        <div class="d-md-none mobile-layout">
            <RegionSearch :district="filter.district" @district-selected="selectDistrict"></RegionSearch>
            <tabs class="d-md-none tabs" nav-class="nav nav-pills nav-justified" nav-item-class="nav-item"
                nav-item-link-class="nav-link" nav-item-link-active-class="active"
                nav-item-link-disabled-class="disabled" panels-wrapper-class="flex-grow-1"
                :options="{ useUrlFragment: false }">
                <tab name="Carte" :selected="true" panel-class="tab-panel">
                    <Timeline class="timeline" :year="filter.year" @year-selected="selectYear"></Timeline>
                    <MapView ref="mobileMap" class="map-view flex-grow-1" :district="filter.district" :year="filter.year"
                        :catastrophes="catastrophes" @district-selected="selectDistrict"></MapView>
                    <span :class="{ invisible: catastrophesDisabled }">
                        {{ catastrophes.size }}
                        <span v-if="filter.catastrophe">
                            {{ getTypeName(filter.catastrophe, catastrophes.size != 1).toLowerCase() }}
                        </span>
                        <span v-else-if="catastrophes.size != 1">catastrophes</span>
                        <span v-else>catastrophe</span>
                        en {{ filter.year }}
                    </span>
                    <Statistics :district="filter.district" :year="filter.year"></Statistics>
                </tab>
                <tab name="Catastrophes" panel-class="tab-panel" :is-disabled="catastrophesDisabled">
                    <Timeline class="timeline" :year="filter.year" @year-selected="selectYear"></Timeline>
                    <CatastropheList class="flex-grow-1" :year="filter.year" :district="filter.district"
                        @on-request-catastrophe-focus="focusCatastrophe"
                        @on-filter-catastrophes="selectCatastropheType">
                    </CatastropheList>
                </tab>
                <tab name="Candidat(e)s" panel-class="tab-panel">
                    <CandidateList :district="filter.district"></CandidateList>
                </tab>
            </tabs>
        </div>
        <!-- Desktop layout -->
        <div class="d-none d-md-block desktop-layout">
            <div class="row">
                <div class="legend col-md-3">
                    <RegionSearch :district="filter.district" @district-selected="selectDistrict"></RegionSearch>
                    <Statistics :district="filter.district" :year="filter.year"></Statistics>
                    <CandidateList :district="filter.district"></CandidateList>
                    <CatastropheList class="flex-grow-1" :year="filter.year" :district="filter.district"
                        @on-request-catastrophe-focus="focusCatastrophe"
                        @on-filter-catastrophes="selectCatastropheType">
                    </CatastropheList>
                </div>
                <MapView ref="desktopMap" class="map-view col-md-9" :district="filter.district" :year="filter.year"
                    :catastrophes="catastrophes" @district-selected="selectDistrict"></MapView>
            </div>
            <div class="row">
                <Timeline class="timeline" :year="filter.year" @year-selected="selectYear"></Timeline>
            </div>
        </div>
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

.mobile-layout {
    padding-top: 10px;
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.mobile-layout>* {
    padding-top: 10px;
}

.map-view {
    min-height: 400px;
}

.desktop-layout .map-view {
    height: calc(100vh - 96px);
}

.legend {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
    max-height: calc(100vh - 96px);
}

.timeline {
    height: 96px;
}

.mobile-layout .timeline {
    padding-top: 0;
}

.invisible {
    visibility: hidden;
}

.tabs {
    height: 100%;
    display: flex;
    flex-direction: column;
}
</style>

<style>
/* global */
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
