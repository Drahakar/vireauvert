<template>
    <Modal ref="modal">
        <template v-slot:title>
            <div id="header" v-t="'about'"></div>
        </template>
        <template v-slot:content>
            <div id="content">
                <a href="https://equiterre.org/" target="_blank">
                    <img class="logo" src="/Logo_EQT_About.png" alt="Équiterre"></a>
                <div class="lighter">✕</div>
                <a href="https://www.bleuetdesign.com/" target="_blank">
                    <img class="logo" src="/Logo_Bleuet_About.png" alt="bleut.design">
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
        </template>
    </Modal>
</template>

<script lang="ts">

import { defineComponent, ref } from 'vue';
import Modal from './Modal.vue';

export default defineComponent({
    components: { Modal },
    setup() {
        return {
            modal: ref<InstanceType<typeof Modal> | null>(null)
        };
    },
    data() {
        return {
            sources: [
                "https://www.donneesquebec.ca/recherche/dataset/evenements-de-securite-civile",
                "https://www.donneesquebec.ca/recherche/dataset/observations-terrain-historiques-devenements-archives",
                "https://www.donneesquebec.ca/recherche/dataset/feux-de-foret",
                "https://changements-climatiques.canada.ca/donnees-climatiques/",
                // TODO: Ouranos stuff
            ]
        };
    },
    methods: {
        open() {
            if (this.modal) {
                this.modal.openModal();
            }
        }
    }
})
</script>

<style scoped>
img {
    display: block;
}

#header {
    display: flex;
    align-items: center;
    height: 100%;
    font-size: var(--sz-600);
}

#header .logo {
    object-fit: contain;
    max-width: 100%;
    max-height: 100%;
}

.progs {
    display: flex;
    flex-direction: column;
    gap: var(--sz-30);
    margin-top: var(--sz-700);
    margin-bottom: var(--sz-700);
    font-size: var(--sz-600);
}

#content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

#content .logo {
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
