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
import { DEFAULT_FILTER, UserFilter } from "./models/user";

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
    <div class="mobile-layout">
        <RegionSearch :district="currentFilter.district" @district-selected="selectDistrict"></RegionSearch>
        <tabs class="tabs" nav-class="nav nav-pills nav-justified" nav-item-class="nav-item"
            nav-item-link-class="nav-link" nav-item-link-active-class="active" nav-item-link-disabled-class="disabled"
            panels-wrapper-class="flex-grow-1" :options="{ useUrlFragment: false }">
            <tab name="Carte" :selected="true" panel-class="tab-panel">
                <Timeline class="timeline" :year="currentFilter.year" @year-selected="selectYear"></Timeline>
                <MapView ref="mobileMap" class="map-view flex-grow-1" :district="currentFilter.district" :year="currentFilter.year"
                    :catastrophes="catastrophes" @district-selected="selectDistrict"></MapView>
                <span :class="{ invisible: catastrophesDisabled }">
                    {{ catastrophes.size }}
                    <span v-if="currentFilter.catastrophe">
                        {{ getTypeName(currentFilter.catastrophe, catastrophes.size != 1).toLowerCase() }}
                    </span>
                    <span v-else-if="catastrophes.size != 1">catastrophes</span>
                    <span v-else>catastrophe</span>
                    en {{ currentFilter.year }}
                </span>
                <Statistics :district="currentFilter.district" :year="currentFilter.year"></Statistics>
            </tab>
            <tab name="Catastrophes" panel-class="tab-panel" :is-disabled="catastrophesDisabled">
                <Timeline class="timeline" :year="currentFilter.year" @year-selected="selectYear"></Timeline>
                <CatastropheList class="flex-grow-1" :year="currentFilter.year" :district="currentFilter.district"
                    @on-request-catastrophe-focus="focusCatastrophe" @on-filter-catastrophes="selectCatastropheType">
                </CatastropheList>
            </tab>
            <tab name="Candidat(e)s" panel-class="tab-panel">
                <CandidateList :district="currentFilter.district"></CandidateList>
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