<script lang="ts">
import Map from "./components/Map.vue";
import Legend from "./components/Legend.vue";
import Timeline from "./components/Timeline.vue";

export default {
  components: {
    Map,
    Legend,
    Timeline
  },
  data() {
    return {
      selectedRegion: "", 
    };
  },
};
</script>

<template>
  <Legend :region="selectedRegion"></Legend>
  <Map @update:region-selected="(region) => selectedRegion = region"></Map>
  <Timeline></Timeline>
</template>