import Vue from 'vue'
import App from './App.vue'
import router from './router'
import QuerySupport from '@cis/query-support'

Vue.use(QuerySupport, {
    router: router
})

Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')
