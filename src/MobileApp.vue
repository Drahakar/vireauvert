<script lang="ts">
import { List } from 'immutable';
import { Tabs, Tab } from 'vue3-tabs-component';
import CandidateList from "./components/CandidateList.vue";
import CatastropheList from "./components/CatastropheList.vue";
import Header from "./components/Header.vue";
import MapView from "./components/MapView.vue";
import RegionSearch from "./components/RegionSearch.vue";
import Statistics from "./components/Statistics.vue";
import Timeline from "./components/Timeline.vue";
import { defineComponent, PropType, ref } from "vue";
import { Catastrophe, CatastropheFilter } from "./models/catastrophes";
import { useCatastropheStore } from "./stores/catastrophes";
import { CURRENT_YEAR } from "./models/constants";
import { DEFAULT_USER_STATE, UserState } from "./models/user";
import { allDistricts } from './models/map';

export default defineComponent({
    components: {
        CandidateList,
        CatastropheList,
        Header,
        MapView,
        RegionSearch,
        Statistics,
        Tab,
        Tabs,
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
            map,
            catastropheStore
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
        },
        getDistrictName(id: number) {
            return allDistricts.find(x => x.id === id)?.name ?? '';
        }
    },
    computed: {
        catastrophes(): List<Catastrophe> {
            return this.catastropheStore.findCatastrophes(
                this.userState.year, this.userState.district, this.userState.catastrophe)
        },
        catastropheTabSuffix() {
            // Tab library we're using doesn't have slots, so we generate HTML by hand
            if (this.userState.year <= CURRENT_YEAR) {
                return `<span class="badge rounded-pill bg-danger ms-2">${this.catastrophes.size}</span>`;
            }
            return '';
        }
    }
});
</script>

<template>
    <div class="mobile-layout">
        <Header class="header col-12"></Header>
        <RegionSearch class="search side-margins" :district="userState.district" @district-selected="selectDistrict"></RegionSearch>
        <tabs class="tabs" nav-class="nav nav-pills nav-justified tabs-header" nav-item-class="nav-item"
            nav-item-link-class="nav-link" nav-item-link-active-class="active" nav-item-link-disabled-class="disabled"
            panels-wrapper-class="flex-grow-1" :options="{ useUrlFragment: false }">
            <tab name="Carte" :selected="true" panel-class="tab-panel">
                <Timeline class="timeline" :year="userState.year" @year-selected="selectYear" :district="userState.district" :isMobile="true">
                </Timeline>
                <MapView ref="mobileMap" class="map-view flex-grow-1" :district="userState.district"
                    :year="userState.year" :catastrophes="catastrophes" @district-selected="selectDistrict"
                    :location="userState.location" @location-changed="mapMoved" :zoom="userState.zoom"
                    @zoom-changed="mapZoomed"></MapView>
                <div class="side-margins">
                    <Statistics :district="userState.district" :year="userState.year"></Statistics>
                </div>
            </tab>
            <tab name="Catastrophes" panel-class="tab-panel" :suffix="catastropheTabSuffix">
                <Timeline class="timeline" :year="userState.year" @year-selected="selectYear" :district="userState.district" :isMobile="true"></Timeline>
                <div class="side-margins">
                    <CatastropheList class="flex-grow-1" :year="userState.year" :district="userState.district"
                        @on-request-catastrophe-focus="focusCatastrophe" @on-filter-catastrophes="selectCatastropheType">
                    </CatastropheList>
                </div>
            </tab>
            <tab name="Candidat(e)s" panel-class="tab-panel">
                <div class="side-margins">
                    <CandidateList :district="userState.district"></CandidateList>
                </div>
            </tab>
        </tabs>
    </div>

</template>

<style scoped>
.header {
    padding-top: 0;
    height: 48px;
}

.mobile-layout {
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.map-view {
    min-height: 400px;
}

.search {
    padding-top: 10px;
}

.side-margins {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
}

.timeline {
    height: 96px;
}

.mobile-layout .timeline {
    padding-top: 0;
}

.invisible {
    visibility: hidden;
}

.tabs {
    padding-top: 10px;
    height: 100%;
    display: flex;
    flex-direction: column;
}
</style>

<style> /* global */
.tabs-header {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
}
</style>
