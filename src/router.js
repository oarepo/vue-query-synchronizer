import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from './Home.vue'
import { query } from '@oarepo/vue-query-synchronizer'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'home',
        props: query(
            [
                // simple form, string parameter
                'search',

                // object form
                { name: 'search2', debounce: 1000 },

                // number with the default value of 10
                'number:num:10',

                // checkbox (bool field) with a custom debounce of 1ms
                '1:bool:check',

                // array field, without debounce (the same as 0:array:option)
                ':array:option'
            ],
            {
                another: 'property passed directly to the component'
            },
            {
                onInit: (props) => {
                    console.log('onInit', props)
                    props.filter(x => x.name === 'search')[0].defaultValue =
                        window.localStorage.getItem('searchDefaultValue')
                    return props
                },
                onLoad: (params) => {
                    console.log('onLoad', params)
                    return params
                },
                onChange: (query) => {
                    window.localStorage.setItem('searchDefaultValue', query.search)
                    console.log('onChange', query)
                }
            }),
        component: Home
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router
