<template>
    <div id="header">
        <div class="icon" :class="[`catastrophe-icon-${highlight.type.toLowerCase()}`]"></div>
        <div class="title">{{ highlight.title ? highlight.title : $t(`catastrophe_${highlight.type}`) }}</div>
    </div>
    <div id="body-content" v-html="body"></div>
</template>

<script lang="ts">
import { CatastropheType } from '@/models/catastrophes';
import { Highlight } from '@/models/highlights';
import { defineComponent, h, PropType } from 'vue';
import { marked, Renderer } from 'marked';

const DUMMY_HIGHLIGHT: Highlight = {
    id: '',
    year: 0,
    locale: 'fr-CA',
    type: CatastropheType.Unknown,
    location: { lat: 0, lng: 0 },
    title: '',
    body: '',
};

const renderer = new Renderer();
renderer.link = function (href: string | null, title: string | null, text: string) {
    const link = marked.Renderer.prototype.link.apply(this, [href, title, text]);
    return link.replace('<a', '<a target="_blank"');
}

export default defineComponent({
    props: {
        highlight: {
            type: Object as PropType<Highlight>,
            default: DUMMY_HIGHLIGHT
        }
    },
    computed: {
        body() {
            if (this.highlight.body) {
                return marked(this.highlight.body, { breaks: true, renderer });
            }
            return '';
        }
    }
});
</script>
<style scoped>
#header {
    font-size: var(--sz-400);
    background-color: var(--clr-blanc);
    border-radius: var(--popup-border-radius);
    height: var(--sz-900);
    padding-right: var(--sz-50);
    display: flex;
    align-items: center;
}

.title {
    margin-left: calc(var(--sz-30) / -2);
}

.icon {
    position: relative;
    display: block;
    object-fit: contain;
    width: calc(var(--sz-900) + var(--sz-50));
    height: calc(var(--sz-900) + var(--sz-50));
    background-size: calc(var(--sz-900) + var(--sz-50));
    border-radius: 50%;
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-position: center;
    left: calc(var(--sz-30) * -1);
}

#body-content {
    padding-bottom: var(--sz-30);
    padding-left: var(--sz-50);
    padding-right: var(--sz-50);

    font-size: var(--sz-100);
    line-height: 1.5em;
    letter-spacing: 0;
}

#body-content :deep(p) {
    margin: 0;
    margin-top: var(--sz-30);
}

#body-content :deep(a) {
    color: var(--clr-orange);
}

#body-content :deep(a:hover) {
    color: var(--clr-gris-pale);
}
</style>
