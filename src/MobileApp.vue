<script lang="ts">
import { List } from 'immutable';
import { Tabs, Tab } from 'vue3-tabs-component';
import CandidateList from "./components/CandidateList.vue";
import CatastropheList from "./components/CatastropheList.vue";
import MapView from "./components/MapView.vue";
import RegionSearch from "./components/RegionSearch.vue";
import Statistics from "./components/Statistics.vue";
import Timeline from "./components/Timeline.vue";
import { computed, defineComponent, PropType, ref } from "vue";
import { Catastrophe, CatastropheFilter, getTypeName } from "./models/catastrophes";
import { useCatastropheStore } from "./stores/catastrophes";
import { CURRENT_YEAR } from "./models/constants";
import { DEFAULT_USER_STATE, UserState } from "./models/user";

export default defineComponent({
    components: {
        CandidateList,
        CatastropheList,
        MapView,
        RegionSearch,
        Statistics,
        Tab,
        Tabs,
        Timeline
    },
    emits: ['stateChanged'],
    props: {
        filter: {
            type: Object as PropType<UserState>,
            default: DEFAULT_USER_STATE
        }
    },
    setup(props, { emit }) {
        const currentState = computed({
            get: () => props.filter,
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
    <div class="mobile-layout">
        <RegionSearch :district="currentState.district" @district-selected="selectDistrict"></RegionSearch>
        <tabs class="tabs" nav-class="nav nav-pills nav-justified" nav-item-class="nav-item"
            nav-item-link-class="nav-link" nav-item-link-active-class="active" nav-item-link-disabled-class="disabled"
            panels-wrapper-class="flex-grow-1" :options="{ useUrlFragment: false }">
            <tab name="Carte" :selected="true" panel-class="tab-panel">
                <Timeline class="timeline" :year="currentState.year" @year-selected="selectYear"></Timeline>
                <MapView ref="mobileMap" class="map-view flex-grow-1" :district="currentState.district" :year="currentState.year"
                    :catastrophes="catastrophes" @district-selected="selectDistrict"></MapView>
                <span :class="{ invisible: catastrophesDisabled }">
                    {{ catastrophes.size }}
                    <span v-if="currentState.catastrophe">
                        {{ getTypeName(currentState.catastrophe, catastrophes.size != 1).toLowerCase() }}
                    </span>
                    <span v-else-if="catastrophes.size != 1">catastrophes</span>
                    <span v-else>catastrophe</span>
                    en {{ currentState.year }}
                </span>
                <Statistics :district="currentState.district" :year="currentState.year"></Statistics>
            </tab>
            <tab name="Catastrophes" panel-class="tab-panel" :is-disabled="catastrophesDisabled">
                <Timeline class="timeline" :year="currentState.year" @year-selected="selectYear"></Timeline>
                <CatastropheList class="flex-grow-1" :year="currentState.year" :district="currentState.district"
                    @on-request-catastrophe-focus="focusCatastrophe" @on-filter-catastrophes="selectCatastropheType">
                </CatastropheList>
            </tab>
            <tab name="Candidat(e)s" panel-class="tab-panel">
                <CandidateList :district="currentState.district"></CandidateList>
            </tab>
        </tabs>
    </div>

</template>

<style scoped>
.mobile-layout {
    padding-top: 10px;
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.mobile-layout>* {
    padding-top: 10px;
}

.map-view {
    min-height: 400px;
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
    height: 100%;
    display: flex;
    flex-direction: column;
}
</style>