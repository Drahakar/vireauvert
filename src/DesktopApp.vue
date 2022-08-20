<script lang="ts">
import { List } from 'immutable';
import CandidateList from "./components/CandidateList.vue";
import CatastropheList from "./components/CatastropheList.vue";
import MapView from "./components/MapView.vue";
import RegionSearch from "./components/RegionSearch.vue";
import Statistics from "./components/Statistics.vue";
import Timeline from "./components/Timeline.vue";
import { computed, defineComponent, PropType, ref } from "vue";
import { Catastrophe, CatastropheFilter, getTypeName } from "./models/catastrophes";
import { CURRENT_YEAR } from "./models/constants";
import { DEFAULT_FILTER, UserFilter } from "./models/user";
import { useCatastropheStore } from "./stores/catastrophes";

export default defineComponent({
    components: {
        CandidateList,
        CatastropheList,
        MapView,
        RegionSearch,
        Statistics,
        Timeline
    },
    emits: ['filterChanged'],
    props: {
        filter: {
            type: Object as PropType<UserFilter>,
            default: DEFAULT_FILTER
        }
    },
    setup(props, { emit }) {
        const currentFilter = computed({
            get: () => props.filter,
            set: value => emit('filterChanged', value)
        });

        const catastropheStore = useCatastropheStore();
        const map = ref<InstanceType<typeof MapView> | null>(null);
        return {
            map, currentFilter, catastropheStore, getTypeName
        };
    },
    methods: {
        focusCatastrophe(catastrophe: Catastrophe) {
            this.map?.focusCatastrophe(catastrophe);
        },
        selectDistrict(id: number) {
            this.currentFilter.district = id;
        },
        selectYear(year: number) {
            this.currentFilter.year = year;
        },
        selectCatastropheType(catastropheType: CatastropheFilter) {
            this.currentFilter.catastrophe = catastropheType;
        }
    },
    computed: {
        catastrophesDisabled(): boolean {
            return this.currentFilter.year > CURRENT_YEAR;
        },
        catastrophes(): List<Catastrophe> {
            return this.catastropheStore.findCatastrophes(
                this.currentFilter.year, this.currentFilter.district, this.currentFilter.catastrophe)
        }
    }
});
</script>

<template>
    <div class="d-md-block desktop-layout">
        <div class="row">
            <div class="legend col-md-3">
                <RegionSearch :district="currentFilter.district" @district-selected="selectDistrict"></RegionSearch>
                <Statistics :district="currentFilter.district" :year="currentFilter.year"></Statistics>
                <CandidateList :district="currentFilter.district"></CandidateList>
                <CatastropheList class="flex-grow-1" :year="currentFilter.year" :district="currentFilter.district"
                    @on-request-catastrophe-focus="focusCatastrophe" @on-filter-catastrophes="selectCatastropheType">
                </CatastropheList>
            </div>
            <MapView ref="map" class="map-view col-md-9" :district="currentFilter.district" :year="currentFilter.year"
                :catastrophes="catastrophes" @district-selected="selectDistrict"></MapView>
        </div>
        <div class="row">
            <Timeline class="timeline" :year="currentFilter.year" @year-selected="selectYear"></Timeline>
        </div>
    </div>
</template>

<style scoped>
.map-view {
    min-height: 400px;
    height: calc(100vh - 96px);
}

.legend {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
    max-height: calc(100vh - 96px);
}

.timeline {
    height: 96px;
}
</style>
