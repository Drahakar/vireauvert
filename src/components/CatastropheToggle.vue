<template>
    <div class="wrapper" :class="{expanded: expanded}" @click="expanded = true">
        <section class="container">
            <!-- Header row -->
            <PillBadge class="total-count pill" :value="currentCatastrophesCount"></PillBadge>
            <div class="title grid-col-span-2"><span>Événements extrêmes</span></div>
            <!-- TODO: hover styling -->
            <button v-if="expanded" @click.stop="expanded = false"><img src="/icons/x.svg"></button>
            <button v-else><img src="/icons/settings.svg"></button>

            <template v-if="expanded" v-for="(toggle, index) in catastropheToggles">
                <div v-if="index > 0" class="separator grid-col-span-row"></div>
                <PillBadge class="pill"
                    :class="[{invisible: toggle.count == 0}, toggle.pillClass]"
                    :value="toggle.count"></PillBadge>
                <img class="catastrophe-icon" :src="toggle.iconPath">
                <div class="catastrophe-name"><span>{{toggle.name}}</span></div>
                <Checkbox :name="$t('toggle_checkbox_name_prefix') + toggle.name"
                    @change="e => toggle.onChange(e.target.checked)"
                    :checked="toggle.checked"></Checkbox>
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
        iconPath: '/icons/flood_w.png',
        pillClass: 'catastrophe-flood',
    },
    {
        type: CatastropheType.ForestFire,
        iconPath: '/icons/forest_fire_w.png',
        pillClass: 'catastrophe-forest-fire',
    },
    {
        type: CatastropheType.ViolentStorm,
        iconPath: '/icons/violent_storm_w.png',
        pillClass: 'catastrophe-violent-storm',
    },
    {
        type: CatastropheType.Tornado,
        iconPath: '/icons/tornado_w.png',
        pillClass: 'catastrophe-tornado',
    },
    {
        type: CatastropheType.HeatWave,
        iconPath: '/icons/heat_wave_w.png',
        pillClass: 'catastrophe-heat-wave',
    },
    {
        type: CatastropheType.FreezingRain,
        iconPath: '/icons/freezing_rain_w.png',
        pillClass: 'catastrophe-freezing-rain',
    },
    {
        type: CatastropheType.StormWinds,
        iconPath: '/icons/storm_winds_w.png',
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
                iconPath: '/icons/attention.png',
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
.grid-col-span-2 {
    grid-column: span 2;
}

.grid-col-span-row {
    grid-column: 1 / -1;
}

.invisible {
    visibility: hidden;
}

.wrapper {
    --expand-transition: 0.5s ease;
    transition: padding-left var(--expand-transition);
    transition: width var(--expand-transition);
}

.expanded.wrapper {
    flex: 1;
}

.container {
    border-radius: var(--sz-400);
    border: 1px solid var(--color-border);
    background-color: var(--color-background);
    transition: height var(--expand-transition);
    display: grid;
    padding: 0 var(--sz-100);
    column-gap: var(--sz-30);
    row-gap: 2px;
    /* columns: count icon name checkbox */
    grid-template-columns: auto auto 1fr auto;
    align-items: center;
    justify-items: center;
    /* re-enable pointer-events, parent overlay disables them */
    pointer-events: auto;
    overflow-y: auto;
    max-height: 100%;
}

@media (prefers-reduced-motion: reduce) {
    .wrapper, .container {
        transition: none;
    }
}

.total-count {
    background-color: var(--clr-alerte);
}

.title, .catastrophe-name {
    width: 100%;
    letter-spacing: -0.3px;
    min-height: var(--size-map-zoom-control);
    display: grid;
    align-items: center;
}

.separator {
    width: 100%;
    height: 1px;
    background-color: var(--clr-beige);
    border-radius: var(--sz-600);
}

button img {
    vertical-align: middle;
    width: var(--sz-700);
    height: var(--sz-700);
}

.pill {
    min-width: 34px;
}

.catastrophe-icon {
    width: var(--sz-700);
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
