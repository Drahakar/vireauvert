<template>
    <v-select
        aria-label="Circonscription" :options="getDistrictOptions()"
        v-model="store.district" label="name"
        :reduce="getDistrictId"
        :clearable="false">
        <template #no-options="{ search, searching, loading }">
          Désolé, aucune circonscription trouvée avec ce nom.
        </template>
    </v-select>
</template>

<script lang="ts">

import { DistrictProperties } from '@/models/map';
import { useStore } from '@/stores/store';
import { defineComponent } from 'vue';
import vSelect from 'vue-select';


export default defineComponent({
    components: { vSelect },
    setup() {
        const store = useStore();
        return { store };
    },
    methods: {
        getDistrictOptions(): DistrictProperties[] {
            return [{id: 0, name: "Province de Québec"}].concat(
                this.store.allDistricts);
        },
        getDistrictId(district: DistrictProperties) {
            return district.id;
        },
    }
})
</script>
