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

//
// stored options from the installer
//
const $options = {}

//
// A helper method that defines property on queryObject. The store for property values is in values
// parameter
//
function defineProperty (queryObject, props, values, key, value, definition, scheduleUpdate) {
    const property = Object.defineProperty(queryObject, key, {
        get: function () {
            return values[key]
        },
        set: function (value) {
            values[key] = value
            scheduleUpdate(definition, value)
        },
        enumerable: true
    })
    values[key] = value
    props[key] = property
    return property
}

//
// helper method to check if parameter is an object-taken from
// https://stackoverflow.com/questions/8511281/check-if-a-value-is-an-object-in-javascript
//
function isObject (obj) {
    var type = typeof obj
    return type === 'function' || (type === 'object' && !!obj)
}

// https://jsperf.com/alternative-isfunction-implementations
function isFunction (obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply)
}

// https://gomakethings.com/how-to-check-if-two-arrays-are-equal-with-vanilla-js/
function arraysMatch (arr1, arr2) {

    // Check if the arrays are the same length
    if (arr1.length !== arr2.length) return false

    // Check if all items exist and are in the same order
    for (var i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false
    }

    // Otherwise, return true
    return true

}

function convertParam (x) {
    if (!isObject(x)) {
        x = x.split(':')
        let debounce = parseInt(x[0])
        if (isNaN(debounce)) {
            if (x[0] === '') {
                debounce = 0
                x.splice(0, 1)
            } else {
                debounce = undefined
            }
        } else {
            x.splice(0, 1)
        }
        if (x.length === 1) {
            x = ['string', x[0], null]
        } else if (x.length === 2) {
            x.push(null)
        }
        x = {
            name: x[1],
            datatype: x[0],
            defaultValue: x[2],
            debounce
        }
    }
    if (x.datatype === undefined) {
        x.datatype = 'string'
    }
    return x
}

//
// creates reactive query object
//
function makeQueryObject (query, params, options) {
    // will contain the query params that have been updated
    const updates = {}

    // holder for values
    const values = {}

    // debouncing timer if debouncing is running
    const timer = {
        timer: undefined
    }

    const props = {}

    const queryObject = {}

    // schedules an update
    const scheduleUpdate = function (definition, value) {
        const key = definition.name
        if ($options.debug) {
            console.log('definition is', definition, 'default value is', definition.parsedDefaultValue, 'value', value)
        }
        // sets the value in the internal list of updated values (more than one value might be updated in debounce)
        updates[key] =
            $options.datatypes[definition.datatype].serialize(value, definition.parsedDefaultValue)
        if ($options.debug) {
            console.log('serialized value is', updates[key])
        }

        // if debounce timer is running, kill it
        if (timer.timer !== undefined) {
            clearTimeout(timer.timer)
            delete timer.timer
        }

        // start a new router modifying timer
        timer.timer = setTimeout(
            () => {
                // after debounce, set the router and clear the update list and timer
                const _query = {
                    ...query
                }
                // for each update: if the value is set,
                // push it to query. If not set, remove it from query
                Object.keys(updates).forEach(k => {
                    const val = updates[k]
                    if (val || val === null) {
                        _query[k] = val
                    } else if (_query[k] !== undefined) {
                        delete _query[k]
                    }
                })
                if (options.onChange) {
                    options.onChange(_query, queryObject)
                }
                $options.router.push({ query: _query })
                Object.keys(updates).forEach(function (key) {
                    delete updates[key]
                })
                timer.timer = null
            },
            // take the debounce from the query parameter or use the default one
            definition.debounce || $options.debounce
        )
    }

    queryObject._prop = function (pdef) {
        const key = convertParam(pdef)
        if (props[key.name] === undefined) {
            const datatype = $options.datatypes[key.datatype]
            if (datatype === undefined) {
                console.error(`No datatype handler defined for type name ${key.datatype}. ` +
                    `If you use text format for parameters, make sure that datatype is ` +
                    `at the first position (such as number:page, not vice versa)`)
                return
            }
            if (key.parsedDefaultValue === undefined) {
                key.parsedDefaultValue = datatype.parse(key.defaultValue, null, true)
            }
            const parsedValue = datatype.parse(query[key.name], key.parsedDefaultValue)
            if ($options.debug) {
                console.log('parsed value is', parsedValue)
            }
            return defineProperty(this, props, values, key.name, parsedValue, key, scheduleUpdate)
        } else {
            return props[key.name]
        }
    }

    queryObject._insert = function (prop, value) {
        value = value.toString()
        if (!this[prop].includes(value)) {
            this[prop] = [...this[prop], value]
        }
    }

    queryObject._remove = function (prop, value) {
        value = value.toString()
        if (this[prop].includes(value)) {
            this[prop] = this[prop].filter(x => x !== value)
        }
    }

    for (const key of params) {
        const datatype = $options.datatypes[key.datatype]
        if (datatype === undefined) {
            console.error(`No datatype handler defined for type name ${key.datatype}. ` +
                `If you use text format for parameters, make sure that datatype is ` +
                `at the first position (such as number:page, not vice versa)`)
            continue
        }
        if (key.parsedDefaultValue === undefined) {
            key.parsedDefaultValue = datatype.parse(key.defaultValue, null, true)
        }
        if ($options.debug) {
            console.log('definition is', key, 'default value is', key.parsedDefaultValue, 'query value', query[key.name])
        }
        const value = datatype.parse(query[key.name], key.parsedDefaultValue)
        if ($options.debug) {
            console.log('parsed value is', value)
        }
        defineProperty(queryObject, props, values, key.name, value, key, scheduleUpdate)
    }
    if ($options.passUnknownProperties) {
        for (const key of Object.keys(query)) {
            if (params[key] === undefined) {
                if ($options.debug) {
                    console.log('Adding extra option', key, 'query value', query[key])
                }
                queryObject._prop('array:' + key)
            }
        }
    }
    return queryObject
}

