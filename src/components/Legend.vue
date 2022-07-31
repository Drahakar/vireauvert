
<template>
    <div id="legend">
        <select v-model="store.district">
            <option value="">Québec</option>
            <option v-for="district of districts" v-bind:value="district">{{district}}</option>
        </select>
        <div>Année de recherche: {{ store.year }}</div>
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
    height: 90%;
    padding: 10px;
}

#legend select {
    font-size: large;
    font-weight: bold;
}
</style>
