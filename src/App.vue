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
  <div id="main">
    <Legend id="legend" @on-request-catastrophe-focus="focusCatastrophe"></Legend>
    <MapView id="map-view" ref="map"></MapView>
    <Timeline id="timeline"></Timeline>
  </div>
</template>

<style scoped>
#main {
  height: 100vh;
  display: grid;
  grid-template-columns: 25% 1fr;
  grid-template-rows: 1fr 96px;
  grid-auto-flow: row;
}

#legend {
  padding: 10px 0 10px 10px;
  height: calc(100vh - 96px);
}

#timeline {
  grid-column: 1 / span 2;
  height: 96px;
}
</style>