<template>
    <v-select aria-label="Circonscription" :options="districtOptions" v-model="selectedDistrict" label="name"
        :reduce="getDistrictId" :clearable="false">
        <template #no-options="{ search, searching, loading }" v-t="'no_district_search_results'">
        </template>
    </v-select>
</template>

<script lang="ts">

import { allDistricts, DistrictProperties } from '@/models/map';
import { computed, defineComponent } from 'vue';
import vSelect from 'vue-select';

export default defineComponent({
    components: { vSelect },
    emits: ['districtSelected'],
    props: {
        district: {
            type: Number,
            default: 0
        }
    },
    setup(props, { emit }) {
        const selectedDistrict = computed({
            get: () => props.district,
            set: value => emit('districtSelected', value)
        });
        return { selectedDistrict };
    },
    computed: {
        districtOptions(): DistrictProperties[] {
            const options = [{ id: 0, name: this.$t('province_of_quebec') }].concat(allDistricts.toArray());
            return options;
        },
    },
    methods: {
        getDistrictId(district: DistrictProperties) {
            return district.id;
        },
    }
})
</script>
