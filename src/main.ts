import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
import VueApexCharts from 'vue3-apexcharts';
import { useAuthStore } from './stores/auth';

// import fonts
import '@/assets/fonts/THSarabunNew-normal.js'
import '@/assets/fonts/THSarabunNew-Bold-normal.js'

const app = createApp(App)
const vuetify = createVuetify({
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
          mdi,
        }
      },
  components,
  directives,
})
app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(VueApexCharts)
app.mount('#app')