import { createPinia } from 'pinia';
import { createApp } from 'vue'
import App from './App.vue'

import './assets/main.css'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import "vue-select/dist/vue-select.css";

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.mount('#app')
