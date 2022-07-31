<script lang="ts">
import * as Sentry from "@sentry/vue";
import { BrowserTracing } from "@sentry/tracing";
import Map from "./components/Map.vue";
import Legend from "./components/Legend.vue";
import Timeline from "./components/Timeline.vue";
import { defineComponent } from "vue";

export default defineComponent({
  components: {
    Map,
    Legend,
    Timeline
  }
});

Sentry.init({
  dsn: "https://28318a44bb0b42b38e6b0df57cbe1986@o1340974.ingest.sentry.io/6613977",
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
});
</script>

<template>
  <Legend></Legend>
  <Map></Map>
  <Timeline></Timeline>
</template>