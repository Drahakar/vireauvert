<template>
    <Modal ref="modal">
        <template v-slot:title>
            <div id="header" v-t="'about'"></div>
        </template>
        <template v-slot:content>
            <div id="content">
                <div class="first-section">
                    <a href="https://equiterre.org/" target="_blank">
                        <img class="logo" src="/Logo_EQT_About.png" alt="Équiterre"></a>
                    <div >✕</div>
                    <a href="https://www.bleuetdesign.com/" target="_blank">
                        <img class="logo" src="/Logo_Bleuet_About.png" alt="bleut.design">
                    </a>
                </div>
                <div v-t="'about_welcome'"></div>
                <div v-t="'about_description'"></div>
                <i18n-t keypath="about_tutorial" tag="div" class="help">
                    <button @click="resetTutorial" v-t="'tutorial_restart'">
                    </button>
                </i18n-t>
                <i18n-t keypath="made_with_love" tag="div" class="desc">
                    <a href="https://equiterre.org/" target="_blank">Équiterre</a>
                    <a href="https://www.bleuetdesign.com/" target="_blank">Bleuet Design</a>
                    <a href="https://twitter.com/Drahakar" target="_blank">Andy Emond</a>
                    <a href="https://twitter.com/edemartel" target="_blank">Etienne de Martel</a>
                    <a href="https://twitter.com/JesseEmond" target="_blank">Jesse Emond</a>
                </i18n-t>
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
        </template>
    </Modal>
</template>

<script lang="ts">

import { defineComponent, ref } from 'vue';
import Modal from './Modal.vue';

export default defineComponent({
    emits: ['tutorialReset'],
    components: { Modal },
    setup() {
        return {
            modal: ref<InstanceType<typeof Modal> | null>(null)
        };
    },
    data() {
        return {
            sources: [
                "https://portclim.ouranos.ca/",
                "https://www.donneesquebec.ca/recherche/dataset/evenements-de-securite-civile",
                "https://www.donneesquebec.ca/recherche/dataset/observations-terrain-historiques-devenements-archives",
                "https://www.donneesquebec.ca/recherche/dataset/feux-de-foret",
                "https://changements-climatiques.canada.ca/donnees-climatiques/",
            ]
        };
    },
    methods: {
        open() {
            this.modal?.openModal();
        },
        resetTutorial() {
            this.modal?.closeModal();
            this.$emit('tutorialReset');
        }
    }
})
</script>

<style scoped>
button {
    color: var(--clr-blanc);
    background-color: var(--color-accent);
    border-radius: var(--border-radius);
    padding: var(--sz-30) var(--sz-100);
}

#header {
    display: flex;
    align-items: center;
    height: 100%;
    font-size: var(--sz-600);
}

.logo {
    object-fit: contain;
    max-width: 100%;
}

#content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--sz-600);
}

.first-section {
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--clr-gris-pale);
    font-size: var(--sz-300);
    font-weight: bold;
    gap: var(--sz-600);
    max-width: 80%;
}


.help {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--sz-30);
}

.desc {
    color: var(--clr-gris-moyen);
}

.desc a {
    white-space: nowrap;
}

#version-info {
    width: 100%;
    display: flex;
    justify-content: space-between;
    color: var(--clr-gris-pale);
}

#detailed-data {
    font-size: var(--sz-400);
    color: var(--clr-gris-moyen);
    width: 100%;
}

#detailed-data ul {
    padding: 0;
    font-size: var(--sz-300);
    line-height: var(--sz-400);
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
