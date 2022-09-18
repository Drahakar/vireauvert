<template>
    <div id="modal-container" :style="{ display: showModal ? 'block' : 'none' }" @click="closeModal">
        <div id="modal-wrapper">
            <div id="modal" @click="ev => ev.stopPropagation()">
                <div id="modal-header">
                    <img src="/Logo_terreOS_About.png" alt="terreOS">
                    <div id="close-button-wrapper">
                        <a id="close-button" @click="closeModal">
                            <img src="/Button/Close.png" alt="✕">
                        </a>
                    </div>
                </div>
                <div id="modal-content">
                    <a href="https://equiterre.org/" target="_blank">
                        <img src="/Logo_EQT_About.png" alt="Équiterre"></a>
                    <div class="lighter">✕</div>
                    <a href="https://www.bleuetdesign.com/" target="_blank">
                        <img src="/Logo_Bleuet_About.png" alt="bleut.design">
                    </a>
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
                    <div id="detailed-data">
                        <div v-t="'detailed_sources'"></div>
                        <ul>
                            <li v-for="source of sources"><a :href="source" target="_blank">{{ source }}</a></li>
                        </ul>
                    </div>
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
    data() {
        return {
            sources: [
                'https://www.donneesquebec.ca/recherche/dataset/evenements-de-securite-civile',
                'https://www.donneesquebec.ca/recherche/dataset/observations-terrain-historiques-devenements-archives',
                'https://www.donneesquebec.ca/recherche/dataset/feux-de-foret',
                'https://changements-climatiques.canada.ca/donnees-climatiques/',
                // TODO: Ouranos stuff
            ]
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
img {
    display: block;
}

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
    cursor: pointer;
}

#modal-header {
    padding: var(--sz-30);
    background-color: var(--clr-blanc);
    display: flex;
    justify-content: center;
}

#modal-header img {
    max-height: var(--sz-900);
}

#modal-content {
    padding: var(--sz-600);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    overflow-y: auto;
    overflow-x: hidden;
}

#modal-content img {
    max-height: var(--sz-900);
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

#detailed-data {
    font-size: var(--sz-200);
    color: var(--clr-gris-moyen);
    width: 100%;
}

#detailed-data ul {
    padding: 0;
    font-size: var(--sz-100);
    padding: var(--sz-600);
    padding-top: 0;
}

#detailed-data li {
    list-style: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
