<script lang="ts">
import { List } from 'immutable';
import CandidateList from "./components/CandidateList.vue";
import CatastropheList from "./components/CatastropheList.vue";
import Header from "./components/Header.vue";
import MapView from "./components/MapView.vue";
import RegionSearch from "./components/RegionSearch.vue";
import Statistics from "./components/Statistics.vue";
import Timeline from "./components/Timeline.vue";
import { defineComponent, PropType, ref } from "vue";
import { Catastrophe, CatastropheFilter } from "./models/catastrophes";
import { CURRENT_YEAR } from "./models/constants";
import { DEFAULT_USER_STATE, UserState } from "./models/user";
import { useCatastropheStore } from "./stores/catastrophes";

export default defineComponent({
    components: {
        CandidateList,
        CatastropheList,
        Header,
        MapView,
        RegionSearch,
        Statistics,
        Timeline
    },
    props: {
        userState: {
            type: Object as PropType<UserState>,
            default: DEFAULT_USER_STATE
        }
    },
    setup() {
        const catastropheStore = useCatastropheStore();
        const map = ref<InstanceType<typeof MapView> | null>(null);
        return {
            map, catastropheStore
        };
    },
    methods: {
        focusCatastrophe(catastrophe: Catastrophe) {
            this.map?.focusCatastrophe(catastrophe);
        },
        selectDistrict(id: number) {
            this.userState.district = id;
        },
        selectYear(year: number) {
            this.userState.year = year;
        },
        selectCatastropheType(catastropheType: CatastropheFilter) {
            this.userState.catastrophe = catastropheType;
        },
        mapMoved(location: [number, number]) {
            this.userState.location = location;
        },
        mapZoomed(zoom: number) {
            this.userState.zoom = zoom;
        }
    },
    computed: {
        catastrophesDisabled(): boolean {
            return this.userState.year > CURRENT_YEAR;
        },
        catastrophes(): List<Catastrophe> {
            return this.catastropheStore.findCatastrophes(
                this.userState.year, this.userState.district, this.userState.catastrophe)
        }
    }
});
</script>

<template>
    <div class="d-md-block desktop-layout">
        <Header class="header col-12"></Header>
        <div class="row">
            <div class="legend col-md-3">
                <RegionSearch :district="userState.district" @district-selected="selectDistrict"></RegionSearch>
                <Statistics :district="userState.district" :year="userState.year"></Statistics>
                <CandidateList :district="userState.district"></CandidateList>
                <CatastropheList class="flex-grow-1" :year="userState.year" :district="userState.district"
                    @on-request-catastrophe-focus="focusCatastrophe" @on-filter-catastrophes="selectCatastropheType">
                </CatastropheList>
            </div>
            <MapView ref="map" class="map-view col-md-9" :district="userState.district" :year="userState.year"
                :catastrophes="catastrophes" @district-selected="selectDistrict" :location="userState.location"
                @location-changed="mapMoved" :zoom="userState.zoom" @zoom-changed="mapZoomed"></MapView>
        </div>
        <div class="row">
            <Timeline class="timeline" :year="userState.year" @year-selected="selectYear" :district="userState.district"></Timeline>
        </div>
    </div>
</template>

<style scoped>
.header {
    height: 64px;
}

.map-view {
    min-height: 400px;
    height: calc(100vh - 96px - 65px);
}

.legend {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
    max-height: calc(100vh - 96px - 65px);
}

.timeline {
    height: 96px;
}
</style>
