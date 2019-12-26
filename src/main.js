import Vue from 'vue'
import App from './App.vue'
import router from './router'
import QuerySupport from '@oarepo/vue-query-synchronizer'

Vue.use(QuerySupport, {
    router: router,
    debug: true,
    passUnknownProperties: true
})

Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')
