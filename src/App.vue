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
  },
  data() {
    return {
      selectedRegion: "", 
    };
  },
  methods: {
    updateSelectedRegion(region: string) {
      this.selectedRegion = region;
    }
  }
});

</script>

<template>
  <Legend :region="selectedRegion"></Legend>
  <Map @update:region-selected="updateSelectedRegion"></Map>
  <Timeline></Timeline>
</template>