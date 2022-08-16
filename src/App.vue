<script lang="ts">
import * as Sentry from "@sentry/vue";
import {Tabs, Tab} from 'vue3-tabs-component';
import { BrowserTracing } from "@sentry/tracing";
import MapView from "./components/MapView.vue";
import Legend from "./components/Legend.vue";
import RegionSearch from '@/components/RegionSearch.vue';
import Statistics from "./components/Statistics.vue";
import Timeline from "./components/Timeline.vue";
import { defineComponent, ref } from "vue";
import { Catastrophe } from "./models/catastrophes";
import { useStore } from "./stores/store";

export default defineComponent({
  components: {
    MapView,
    Legend,
    RegionSearch,
    Statistics,
    Tab,
    Tabs,
    Timeline
  },
  setup() {
    const store = useStore();
    const map = ref<InstanceType<typeof MapView> | null>(null);
    return {
      map, store
    };
  },
  methods: {
    focusCatastrophe(catastrophe: Catastrophe) {
      this.map?.focusCatastrophe(catastrophe);
    }
  },
  async mounted() {
    await this.store.loadData();
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
      <RegionSearch></RegionSearch>
      <tabs class="d-md-none tabs"
        nav-class="nav nav-pills nav-justified" nav-item-class="nav-item"
        nav-item-link-class="nav-link" nav-item-link-active-class="active"
        panels-wrapper-class="flex-grow-1"
        :options="{ useUrlFragment: false }">
        <tab name="Carte" :selected="true" panel-class="tab-panel">
          <Timeline class="timeline"></Timeline>
          <Statistics></Statistics>
          <MapView class="map-view flex-grow-1"></MapView>
        </tab>
        <tab name="Catastrophes" panel-class="tab-panel">
          <Timeline class="timeline"></Timeline>
          <p>CATASTROPHES</p>
        </tab>
        <tab name="Candidat(e)s" panel-class="tab-panel">
          <p>CANDIDAT(E)S</p>
        </tab>
      </tabs>
    </div>
    <!-- Desktop layout -->
    <div class="d-none d-md-block">
      <div class="row">
        <div class="legend col-md-3">
          <RegionSearch></RegionSearch>
          <Legend @on-request-catastrophe-focus="focusCatastrophe"></Legend>
        </div>
        <MapView class="map-view col-md-9"></MapView>
      </div>
      <div class="row">
        <Timeline class="timeline"></Timeline>
      </div>
    </div>
  </div>
</template>

<style scoped>
#main {
  height:100vh;
}

.mobile-layout {
  padding-top: 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.mobile-layout > * {
  padding-top: 10px;
}

.map-view {
  height: calc(100vh - 96px);
}
.mobile-layout .map-view {
  height: calc(65vh - 96px);
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

.tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>

<style> /* global */
.tab-panel {
  padding-top: 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.tab-panel > * {
  margin-top: 10px;
}
</style>
