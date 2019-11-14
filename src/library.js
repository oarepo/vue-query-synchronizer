//
// stored options from the installer
//
const $options = {}

//
// A helper method that defines property. Setter of this property
// supposes that the queryObject contains __schedule_update(key, value, extra)
// method
//
function defineProperty (queryObject, key, value, definition) {
    Object.defineProperty(queryObject, key, {
        get: function () {
            return this['_' + key]
        },
        set: function (value) {
            this['_' + key] = value
            this.__schedule_update(definition, value)
        }
    })
    queryObject['_' + key] = value || null
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

//
// creates reactive query object
//
function makeQueryObject (query, params) {

    const queryObject = {
        // will contain the query params that have been updated
        __updates: {},

        // debouncing timer if debouncing is running
        __timer: undefined,

        // schedules an update
        __schedule_update: function (definition, value) {
            const key = definition.name
            if ($options.debug) {
                console.log('definition is', definition, 'default value is', definition.parsedDefaultValue, 'value', value)
            }
            // sets the value in the internal list of updated values (more than one value might be updated in debounce)
            this.__updates[key] =
                $options.datatypes[definition.datatype].serialize(value, definition.parsedDefaultValue)
            if ($options.debug) {
                console.log('serialized value is', this.__updates[key])
            }

            // if debounce timer is running, kill it
            if (this.__timer !== undefined) {
                clearTimeout(this.__timer)
            }

            // start a new router modifying timer
            this.__timer = setTimeout(
                () => {
                    // after debounce, set the router and clear the update list and timer
                    const _query = {
                        ...query
                    }
                    // for each update: if the value is set,
                    // push it to query. If not set, remove it from query
                    Object.keys(this.__updates).forEach(k => {
                        const val = this.__updates[k]
                        if (val || val === null) {
                            _query[k] = val
                        } else if (_query[k] !== undefined) {
                            delete _query[k]
                        }
                    })
                    $options.router.push({ query: _query })
                    this.__updates = {}
                    this.__timer = null
                },
                // take the debounce from the query parameter or use the default one
                definition.debounce || $options.debounce
            )
        }
    }

    for (const key of params) {
        if (key.parsedDefaultValue === undefined) {
            key.parsedDefaultValue = $options.datatypes[key.datatype].parse(key.defaultValue, null, true)
        }
        if ($options.debug) {
            console.log('definition is', key, 'default value is', key.parsedDefaultValue, 'query value', query[key.name])
        }
        const value = $options.datatypes[key.datatype].parse(query[key.name], key.parsedDefaultValue)
        if ($options.debug) {
            console.log('parsed value is', value)
        }
        defineProperty(queryObject, key.name, value, key)
    }
    return queryObject
}

function query (params, extra) {
    /*
        @param: params: all the parameters present in path. If not there, will be filled with null
        to be watchable
        @param: extra: dictionary of extra properties that will be passed to props
     */

    // convert string query param names to object form
    params = params.map(x => {
        if (!isObject(x)) {
            x = x.split(':')
            if (x.length === 1) {
                x = ['string', x[0], null]
            } else if (x.length === 2) {
                x.push(null)
            }
            x = {
                name: x[1],
                datatype: x[0],
                defaultValue: x[2]
            }
        }
        if (x.datatype === undefined) {
            x.datatype = 'string'
        }
        return x
    })

    // gets called when the route changes
    function maker (route) {
        const createdQuery = makeQueryObject(route.query, params)
        let extraData = (extra || {})
        if (isFunction(extraData)) {
            extraData = extraData(route)
        }
        return {
            ...extraData,
            query: createdQuery
        }
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
            return defaultValue
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
