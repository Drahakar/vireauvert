<script lang="ts">
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

</script>

<template>
  <Legend></Legend>
  <Map></Map>
  <Timeline></Timeline>
</template>