import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from './Home.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'home',
        meta: {
            query: {
                num: 'int:10',
                check: 'bool:',
                option: 'array:',
                search: 'string:',
                option2: 'commaarray:',
                option3: 'spacearray:',
                unusedOption: 'string:test'
            },
            querySettings: {
                onInit: (props) => {
                    console.log('onInit', props)
                    props['search'].defaultValue =
                        window.localStorage.getItem('searchDefaultValue')
                    return props
                },
                onLoad: (params) => {
                    console.log('onLoad', params)
                    return params
                },
                onChange: (query, queryValues) => {
                    window.localStorage.setItem('searchDefaultValue', queryValues.search || '')
                    console.log('onChange', query, queryValues)
                }
            }
        },
        component: Home
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router
