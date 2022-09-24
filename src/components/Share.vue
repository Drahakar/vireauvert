<template>
    <Modal ref="modal">
        <template v-slot:title>
            <div id="header" v-t="'share'"></div>
        </template>
        <template v-slot:content>
            <div id="content">
                <a target="_blank"
                    :href="`https://www.facebook.com/sharer/sharer.php?u=${encodeURI(url)}&amp;src=sdkpreparse`"
                    :data-href="url">
                    <img src="/Button/Facebook.png">
                    Facebook
                </a>
                <a target="_blank" href="https://twitter.com/share" :data-url="url" data-dnt="true">
                    <img src="/Button/Twitter.png">
                    Twitter
                </a>
                <a target="_blank" :href="`mailto:?subject=terreOS&amp;body=${encodeURI(url)}}`">
                    <img src="/Button/Courriel.png">
                    {{$t('email')}}
                </a>
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
    computed: {
        url() {
            return window.location.href;
        }
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
#header {
    display: flex;
    align-items: center;
    height: 100%;
    font-size: var(--sz-600);
}

#content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--sz-700);
    padding: var(--sz-600) 0;
}

#content a {
    display: flex;
    flex-direction: column;
    text-decoration: none;
    text-align: center;
    gap: var(--sz-50);
}

#content a:hover {
    transform: scale(1.2);
}

#content a img {
    width: calc(var(--sz-900) * 2);
    height: calc(var(--sz-900) * 2);
    object-fit: cover;
    align-self: center;
}
</style>
