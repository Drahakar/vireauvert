import { createPinia } from 'pinia';
import { createApp } from 'vue'
import App from './App.vue'
import VueTour from 'v3-tour';

import './assets/main.css'
import "vue-select/dist/vue-select.css";
import 'v3-tour/dist/vue-tour.css';
import { createI18n } from 'vue-i18n';
import frCA from '@/locales/fr-CA';
import { datetimeFormats, numberFormats } from './locales/formats';

const pinia = createPinia();

const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    warnHtmlMessage: false,  // used tutorial per-word styling
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
app.use(VueTour);
app.mount('#app')

export function getAppContext() {
    return app._context;
}
