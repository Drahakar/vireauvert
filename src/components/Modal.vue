<template>
    <div id="modal-container" :style="{ display: opened ? 'block' : 'none' }" @click="closeModal">
        <div id="modal-wrapper">
            <div id="modal" @click="ev => ev.stopPropagation()">
                <div id="modal-header">
                    <slot name="title"></slot>
                    <a id="close-button" @click="closeModal">
                        <span aria-hidden="true">&#x00d7;</span>
                    </a>
                </div>
                <div id="modal-content">
                    <slot name="content"></slot>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import { defineComponent, ref } from 'vue';

export default defineComponent({
    setup() {
        return {
            opened: ref(false)
        };
    },
    methods: {
        openModal() {
            this.opened = true;
        },
        closeModal() {
            this.opened = false;
        }
    }
})
</script>

<style scoped>
#modal-container {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 10000;
}

#modal-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
}

#modal {
    width: var(--modal-width);
    background-color: var(--clr-beige);
    overflow: hidden;
    border-radius: var(--border-radius);
    box-shadow: 0 3px var(--sz-30) rgba(0, 0, 0, 0.4);
    max-height: 90%;
    display: flex;
    flex-direction: column;
}

#close-button {
    position: absolute;
    top: calc((var(--sz-900) - var(--sz-700)) / 2);
    right: calc((var(--sz-900) - var(--sz-700)) / 2);
    cursor: pointer;
    width: var(--sz-700);
    height: var(--sz-700);
    border-radius: 50%;
    background-color: var(--clr-gris-pale);
    display: flex;
    justify-content: center;
    align-items: center;
}

#close-button span {
    display: block;
    color: var(--clr-blanc);
    font-size: var(--sz-600);
    line-height: var(--sz-600);
    width: var(--sz-600);
    height: var(--sz-600);
    text-align: center;
}

#close-button:hover span {
    color: var(--clr-gris-moyen);
}

#modal-header {
    padding: 2px var(--sz-30);
    background-color: var(--clr-blanc);
    height: var(--sz-900);
}

#modal-content {
    padding: var(--sz-600);
    overflow-y: auto;
    overflow-x: hidden;
}
</style>
