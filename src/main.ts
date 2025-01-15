import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import 'vuetify/styles'
import 'material-design-icons-iconfont/dist/material-design-icons.css' // Ensure your project is capable of handling css files
import { createVuetify } from 'vuetify'
import { aliases, md } from 'vuetify/iconsets/md'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { VFileUpload } from 'vuetify/labs/VFileUpload'

const vuetify = createVuetify({
  components: {
    VFileUpload,
    ...components,
  },
  directives,
  icons: {
    defaultSet: 'md',
    aliases,
    sets: {
      md
    },
  },
})

createApp(App).use(vuetify).mount('#app')