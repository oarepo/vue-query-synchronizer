import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import { queryProp } from '@cis/query-support'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    props: queryProp(['search', 'search2'], { another: 'another property' }),
    component: Home
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
