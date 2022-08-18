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
import { useCandidateStore } from "./stores/candidates";
import { useCatastropheStore } from "./stores/catastrophes";
import { useStatisticStore } from "./stores/statistics";
import { CURRENT_YEAR } from "./models/constants";

export default defineComponent({
  components: {
    CandidateList,
    CatastropheList,
    MapView,
    RegionSearch,
    Statistics,
    Timeline
  },
  data() {
    return {
      district: 0,
      year: CURRENT_YEAR
    }
  },
  setup() {
    const candidateStore = useCandidateStore();
    const catastropheStore = useCatastropheStore();
    const statisticStore = useStatisticStore();
    const map = ref<InstanceType<typeof MapView> | null>(null);
    return {
      map, candidateStore, catastropheStore, statisticStore
    };
  },
  methods: {
    focusCatastrophe(catastrophe: Catastrophe) {
      this.map?.focusCatastrophe(catastrophe);
    },
    selectDistrict(id: number) {
      this.district = id;
    },
    selectYear(year: number) {
      this.year = year;
    }
  },
  async created() {
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
        <RegionSearch :district="district" @district-selected="selectDistrict"></RegionSearch>
        <Statistics :district="district" :year="year"></Statistics>
        <CandidateList :district="district"></CandidateList>
        <CatastropheList :year="year" :district="district" @on-request-catastrophe-focus="focusCatastrophe">
        </CatastropheList>
      </div>
      <MapView id="map-view" ref="map" class="col-md-9" :district="district" :year="year"
        :catastrophes="catastropheStore.findCatastrophes(year, district)"
        @district-selected="selectDistrict"></MapView>
    </div>
    <div class="row">
      <Timeline id="timeline" :year="year" @year-selected="selectYear"></Timeline>
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
