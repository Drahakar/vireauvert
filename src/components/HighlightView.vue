<template>
    <div id="header">
        <div class="icon" :class="[`catastrophe-icon-${highlight.type.toLowerCase()}`]"></div>
        <div class="title">{{ title }}</div>
    </div>
    <div id="body-content" v-html="body"></div>
</template>

<script lang="ts">
import { CatastropheType } from '@/models/catastrophes';
import { Highlight } from '@/models/highlights';
import { defineComponent, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { marked, Renderer } from 'marked';

const DUMMY_HIGHLIGHT: Highlight = {
    id: '',
    year: 0,
    type: CatastropheType.Unknown,
    location: { lat: 0, lng: 0 },
    title: {},
    body: {},
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
    setup() {
        const i18n = useI18n();
        return { i18n };
    },
    computed: {
        title() {
            return this.highlight.title[this.i18n.locale.value] ?? '';
        },
        body() {
            const body = this.highlight.body[this.i18n.locale.value];
            if (body) {
                return marked(body, { breaks: true, renderer });
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
    height: var(--sz-900);
    padding-right: var(--sz-50);
    display: flex;
    align-items: center;
    gap: var(--sz-30);
}

.icon {
    display: block;
    object-fit: contain;
    min-width: var(--sz-800);
    min-height: var(--sz-800);
    background-size: var(--sz-800) var(--sz-800);
    margin: 4px;
}

#body-content {
    padding-bottom: var(--sz-30);
    padding-left: var(--sz-50);
    padding-right: var(--sz-50);

    font-size: var(--sz-100);
    line-height: 1.5em;
}

#body-content ::v-deep p {
    margin: 0;
    margin-top: var(--sz-30);
}

#body-content ::v-deep a {
    color: var(--clr-orange);
}

#body-content ::v-deep a:hover {
    color: var(--clr-gris-pale);
}
</style>
