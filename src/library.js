//
// stored options from the installer
//
const $options = {}

//
// A helper method that defines property. Setter of this property
// supposes that the queryObject contains __schedule_update(key, value, extra)
// method
//
function defineProperty (queryObject, key, query, extra) {
    Object.defineProperty(queryObject, key, {
        get: function () {
            return this['_' + key]
        },
        set: function (value) {
            this['_' + key] = value
            this.__schedule_update(key, value, extra)
        }
    })
    queryObject['_' + key] = query[key] || null
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
        __schedule_update: function (key, value, extra) {
            // sets the value in the internal list of updated values (more than one value might be updated in debounce)
            this.__updates[key] = value

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
                        if (val) {
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
                extra.debounce || $options.debounce
            )
        }
    }

    for (const key of params) {
        defineProperty(queryObject, key.name, query, key)
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
            x = {
                name: x
            }
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

export { query }

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
    }
}
