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
import { DEFAULT_USER_STATE, UserState } from "./models/user";
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
    emits: ['stateChanged'],
    props: {
        userState: {
            type: Object as PropType<UserState>,
            default: DEFAULT_USER_STATE
        }
    },
    setup(props, { emit }) {
        const currentState = computed({
            get: () => props.userState,
            set: value => emit('stateChanged', value)
        });

        const catastropheStore = useCatastropheStore();
        const map = ref<InstanceType<typeof MapView> | null>(null);
        return {
            map, currentState, catastropheStore, getTypeName
        };
    },
    methods: {
        focusCatastrophe(catastrophe: Catastrophe) {
            this.map?.focusCatastrophe(catastrophe);
        },
        selectDistrict(id: number) {
            this.currentState.district = id;
        },
        selectYear(year: number) {
            this.currentState.year = year;
        },
        selectCatastropheType(catastropheType: CatastropheFilter) {
            this.currentState.catastrophe = catastropheType;
        }
    },
    computed: {
        catastrophesDisabled(): boolean {
            return this.currentState.year > CURRENT_YEAR;
        },
        catastrophes(): List<Catastrophe> {
            return this.catastropheStore.findCatastrophes(
                this.currentState.year, this.currentState.district, this.currentState.catastrophe)
        }
    }
});
</script>

<template>
    <div class="d-md-block desktop-layout">
        <div class="row">
            <div class="legend col-md-3">
                <RegionSearch :district="currentState.district" @district-selected="selectDistrict"></RegionSearch>
                <Statistics :district="currentState.district" :year="currentState.year"></Statistics>
                <CandidateList :district="currentState.district"></CandidateList>
                <CatastropheList class="flex-grow-1" :year="currentState.year" :district="currentState.district"
                    @on-request-catastrophe-focus="focusCatastrophe" @on-filter-catastrophes="selectCatastropheType">
                </CatastropheList>
            </div>
            <MapView ref="map" class="map-view col-md-9" :district="currentState.district" :year="currentState.year"
                :catastrophes="catastrophes" @district-selected="selectDistrict"></MapView>
        </div>
        <div class="row">
            <Timeline class="timeline" :year="currentState.year" @year-selected="selectYear"></Timeline>
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
