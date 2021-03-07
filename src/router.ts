import {createRouter, createWebHistory, LocationQuery} from 'vue-router'
import Home from './Home.vue'
import CompositionHome from './CompositionHome.vue'
import {ParsedQuery, QueryParameterDefinitions} from "@/library";

const routes = [
  {
    path: '/composition-api',
    name: 'composition-api',
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
        onInit: (props: QueryParameterDefinitions) => {
          console.log('onInit', props)
          props['search'].defaultValue =
              window.localStorage.getItem('searchDefaultValue')
          return props
        },
        onLoad: (params: ParsedQuery) => {
          console.log('onLoad', params)
          return params
        },
        onChange: (query: LocationQuery, queryValues: ParsedQuery) => {
          window.localStorage.setItem('searchDefaultValue', queryValues.search || '')
          console.log('onChange', query, queryValues)
        }
      }
    },
    component: CompositionHome
  },
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
        onInit: (props: QueryParameterDefinitions) => {
          console.log('onInit', props)
          props['search'].defaultValue =
              window.localStorage.getItem('searchDefaultValue')
          return props
        },
        onLoad: (params: ParsedQuery) => {
          console.log('onLoad', params)
          return params
        },
        onChange: (query: LocationQuery, queryValues: ParsedQuery) => {
          window.localStorage.setItem('searchDefaultValue', queryValues.search || '')
          console.log('onChange', query, queryValues)
        }
      }
    },
    component: Home
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
