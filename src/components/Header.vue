<template>
    <header>
        <button @click="about" class="bleuet-equitable">
            <img src="/Logo_EQT-Bleuet_Map.png" alt="Éqt*x(*)">
        </button>
        <button @click="about" class="terreos">
            <img src="/Logo_terreOS_Map.png" alt="terreOS">
        </button>
    </header>
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export default defineComponent({
    emits: ['about-requested'],
    methods: {
        about() {
            this.$emit('about-requested');
        }
    }
});
</script>

<style scoped>
header {
    display: flex;
    flex-direction: row;
}

button {
    pointer-events: auto;
}

img {
    object-fit: contain;
    max-width: 100%;
    max-height: 100%;
}
.terreos{
    flex-grow: 1;
}
</style>
