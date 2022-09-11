<template>
    <!-- TODO: use real data -->
    <div class="wrapper" :class="{expanded: expanded}">
        <section class="container">
            <!-- Header row -->
            <!-- TODO: dynamic total count -->
            <PillBadge class="total-count pill" :value="213"></PillBadge>
            <!-- TODO: dynamic truncation of text -->
            <div class="title grid-col-span-2"><span>Év. extrêmes</span></div>
            <!-- TODO: hover styling -->
            <button v-if="expanded" @click="expanded = false"><img src="/icons/x.svg"></button>
            <button v-else @click="expanded = true"><img src="/icons/settings.svg"></button>

            <template v-if="expanded" v-for="(toggle, index) in catastropheToggles">
                <div v-if="index > 0" class="separator grid-col-span-row"></div>
                <PillBadge class="pill"
                    :class="[{invisible: toggle.count == 0}, toggle.pillClass]"
                    :value="toggle.count"></PillBadge>
                <img class="catastrophe-icon" :src="toggle.iconPath">
                <div class="catastrophe-name"><span>{{toggle.name}}</span></div>
                <Checkbox :name="$t('toggle_checkbox_name_prefix') + toggle.name"
                    :checked="toggle.checked"></Checkbox>
            </template>
        </section>
    </div>
</template>

<script lang="ts">

import { defineComponent } from 'vue';
import Checkbox from './Checkbox.vue';
import PillBadge from './PillBadge.vue';

export default defineComponent({
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
        catastropheToggles() {
            // TODO: this should be done based on a prop.
            // TODO: put reminder to update this in model enum
            return [
                // TODO: keep track of checked state internally
                // TODO: use localized names
                {count: 213, iconPath: '/icons/attention.png',
                 pillClass: 'catastrophe-all', name: 'Tous', checked: true},
                {count: 37, iconPath: '/icons/flood_w.png',
                 pillClass: 'catastrophe-flood', name: 'Innondations',
                 checked: true},
                {count: 24, iconPath: '/icons/forest_fire_w.png',
                 pillClass: 'catastrophe-forest-fire', name: 'Feux de forêt',
                 checked: false},
                {count: 0, iconPath: '/icons/violent_storm_w.png',
                 pillClass: 'catastrophe-violent-storm', name: 'Orages violents',
                 checked: true},
                {count: 8, iconPath: '/icons/tornado_w.png',
                 pillClass: 'catastrophe-tornado', name: 'Tornades',
                 checked: true},
                {count: 144, iconPath: '/icons/heat_wave_w.png',
                 pillClass: 'catastrophe-heat-wave', name: 'Vagues de chaleur',
                 checked: true},
            ]
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
    padding-left: calc(var(--sz-100) + var(--size-map-zoom-control));
    transition: padding-left var(--expand-transition);
    transition: width var(--expand-transition);
    height: 100%;
}

.expanded.wrapper {
    padding-left: 0;
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
    overflow-y: scroll;
}

.expanded .container {
    height: 100%;
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
</style>
