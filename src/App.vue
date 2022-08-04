<script lang="ts">
import * as Sentry from "@sentry/vue";
import { BrowserTracing } from "@sentry/tracing";
import MapView from "./components/MapView.vue";
import Legend from "./components/Legend.vue";
import Timeline from "./components/Timeline.vue";
import { defineComponent, ref } from "vue";
import { Catastrophe } from "./models/catastrophes";

export default defineComponent({
  components: {
    MapView,
    Legend,
    Timeline
  },
  setup() {
    const map = ref<InstanceType<typeof MapView> | null>(null);
    return {
      map
    };
  },
  methods: {
    focusCatastrophe(catastrophe: Catastrophe) {
      this.map?.focusCatastrophe(catastrophe);
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
  <Legend @on-request-catastrophe-focus="focusCatastrophe"></Legend>
  <MapView ref="map"></MapView>
  <Timeline></Timeline>
</template>