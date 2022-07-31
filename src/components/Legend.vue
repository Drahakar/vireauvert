
<template>
    <div id="legend">
        <h1>{{ store.region }}</h1>
        <div>Année de recherche: {{ store.year }}</div>
    </div>
</template>

<script lang="ts">

import { useStore } from '@/stores/store';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue'

export default defineComponent({
    setup() {
        const store = useStore();
        return { store };
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
}
</style>
