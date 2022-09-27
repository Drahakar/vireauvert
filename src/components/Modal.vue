<template>
    <div id="modal-container" :style="{ display: opened ? 'block' : 'none' }" @click="closeModal">
        <div id="modal-wrapper">
            <div id="modal" @click="ev => ev.stopPropagation()">
                <div id="modal-header">
                    <slot name="title"></slot>
                    <a id="close-button" role="button" @click="closeModal" :aria-label="$t('close')">
                        <img src="/Button/Close.svg" :alt="$t('close')">
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
    max-width: 75%;
    background-color: var(--color-background);
    overflow: hidden;
    border-radius: var(--border-radius);
    box-shadow: 0 3px var(--sz-30) rgba(0, 0, 0, 0.4);
    max-height: 90%;
    display: flex;
    flex-direction: column;
}

@media only screen and (min-width: 600px) {
    #modal {
        max-width: 50%;
    }
}

#close-button {
    cursor: pointer;
    border-radius: 50%;
    background-color: var(--clr-gris-tres-pale);
    width: calc(var(--sz-900) - (var(--border-radius) / 2));
    height:  calc(var(--sz-900) - (var(--border-radius) / 2));
}

#close-button img {
    object-fit: cover;
    width: 100%;
    height: 100%;
}

#close-button:hover {
    opacity: 0.8;
}

#modal-header {
    padding: calc(var(--border-radius) / 4) calc(var(--border-radius) / 4) calc(var(--border-radius) / 4) var(--sz-200);
    background-color: var(--color-background-accent);
    height: var(--sz-900);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

#modal-content {
    padding: var(--sz-600);
    overflow-y: auto;
    overflow-x: hidden;
}
</style>
