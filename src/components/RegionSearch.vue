<template>
    <v-select aria-label="Circonscription" :options="districtOptions" v-model="store.district" label="name"
        :reduce="getDistrictId" :clearable="false">
        <template #no-options="{ search, searching, loading }">
            Désolé, aucune circonscription trouvée avec ce nom.
        </template>
    </v-select>
</template>

<script lang="ts">

import { allDistricts, DistrictProperties } from '@/models/map';
import { useStore } from '@/stores/store';
import { defineComponent } from 'vue';
import vSelect from 'vue-select';

export default defineComponent({
    components: { vSelect },
    setup() {
        const store = useStore();
        return { store };
    },
    computed: {
        districtOptions(): DistrictProperties[] {
            return [{ id: 0, name: "Province de Québec" }].concat(allDistricts.toArray());
        }
    },
    methods: {
        getDistrictId(district: DistrictProperties) {
            return district.id;
        },
    }
})
</script>
