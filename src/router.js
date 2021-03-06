import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from './Home.vue'
import Issue_2 from '@/Issue_2'

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
    },
    {
        path: '/2',
        name: 'issue_2',
        component: Issue_2,
        meta: {
            query: {
                query: 'string:',
                page: 'int:1',
                sort: 'string:',
                verified: 'bool:false',
                location: 'string:'
            }
        }
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router
