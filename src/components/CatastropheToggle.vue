<template>
    <div class="wrapper" :class="{expanded: expanded}">
        <section class="container">
            <header class="row" @click="expanded = !expanded">
                <PillBadge class="total-count pill"
                    :value="showValue(currentCatastrophesCount)"
                    data-tutorial-step="catastrophes-count"></PillBadge>
                <img class="catastrophe-icon" src="/icons/attention-highlight.png">
                <div class="title"><span>Événements extrêmes</span></div>
                <button v-if="expanded"><img src="/icons/x.svg"></button>
                <button v-else><img src="/icons/settings.svg"></button>
            </header>

            <template v-if="expanded" v-for="(toggle, index) in catastropheToggles">
                <div v-if="index > 0" class="separator"></div>
                <div class="row" :class="toggle.class">
                    <PillBadge class="pill"
                        :class="{invisible: toggle.count == 0}"
                        :value="showValue(toggle.count)"></PillBadge>
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
        class: 'catastrophe-flood',
    },
    {
        type: CatastropheType.ForestFire,
        iconPath: '/icons/forest_fire.png',
        class: 'catastrophe-forest-fire',
    },
    {
        type: CatastropheType.ViolentStorm,
        iconPath: '/icons/violent_storm.png',
        class: 'catastrophe-violent-storm',
    },
    {
        type: CatastropheType.Tornado,
        iconPath: '/icons/tornado.png',
        class: 'catastrophe-tornado',
    },
    {
        type: CatastropheType.HeatWave,
        iconPath: '/icons/heat_wave.png',
        class: 'catastrophe-heat-wave',
    },
    {
        type: CatastropheType.FreezingRain,
        iconPath: '/icons/freezing_rain.png',
        class: 'catastrophe-freezing-rain',
    },
    {
        type: CatastropheType.StormWinds,
        iconPath: '/icons/storm_winds.png',
        class: 'catastrophe-storm-winds',
    },
];

type OnChangeFn = (checked: Boolean) => void;

type Toggle = {
    count: number,
    iconPath: string,
    class: string,
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
        futureYear: {
            type: Boolean,
            default: false,
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
                class: 'catastrophe-all',
                name: this.$t('all_catastrophes'),
                checked: this.filter.equals(FILTER_ALL_CATASTROPHES),
                onChange: this.onFilterAllChange,
            };
            const counts = this.allCatastrophes.countBy(c => c.type);
            const toggles = TOGGLES.map(toggle => ({
                count: counts.get(toggle.type, 0),
                iconPath: toggle.iconPath,
                class: toggle.class,
                name: this.$t(`catastrophe_${toggle.type}`, 2),
                checked: this.filter.includes(toggle.type),
                onChange: (checked: boolean) => this.onFilterChange(checked, toggle.type),
            }));
            return List([allCatastrophes].concat(toggles));
        },
    },
    methods: {
        showValue(value: number): string {
            return this.futureYear ? '?' : value.toString();
        },
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

header {
    cursor: pointer;
}

header:hover {
    opacity: 0.8;
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
    background-color: var(--color-background);
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
    width: var(--sz-700);
    height: var(--sz-700);
}

.catastrophe-all .catastrophe-icon {
    width: auto;

}

.catastrophe-all .pill {
    background-color: var(--clr-alerte);
}
.catastrophe-flood .pill {
    background-color: var(--clr-flood);
}
.catastrophe-forest-fire .pill {
    background-color: var(--clr-forest-fire);
}
.catastrophe-violent-storm .pill {
    background-color: var(--clr-violent-storm);
}
.catastrophe-tornado .pill {
    background-color: var(--clr-tornado);
}
.catastrophe-heat-wave .pill {
    background-color: var(--clr-heat-wave);
}
.catastrophe-freezing-rain .pill {
    background-color: var(--clr-freezing-rain);
}
.catastrophe-storm-winds .pill {
    background-color: var(--clr-storm-winds);
}
</style>
