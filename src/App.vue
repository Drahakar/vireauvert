<script lang="ts">
import * as Sentry from "@sentry/vue";
import { BrowserTracing } from "@sentry/tracing";
import MapView from "./components/MapView.vue";
import Legend from "./components/Legend.vue";
import Timeline from "./components/Timeline.vue";
import { defineComponent, ref } from "vue";
import { Catastrophe } from "./models/catastrophes";
import { useStore } from "./stores/store";

export default defineComponent({
  components: {
    MapView,
    Legend,
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
    <div class="row">
      <Legend id="legend" @on-request-catastrophe-focus="focusCatastrophe"
          class="col-md-3">
      </Legend>
      <MapView id="map-view" ref="map" class="col-md-9"></MapView>
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
@media (min-width: 768px) {  /* for devices >= 'md' */
  #map-view {
    height: calc(100vh - 96px);
  }
}

#legend {
  padding: 10px;
  max-height: calc(100vh - 96px);
}

#timeline {
  height: 96px;
}
</style>
