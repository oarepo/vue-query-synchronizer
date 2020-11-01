/*
MIT License

Copyright (c) 2019 Mirek Simek (miroslav.simek@gmail.com), Daniel Bartoň

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
function isObject(obj) {
    var type = typeof obj
    return type === 'function' || (type === 'object' && !!obj)
}

function convertParam(x, datatypes) {
    if (!isObject(x)) {
        x = x.split(':')
        if (x.length === 1) {
            x = ['string', x[0]]
        }
        const datatype = datatypes[x[0]]
        x = {
            datatype: datatype,
            defaultValue: datatype.parseDefault(x[1])
        }
    }
    if (x.datatype === undefined) {
        x.datatype = datatypes['string']
    }
    return x
}

// https://gomakethings.com/how-to-check-if-two-arrays-are-equal-with-vanilla-js/
function arraysMatch(arr1, arr2) {

    // Check if the arrays are the same length
    if (arr1.length !== arr2.length) return false

    // Check if all items exist and are in the same order
    for (var i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false
    }

    // Otherwise, return true
    return true

}

const StringDatatype = {
    parseDefault(value) {
        return value || ''
    },
    parse(value, defaultValue) {
        if (value === undefined) {
            return defaultValue
        }
        if (value && typeof value !== 'string') {
            console.error('Incorrect variable for parameter, expecting string, got', value)
            return defaultValue
        }
        return value || ''
    },
    serialize(value, defaultValue) {
        if (value === null || value === undefined || (value === '' && !defaultValue)) {
            return undefined
        }
        return value === defaultValue ? undefined : value
    }
}

const IntDatatype = {
    parseDefault(value) {
        if (value.length) {
            return parseInt(value)
        }
        return 0
    },
    parse(value, defaultValue) {
        if (value === undefined || value === null) {
            return defaultValue
        }
        value = parseInt(value)
        if (isNaN(value)) {
            return defaultValue
        }
        return value
    },
    serialize(value, defaultValue) {
        if (value === null || value === undefined) {
            return undefined
        }
        value = parseInt(value || 0)
        return value === defaultValue ? undefined : value.toString()
    }
}

const BoolDatatype = {
    parseDefault(value) {
        return (value === '1' || value === 'true')
    },
    parse(value, defaultValue) {
        if (value === undefined) {
            return defaultValue || false
        }
        return true
    },
    serialize(value, defaultValue) {
        if (value === undefined) {
            return undefined
        }
        if (value && value !== defaultValue) {
            return null
        }
        return undefined
    }
}

const ArrayDatatype = {
    parseDefault(value) {
        if (value === undefined) {
            return []
        }
        if (typeof value === 'string') {
            if (value !== '') {
                return [value]
            } else {
                return []
            }
        }
        return value || []
    },
    parse(value, defaultValue) {
        if (value === undefined) {
            return (defaultValue || []).slice()
        }
        if (typeof value === 'string') {
            return [value]
        }
        return value || []
    },
    serialize(value, defaultValue) {
        if (value === null || value === undefined || value.length === 0) {
            return undefined
        }
        if (arraysMatch(value, defaultValue)) {
            return undefined
        }
        if (value.length === 1) {
            return value[0]
        }
        return value
    }
}

function separatedArrayDatatype(separator) {
    return {
        parseDefault(value) {
            if (value === undefined) {
                return []
            }
            if (typeof value === 'string') {
                if (value === '') {
                    return []
                }
                return value.split(separator)
            }
            return value || []
        },
        parse(value, defaultValue) {
            if (value === undefined) {
                return (defaultValue || []).slice()
            }
            if (typeof value === 'string') {
                if (value === '') {
                    return []
                }
                return value.split(separator)
            }
            return value || []
        },
        serialize(value, defaultValue) {
            if (value === null || value === undefined || value.length === 0) {
                return undefined
            }
            if (arraysMatch(value, defaultValue)) {
                return undefined
            }
            return value.join(separator)
        }
    }
}

const CommaArrayDatatype = separatedArrayDatatype(',')
const SpaceArrayDatatype = separatedArrayDatatype(' ')

const QuerySynchronizer = {

    install(Vue, { router, datatypes, debug }) {
        datatypes = {
            'string': StringDatatype,
            'bool': BoolDatatype,
            'int': IntDatatype,
            'array': ArrayDatatype,
            'commaarray': CommaArrayDatatype,
            'spacearray': SpaceArrayDatatype,
            ...(datatypes || {})
        }
        const defaultStringParam = {
            datatype: StringDatatype,
            defaultValue: null
        }

        // for easier debugging
        if (debug) {
            Object.entries(datatypes).forEach(d => {
                d[1].code = d[0]
            })
        }

        const _vue = new Vue({
            data: {
                routeName: null,
                urlquery: {},
                query: {},
                params: {},
                incr: 1
            }
        })

        const handler = {
            get(target, prop) {
                if (prop in handler) {
                    return (...args) => handler[prop].apply(target, args)
                }
                if (prop === '__self') {
                    return target
                }
                if (prop === '__incr') {
                    return target.incr
                }
                if (!(prop in target.query)) {
                    const param = target.params[prop] || defaultStringParam
                    Vue.set(target.query, prop, param.datatype.parse(target.urlquery[prop], param.defaultValue))
                }
                return target.query[prop]
            },

            set(target, prop, value) {
                if (value === undefined) {
                    if (target.query[prop] !== undefined) {
                        Vue.delete(target.query, prop)
                        Vue.delete(target.urlquery, prop)
                        target.incr += 1
                    }
                } else {
                    const param = target.params[prop] || defaultStringParam
                    const serializedVal = param.datatype.serialize(value, param.defaultValue)
                    if (serializedVal !== target.urlquery[prop]) {
                        Vue.set(target.query, prop, value)
                        if (serializedVal !== undefined) {
                            Vue.set(target.urlquery, prop, serializedVal)
                        } else {
                            Vue.delete(target.urlquery, prop)
                        }
                        target.incr += 1
                    }
                }
                return true
            },

            delete(target, prop) {
                if (target.query[prop] !== undefined) {
                    Vue.delete(target.query, prop)
                    Vue.delete(target.urlquery, prop)
                    target.incr += 1
                }
            },

            has(target, key) {
                return true // key in target
            },

            ownKeys(target) {
                const ret = new Set([
                    ...Object.keys(target.query),
                    ...Object.keys(target.urlquery),
                    ...Object.keys(target.params || {})
                ])
                ret.delete('toJSON')
                return [...ret]
            },

            getOwnPropertyDescriptor(target, prop) {
                if (prop === 'toJSON') {
                    return { configurable: true, enumerable: false };
                }
                return { configurable: true, enumerable: true };
            },

            getHTMLQuery() {
                return this.urlquery
            },

            setQuery(newQuery) {
                const self = this
                Object.keys(this.query).forEach(function (key) {
                    delete self.query[key]
                })
                Object.keys(this.urlquery).forEach(function (key) {
                    delete self.urlquery[key]
                })
                Object.assign(this.urlquery, newQuery)
            },

            define(name, datatype, defaultValue) {
                this.params[name] = {
                    datatype,
                    defaultValue
                }
                const val = this.urlquery[name]
                // do not make this firing a new event
                this.query[name] = datatype.parse(val, defaultValue)
            },

            addValue(name, value, datatype) {
                if (this.params[name] === undefined) {
                    query.define(name, datatype || ArrayDatatype, [])
                }
                let arr = query[name] || []
                if (!Array.isArray(arr)) {
                    arr = [arr]
                } else {
                    arr = [...arr]
                }
                const idx = arr.indexOf(value)
                if (idx < 0) {
                    arr.push(value)
                    query[name] = arr
                }
            },

            removeValue(name, value, datatype) {
                if (this.params[name] === undefined) {
                    query.define(name, datatype || ArrayDatatype, [])
                }
                let arr = query[name] || []
                if (!Array.isArray(arr)) {
                    arr = [arr]
                } else {
                    arr = [...arr]
                }
                const idx = arr.indexOf(value)
                arr.splice(idx, 1)
                query[name] = arr
            }
        }

        const query = new Proxy(_vue, handler)
        Vue.prototype.$query = query
        Vue.prototype.$rawQuery = _vue.query

        router.afterEach((to) => {
            if (!to.meta.query) {
                return
            }
            const settings = to.meta.querySettings || {}
            if (_vue.routeName !== to.name) {
                if (debug) {
                    console.log('Route name changed, replacing param definition with', to.meta.query)
                }
                _vue.routeName = to.name
                const params = {}
                for (const k in to.meta.query) {
                    params[k] = convertParam(to.meta.query[k], datatypes)
                }
                if (settings.onInit) {
                    settings.onInit(params, query, _vue)
                }
                _vue.params = params
                _vue.settings = settings
            }
            query.setQuery(to.query)
            if (settings.onLoad) {
                settings.onLoad(query, _vue)
            }
            if (debug) {
                console.log('Setting query from router', to.query, _vue.urlquery)
            }
        })

        _vue.$watch('incr', () => {
            const existingQuery = router.currentRoute.query
            const newQuery = query.getHTMLQuery()
            let modified = false
            if (Object.keys(existingQuery).length === Object.keys(newQuery).length) {
                for (const k of Object.keys(newQuery)) {
                    const val = newQuery[k] !== null ? newQuery[k].toString() : null
                    if (val !== existingQuery[k].toString()) {
                        if (debug) {
                            console.log('Setting router from query: modified property', k, val, existingQuery[k])
                        }
                        modified = true
                        break
                    }
                }
            } else {
                modified = true
            }
            if (!modified) {
                return
            }
            if (debug) {
                console.log('Setting router from query', newQuery)
            }
            if (_vue.settings.onChange) {
                _vue.settings.onChange(newQuery, query, _vue)
            }
            router.push({ query: newQuery })
        })
    }
}

export {
    StringDatatype, BoolDatatype, ArrayDatatype, IntDatatype,
    separatedArrayDatatype, CommaArrayDatatype, SpaceArrayDatatype
}

export default QuerySynchronizer
