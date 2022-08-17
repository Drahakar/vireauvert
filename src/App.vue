<script lang="ts">
import * as Sentry from "@sentry/vue";
import {Tabs, Tab} from 'vue3-tabs-component';
import { BrowserTracing } from "@sentry/tracing";
import CallToAction from "./components/CallToAction.vue";
import CandidateList from "./components/CandidateList.vue";
import CatastropheList from "./components/CatastropheList.vue";
import MapView from "./components/MapView.vue";
import RegionSearch from "./components/RegionSearch.vue";
import Statistics from "./components/Statistics.vue";
import Timeline from "./components/Timeline.vue";
import { defineComponent, ref } from "vue";
import { Catastrophe, getTypeName } from "./models/catastrophes";
import { useStore, CURRENT_YEAR } from "./stores/store";

export default defineComponent({
  components: {
    CallToAction,
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
    const store = useStore();
    const mobileMap = ref<InstanceType<typeof MapView> | null>(null);
    const desktopMap = ref<InstanceType<typeof MapView> | null>(null);
    return {
      mobileMap, desktopMap, store
    };
  },
  methods: {
    focusCatastrophe(catastrophe: Catastrophe) {
      // TODO: do this through event instead, see mitt library, then we don't
      // need refs
      this.mobileMap?.focusCatastrophe(catastrophe);
      this.desktopMap?.focusCatastrophe(catastrophe);
    },
    catastrophesInfo() {
      if (this.store.catastropheType) {
        return 'Catastrophes affichées: ' + getTypeName(this.store.catastropheType);
      } else if (!this.catastrophesDisabled()) {
        const num = this.store.selectedData.catastrophes.size;
        const pluralized = 'catastrophe' + (num > 1 ? 's' : '');
        return num.toString() + ' ' + pluralized + ' en ' + this.store.year.toString();
      } else {
        return '';
      }
    },
    catastrophesDisabled() {
      return this.store.year > CURRENT_YEAR;
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
        nav-item-link-disabled-class="disabled"
        panels-wrapper-class="flex-grow-1"
        :options="{ useUrlFragment: false }">
        <tab name="Carte" :selected="true" panel-class="tab-panel">
          <Timeline class="timeline"></Timeline>
          <MapView class="map-view flex-grow-1" ref="mobileMap"></MapView>
          <span>{{catastrophesInfo()}}</span>
          <Statistics></Statistics>
        </tab>
        <tab name="Catastrophes" panel-class="tab-panel"
          :is-disabled="catastrophesDisabled()">
          <Timeline class="timeline"></Timeline>
          <CatastropheList class="flex-grow-1"
            @on-request-catastrophe-focus="focusCatastrophe">
          </CatastropheList>
        </tab>
        <tab name="Candidat(e)s" panel-class="tab-panel">
          <CandidateList></CandidateList>
          <CallToAction class="call-to-action"></CallToAction>
        </tab>
      </tabs>
    </div>
    <!-- Desktop layout -->
    <div class="d-none d-md-block desktop-layout">
      <div class="row">
        <div class="legend col-md-3" >
          <RegionSearch></RegionSearch>
          <Statistics></Statistics>
          <CandidateList></CandidateList>
          <CallToAction class="call-to-action"></CallToAction>
          <CatastropheList @on-request-catastrophe-focus="focusCatastrophe"></CatastropheList>
        </div>
        <MapView ref="desktopMap" class="map-view col-md-9"></MapView>
      </div>
      <div class="row">
        <Timeline id="timeline"></Timeline>
      </div>
    </div>
  </div>
</template>

<style scoped>
#main {
  height: 100vh;
}

.mobile-layout {
  padding-top: 10px;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.mobile-layout > * {
  padding-top: 10px;
}

.map-view {
  min-height: 300px;
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

.tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.call-to-action {
  margin: 15px;
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
