
<template>
    <div id="legend">
        <select v-model="store.district">
            <option :value="0">Québec</option>
            <option v-for="district of store.allDistricts" :value="district.id">{{ district.name }}</option>
        </select>
        <div>Année de recherche: {{ store.year }}</div>
        <ul id="catastrophes">
            <li v-for="catastrophe of store.catastrophesForCurrentYearAndDistrict">
                <a href="#" @click.prevent="requestCatastropheFocus(catastrophe)">
                    {{ dateFormat.format(catastrophe.date) }}: {{ formatDescription(catastrophe) }} à {{ catastrophe.city }}
                </a>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">

import { Catastrophe, formatDescription } from '@/models/catastrophes';
import { useStore } from '@/stores/store';
import { defineComponent } from 'vue';

export default defineComponent({
    emits: ['onRequestCatastropheFocus'],
    setup() {
        const store = useStore();
        const dateFormat = new Intl.DateTimeFormat('fr-CA', {
            day: '2-digit',
            month: 'long'
        });
        return { store, formatDescription, dateFormat };
    },
    async mounted() {
        await this.store.updateCatastrophes();
    },
    methods: {
        requestCatastropheFocus(catastrophe: Catastrophe) {
            this.$emit('onRequestCatastropheFocus', catastrophe);
        }
    }
})
</script>

<style scoped>
#legend {
    float: left;
    width: 25%;
    height: calc(90% - 10px);
    ;
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
