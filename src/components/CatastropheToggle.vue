<template>
    <div class="wrapper" :class="{expanded: expanded}">
        <section class="container">
            <header class="row" @click="expanded = !expanded">
                <PillBadge class="total-count pill" :value="currentCatastrophesCount"
                    data-tutorial-step="catastrophes-count"></PillBadge>
                <img class="catastrophe-icon" src="/icons/attention-highlight.png">
                <div class="title"><span>Événements extrêmes</span></div>
                <button v-if="expanded"><img src="/icons/x.svg"></button>
                <button v-else><img src="/icons/settings.svg"></button>
            </header>

            <template v-if="expanded" v-for="(toggle, index) in catastropheToggles">
                <div v-if="index > 0" class="separator"></div>
                <div class="row">
                    <PillBadge class="pill"
                        :class="[{invisible: toggle.count == 0}, toggle.pillClass]"
                        :value="toggle.count"></PillBadge>
                    <img class="catastrophe-icon" :src="toggle.iconPath">
                    <div class="catastrophe-name"><span>{{toggle.name}}</span></div>
                    <Checkbox :name="$t('toggle_checkbox_name_prefix') + toggle.name"
                        @change="e => toggle.onChange(e.target.checked)"
                        :checked="toggle.checked"></Checkbox>
                </div>
            </template>
        </section>
    </div>
</template>

<script lang="ts">

import { List, Set } from "immutable";
import { defineComponent, PropType } from 'vue';
import type { CatastropheFilter } from "@/models/catastrophes";
import { FILTER_ALL_CATASTROPHES, Catastrophe, CatastropheType } from "@/models/catastrophes";
import Checkbox from './Checkbox.vue';
import PillBadge from './PillBadge.vue';

// If new catastrophe types are added, this must be changed:
const TOGGLES = [
    {
        type: CatastropheType.Flood,
        iconPath: '/icons/flood.png',
        pillClass: 'catastrophe-flood',
    },
    {
        type: CatastropheType.ForestFire,
        iconPath: '/icons/forest_fire.png',
        pillClass: 'catastrophe-forest-fire',
    },
    {
        type: CatastropheType.ViolentStorm,
        iconPath: '/icons/violent_storm.png',
        pillClass: 'catastrophe-violent-storm',
    },
    {
        type: CatastropheType.Tornado,
        iconPath: '/icons/tornado.png',
        pillClass: 'catastrophe-tornado',
    },
    {
        type: CatastropheType.HeatWave,
        iconPath: '/icons/heat_wave.png',
        pillClass: 'catastrophe-heat-wave',
    },
    {
        type: CatastropheType.FreezingRain,
        iconPath: '/icons/freezing_rain.png',
        pillClass: 'catastrophe-freezing-rain',
    },
    {
        type: CatastropheType.StormWinds,
        iconPath: '/icons/storm_winds.png',
        pillClass: 'catastrophe-storm-winds',
    },
];

type OnChangeFn = (checked: Boolean) => void;

type Toggle = {
    count: number,
    iconPath: string,
    pillClass: string,
    name: string,
    checked: boolean,
    onChange: OnChangeFn,
}

export default defineComponent({
    emits: ['update:filter'],
    props: {
        filter: {
            type: Object as PropType<CatastropheFilter>,
            required: true,
        },
        allCatastrophes: {  // Note: *not* the type-filtered ones.
            type: Object as PropType<List<Catastrophe>>,
            required: true,
        },
        currentCatastrophesCount: {
            type: Number,
            required: true,
        },
    },
    components: {
        Checkbox,
        PillBadge
    },
    data() {
        return {
            expanded: false,
        };
    },
    computed: {
        catastropheToggles(): List<Toggle> {
            const allCatastrophes = {
                count: this.allCatastrophes.size,
                iconPath: '/icons/all-catastrophes.png',
                pillClass: 'catastrophe-all',
                name: this.$t('all_catastrophes'),
                checked: this.filter.equals(FILTER_ALL_CATASTROPHES),
                onChange: this.onFilterAllChange,
            };
            const counts = this.allCatastrophes.countBy(c => c.type);
            const toggles = TOGGLES.map(toggle => ({
                count: counts.get(toggle.type, 0),
                iconPath: toggle.iconPath,
                pillClass: toggle.pillClass,
                name: this.$t(`catastrophe_${toggle.type}`, 2),
                checked: this.filter.includes(toggle.type),
                onChange: (checked: boolean) => this.onFilterChange(checked, toggle.type),
            }));
            return List([allCatastrophes].concat(toggles));
        },
    },
    methods: {
        onFilterAllChange(enable: Boolean) {
            // When the 'All' option is checked, it either clears all filters or
            // enables them all.
            if (enable) {
                this.$emit('update:filter', FILTER_ALL_CATASTROPHES);
            } else {
                this.$emit('update:filter', Set());
            }
        },
        onFilterChange(enable: Boolean, type: CatastropheType) {
            if (enable) {
                this.$emit('update:filter', this.filter.add(type));
            } else {
                this.$emit('update:filter', this.filter.delete(type));
            }
        },
    },
})
</script>

<style scoped>
.row {
    min-height: var(--size-map-zoom-control);
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--sz-30);
}

.invisible {
    visibility: hidden;
}

.container {
    border-radius: var(--border-radius);
    border: 1px solid var(--color-border);
    background-color: var(--color-background);
    padding: 0 var(--sz-100);
    column-gap: var(--sz-30);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 2px;
    /* re-enable pointer-events, parent overlay disables them */
    pointer-events: auto;
    overflow-y: auto;
    max-height: 100%;
}

.total-count {
    background-color: var(--clr-alerte);
}

.title, .catastrophe-name {
    flex: 1;
    white-space: nowrap;
}

.separator {
    width: 100%;
    min-height: 1px;
    background-color: var(--clr-beige);
    border-radius: var(--border-radius);
}

button img {
    vertical-align: middle;
    width: var(--sz-700);
    height: var(--sz-700);
}

.pill {
    box-sizing: content-box;
    min-width: 3ch;
}

.catastrophe-icon {
    max-width: var(--sz-700);
    min-width: var(--sz-700);
}

.catastrophe-all {
    background-color: var(--clr-alerte);
}
.catastrophe-flood {
    background-color: var(--clr-flood);
}
.catastrophe-forest-fire {
    background-color: var(--clr-forest-fire);
}
.catastrophe-violent-storm {
    background-color: var(--clr-violent-storm);
}
.catastrophe-tornado {
    background-color: var(--clr-tornado);
}
.catastrophe-heat-wave {
    background-color: var(--clr-heat-wave);
}
.catastrophe-freezing-rain {
    background-color: var(--clr-freezing-rain);
}
.catastrophe-storm-winds {
    background-color: var(--clr-storm-winds);
}
</style>
