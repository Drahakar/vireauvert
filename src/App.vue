<script lang="ts">
import * as Sentry from "@sentry/vue";
import { BrowserTracing } from "@sentry/tracing";
import CandidateList from "./components/CandidateList.vue";
import CatastropheList from "./components/CatastropheList.vue";
import MapView from "./components/MapView.vue";
import RegionSearch from "./components/RegionSearch.vue";
import Statistics from "./components/Statistics.vue";
import Timeline from "./components/Timeline.vue";
import { defineComponent, ref } from "vue";
import { Catastrophe } from "./models/catastrophes";
import { useStore } from "./stores/store";
import { useCandidateStore } from "./stores/candidates";
import { useCatastropheStore } from "./stores/catastrophes";
import { useStatisticStore } from "./stores/statistics";

export default defineComponent({
  components: {
    CandidateList,
    CatastropheList,
    MapView,
    RegionSearch,
    Statistics,
    Timeline
  },
  setup() {
    const store = useStore();
    const candidateStore = useCandidateStore();
    const catastropheStore = useCatastropheStore();
    const statisticStore = useStatisticStore();
    const map = ref<InstanceType<typeof MapView> | null>(null);
    return {
      map, store, candidateStore, catastropheStore, statisticStore
    };
  },
  methods: {
    focusCatastrophe(catastrophe: Catastrophe) {
      this.map?.focusCatastrophe(catastrophe);
    }
  },
  async mounted() {
    await this.store.loadData();
    await this.candidateStore.loadCandidates();
    await this.catastropheStore.loadCatastrophes();
    await this.statisticStore.loadStatistics();
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
    <div class="row">
      <div class="legend col-md-3">
        <RegionSearch></RegionSearch>
        <Statistics :district="store.district" :year="store.year"></Statistics>
        <CandidateList :district="store.district"></CandidateList>
        <CatastropheList :year="store.year" :district="store.district" @on-request-catastrophe-focus="focusCatastrophe">
        </CatastropheList>
      </div>
      <MapView id="map-view" ref="map" class="col-md-9" :district="store.district" :year="store.year"
        :catastrophes="catastropheStore.findCatastrophes(store.year, store.district)"
        @district-selected="(id: number) => store.district = id"></MapView>
    </div>
    <div class="row">
      <Timeline id="timeline"></Timeline>
    </div>
  </div>
</template>

<style scoped>
#main {
  height: 100vh;
}

#map-view {
  height: calc(60vh - 96px);
}

@media (min-width: 768px) {

  /* for devices >= 'md' */
  #map-view {
    height: calc(100vh - 96px);
  }
}

.legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  max-height: calc(100vh - 96px);
}

#timeline {
  height: 96px;
}
</style>
