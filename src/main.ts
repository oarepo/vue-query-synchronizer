import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import QuerySynchronizer, {ParsedQuery} from '@oarepo/vue-query-synchronizer'
import {Router} from "vue-router";

createApp(App).use(router).use(QuerySynchronizer, {
    router,
    debug: true,
    navigationOperation: (query: ParsedQuery, router: Router) => {
        console.log('navigationOperation called, returning replace')
        return 'replace'
    }
}).mount('#app')
