<template>
    <div id="modal-container" :style="{ display: showModal ? 'block' : 'none' }" @click="closeModal">
        <div id="modal-wrapper">
            <div id="modal" @click="ev => ev.stopPropagation()">
                <div id="modal-header">
                    <h1>terreOS</h1>
                    <div id="close-button-wrapper">
                        <button id="close-button" @click="closeModal">✕</button>
                    </div>
                </div>
                <div id="modal-content">
                    <h1>Équiterre</h1>
                    <div class="lighter">✕</div>
                    <h1>bleuet.design</h1>
                    <div class="progs">
                        <div><a href="https://twitter.com/Drahakar" target="_blank">Andy Emond</a></div>
                        <div><a href="https://twitter.com/edemartel" target="_blank">Etienne de Martel</a></div>
                        <div><a href="https://twitter.com/JesseEmond" target="_blank">Jesse Emond</a></div>
                    </div>
                    <div v-t="'made_with_love'" class="desc"></div>
                    <i18n-t keypath="data_source" tag="div" class="desc">
                        <a v-t="'ouranos'" :href="$t('url_ouranos')" target="_blank"></a>
                        <a v-t="'qc_govt'" :href="$t('url_qc_govt')" target="_blank"></a>
                        <a v-t="'can_govt'" :href="$t('url_can_govt')" target="_blank"></a>
                    </i18n-t>
                    <div id="version-info">
                        <div>2022</div>
                        <div>v1.0</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export default defineComponent({
    emits: ['modal-closed'],
    props: {
        showModal: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        closeModal() {
            this.$emit('modal-closed');
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
    width: 50%;
    background-color: var(--clr-beige);
    overflow: hidden;
    border-radius: var(--border-radius);
    box-shadow: 0 3px var(--sz-30) rgba(0, 0, 0, 0.4);
}

.progs {
    display: flex;
    flex-direction: column;
    gap: var(--sz-30);
    margin-top: var(--sz-700);
    margin-bottom: var(--sz-700);
    font-size: var(--sz-600);
}

#close-button-wrapper {
    position: absolute;
    top: 0;
    right: var(--sz-30);
    height: 100%;
    display: flex;
    align-items: center;
}

#close-button {
    background-color: var(--clr-orange);
    color: var(--clr-blanc);
    width: var(--sz-700);
    height: var(--sz-700);
    border-radius: calc(var(--sz-700) / 2);
    font-weight: bold;
    font-size: var(--sz-300);
    text-align: center;
}

#modal-header {
    padding: var(--sz-30);
    background-color: var(--clr-blanc);
}

#modal-header h1 {
    text-align: center;    
}

#modal-content {
    padding: var(--sz-600);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.lighter {
    color: var(--clr-gris-pale);
    font-size: var(--sz-300);
    font-weight: bold;
    margin-top: var(--sz-50);
    margin-bottom: var(--sz-50);
}

.desc {
    margin-bottom: var(--sz-600);
}

#version-info {
    width: 100%;
    display: flex;
    justify-content: space-between;
    color: var(--clr-gris-pale);
}
</style>
