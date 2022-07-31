
<template>
    <div id="legend">
        <select v-model="store.district">
            <option value="">Québec</option>
            <option v-for="district of districts" v-bind:value="district">{{ district }}</option>
        </select>
        <div>Année de recherche: {{ store.year }}</div>
        <ul id="catastrophes">
            <li v-for="catastrophe of store.catastrophesForCurrentYearAndDistrict">{{ catastrophe.description }}</li>
        </ul>
    </div>
</template>

<script lang="ts">

import { useStore } from '@/stores/store';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue'
import { districts } from '@/models/districts';

export default defineComponent({
    setup() {
        const store = useStore();
        const districtNames = Object.values(districts);
        return {
            store, districts: districtNames
        };
    },
    computed: {
        ...mapStores(useStore)
    },
    async mounted() {
        await this.store.updateCatastrophes();
    }
})
</script>

<style scoped>
#legend {
    float: left;
    width: 25%;
    height: calc(90% - 10px);;
    padding: 10px;
}

#catastrophes {
    overflow-y: scroll;
    height: calc(100% - 10px);
}

#legend select {
    font-size: large;
    font-weight: bold;
}
</style>
