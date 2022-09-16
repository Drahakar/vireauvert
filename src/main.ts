import { createPinia } from 'pinia';
import { createApp } from 'vue'
import App from './App.vue'

import './assets/main.css'
import "vue-select/dist/vue-select.css";
import { createI18n } from 'vue-i18n';
import frCA from '@/locales/fr-CA';
import { datetimeFormats, numberFormats } from './locales/formats';

const pinia = createPinia();

const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: 'fr-CA',
    messages: {
        'fr-CA': frCA
    },
    numberFormats: {
        'fr-CA': numberFormats
    },
    datetimeFormats: {
        'fr-CA': datetimeFormats
    }
});

const app = createApp(App);

app.use(pinia);
app.use(i18n);
app.mount('#app')

export function getAppContext() {
    return app._context;
}