function query (params, extra, options) {
    /*
        @param: params: all the parameters present in path. If not there, will be filled with null
        to be watchable
        @param: extra: dictionary of extra properties that will be passed to props
     */

    // convert string query param names to object form
    params = (params || []).map(x => convertParam(x))
    options = options || {}

    // gets called when the route changes
    function maker (route) {
        if ($options.debug) {
            console.log('synchronizer definition', params)
        }
        let localParams = params
        if (options.onInit) {
            localParams = options.onInit(params) || params
        }
        const createdQuery = makeQueryObject(route.query, localParams, options)
        let extraData = (extra || {})
        if (isFunction(extraData)) {
            extraData = extraData(route)
        }
        let routeParams = {}
        if (options.passParams) {
            routeParams = route.params
        }
        let ret = {
            ...extraData,
            ...routeParams,
            query: createdQuery
        }
        if (options.onLoad) {
            ret = options.onLoad(ret) || ret
        }
        return ret
    }

    return maker
}

const StringDatatype = {
    parse (value, defaultValue) {
        if (value === undefined) {
            return defaultValue
        }
        if (value && typeof value !== 'string') {
            console.error('Incorrect variable for parameter, expecting string, got', value)
            return defaultValue
        }
        return value || ''
    },
    serialize (value, defaultValue) {
        return value === defaultValue ? undefined : value
    }
}

const NumberDatatype = {
    parse (value, defaultValue) {
        if (value === undefined || value === null) {
            return defaultValue
        }
        value = parseInt(value)
        if (isNaN(value)) {
            return defaultValue
        }
        return value
    },
    serialize (value, defaultValue) {
        value = parseInt(value || 0)
        return value === defaultValue ? undefined : value.toString()
    }
}

const BoolDatatype = {
    parse (value, defaultValue, parsingDefault) {
        if (value === undefined || (value === null && parsingDefault)) {
            return defaultValue || false
        }
        return true
    },
    serialize (value, defaultValue) {
        if (value && value !== defaultValue) {
            return null
        }
        return undefined
    }
}

const ArrayDatatype = {
    parse (value, defaultValue) {
        if (value === undefined) {
            return (defaultValue || []).slice()
        }
        if (typeof value === 'string') {
            return [value]
        }
        return value || []
    },
    serialize (value, defaultValue) {
        return arraysMatch(value, defaultValue) ? undefined : value
    }
}

export { query, StringDatatype, NumberDatatype, BoolDatatype, ArrayDatatype }

export default {
    install (Vue, options) {
        if (!options || !options.router) {
            throw Error('Supply router to options')
        }
        options = {
            debounce: 100,
            passUnknownProperties: false,
            ...options
        }
        Object.assign($options, options)
        $options.datatypes = {
            'string': StringDatatype,
            'number': NumberDatatype,
            'bool': BoolDatatype,
            'array': ArrayDatatype,
            ...($options.datatypes || {})
        }
    }
}
