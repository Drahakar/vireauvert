<template>
    <Modal ref="modal">
        <template v-slot:title>
            <div id="header" v-t="'share'"></div>
        </template>
        <template v-slot:content>
            <div id="content">
                <a target="_blank" :href="`https://www.facebook.com/sharer/sharer.php?u=${encodeURI(url)}&amp;src=sdkpreparse`" :data-href="url">Facebook</a>
                <a target="_blank" href="https://twitter.com/share" :data-url="url" data-dnt="true">Twitter</a>
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
}

#content {
    display: flex;
    align-items: center;
    text-align: center;
}

</style>
