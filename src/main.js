import Vue from 'vue'
import App from './App.vue'
import router from './router'
import QuerySupport from '@cis/query-support'

Vue.config.productionTip = false

Vue.use(QuerySupport)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
