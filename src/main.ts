import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import QuerySynchronizer from '@oarepo/vue-query-synchronizer'

createApp(App).use(router).use(QuerySynchronizer, { router, debug: true }).mount('#app')
