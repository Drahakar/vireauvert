<template>
    <div id="modal-container" :style="{ display: opened ? 'block' : 'none' }" @click="closeModal">
        <div id="modal-wrapper">
            <div id="modal" @click="ev => ev.stopPropagation()">
                <div id="modal-header">
                    <slot name="title"></slot>
                    <a id="close-button" role="button" @click="closeModal">
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
    background-color: var(--color-background);
    overflow: hidden;
    border-radius: var(--border-radius);
    box-shadow: 0 3px var(--sz-30) rgba(0, 0, 0, 0.4);
    max-height: 90%;
    display: flex;
    flex-direction: column;
}

#close-button {
    position: absolute;
    top: calc(var(--border-radius) / 4);
    right: calc(var(--border-radius) / 4);
    cursor: pointer;
    width: var(--sz-700);
    height: var(--sz-700);
    border-radius: 50%;
    background-color: var(--clr-gris-tres-pale);
    background-image: url('/Button/Close.svg');
    background-size: cover;
    background-position: center;
}

#close-button:hover {
    opacity: 0.8;
}

#close-button span {
    display: none
}

#modal-header {
    padding: 0 var(--sz-100);
    background-color: var(--color-background-accent);
    height: var(--sz-900);
}

#modal-content {
    padding: var(--sz-600);
    overflow-y: auto;
    overflow-x: hidden;
}
</style>
