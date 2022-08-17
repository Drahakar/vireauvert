<template>
    <div id="legend">
        <RegionSearch></RegionSearch>
        <Statistics></Statistics>
        <CandidateList></CandidateList>
        <CallToAction></CallToAction>
        <CatastropheList
            @on-request-catastrophe-focus="(loc) => $emit('onRequestCatastropheFocus', loc)">
        </CatastropheList>
    </div>
</template>

<script lang="ts">
import CallToAction from "./CallToAction.vue";
import CandidateList from "./CandidateList.vue";
import CatastropheList from "./CatastropheList.vue";
import RegionSearch from "./RegionSearch.vue";
import Statistics from "./Statistics.vue";
import { defineComponent } from 'vue';
export default defineComponent({
    emits: ['onRequestCatastropheFocus'],
    components: {
        CallToAction,
        CandidateList,
        CatastropheList,
        RegionSearch,
        Statistics
    },
})
</script>

<style scoped>
#legend {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>
