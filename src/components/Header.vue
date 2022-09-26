<template>
    <header>
        <button @click="about" class="bleuet-equitable">
            <img src="/Logo_EQT-Bleuet_Map.png" alt="Éqt*x(*)">
        </button>
        <a @click="about">Sources</a>
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
    align-items: center;
    justify-content: space-between;
    height: 100%;
}

button {
    pointer-events: auto;
    display: block;
    height: 100%;
}

button:hover {
    transform: scale(1.2);
}

img {
    object-fit: contain;
    max-width: 100%;
    max-height: 100%;
}


a {
    font-size: var(--sz-300);
    color: var(--clr-blanc);
    text-shadow: 0px 0px 3px var(--clr-gris-moyen);
    text-decoration-line: underline;
    pointer-events: auto;
    cursor: pointer;
    margin-right: 4px;
}

a:hover {
    color: var(--clr-gris-tres-pale);
}
</style>
