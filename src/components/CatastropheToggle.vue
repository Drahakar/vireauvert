<template>
    <!-- TODO: use real data -->
    <!-- TODO: implement filtering pop-up -->
    <section class="wrapper">
        <header>
            <div>
                <!-- TODO: dynamic total count -->
                <PillBadge class="total-count" :value="213"></PillBadge>
                <!-- TODO: dynamic truncation -->
                <span class="title">Év. extrêmes</span>
            </div>
            <!-- TODO: make interactive -->
            <!-- TODO: hover styling -->
            <button><img src="/icons/settings.svg"></button>
        </header>
    </section>
</template>

<script lang="ts">

import { defineComponent } from 'vue';
import PillBadge from './PillBadge.vue';

export default defineComponent({
    components: { PillBadge },
})
</script>

<style scoped>
.wrapper {
    padding-left: calc(var(--sz-100) + var(--size-map-zoom-control));
}

header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: var(--sz-100);
    border-radius: var(--sz-400);
    border: 1px solid var(--color-border);
    background-color: var(--color-background);
    width: 100%;
    height: var(--size-map-zoom-control);
    /* re-enable pointer-events, parent overlay disables them */
    pointer-events: auto;
}

.total-count {
    background-color: var(--clr-alerte);
}

.title {
    margin-left: var(--sz-50);
}

button img {
    vertical-align: middle;
}
</style>
