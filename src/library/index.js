import { reactive, watch } from 'vue'
import { arraysMatch, isObject, queryFingerprint } from './utils'
import {
    ArrayDatatype,
    BoolDatatype,
    CommaArrayDatatype,
    IntDatatype,
    SpaceArrayDatatype,
    StringDatatype
} from './datatypes'

export * from './datatypes'

/*
 * convert parameter in "meta/query" from string representation to object representation
 */
export function parseParamDefinition (x, datatypes) {
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

const _query = reactive({
    query: {},
    rawQuery: {},
    enabled: true,
    serializedId: 0
})

let router = null
let datatypes = null
let debug = false
let queryDefinition = null
let querySettings = null
let fingerprint = ''
let detailedFingerprint = {}
let watchers = {}

function dlog (...args) {
    if (debug) {
        console.log(...args)
    }
}

function prepareQuery (route) {
    const _queryDefinition = {}
    const _querySettings = {}

    // merge query definition from all matched segments on path
    route.matched.forEach(match => {
        if (!match.meta) {
            return
        }
        if (match.meta.query) {
            Object.assign(_queryDefinition, match.meta.query)
        }
        if (match.meta.querySettings) {
            Object.assign(_querySettings, match.meta.querySettings)
        }
    })
    if (!_queryDefinition) {
        return false
    }
    // parse param definitions
    Object.keys(_queryDefinition).forEach(key => {
        _queryDefinition[key] = parseParamDefinition(_queryDefinition[key], datatypes)
    })
    if (_querySettings.onInit) {
        _querySettings.onInit(_queryDefinition)
    }
    queryDefinition = _queryDefinition
    querySettings = _querySettings
    dlog('query definition, query settings', queryDefinition, querySettings)
    return true
}

function serializeChangedValue (key, value) {
    dlog('serialize changed value', key, value)
    if (value !== undefined) {
        const def = queryDefinition[key]
        if (def) {
            value = def.datatype.serialize(value, def.defaultValue)
        }
    }

    saveValueToRawQuery(key, value)
}

function saveValueToRawQuery (key, value) {
    if (value === undefined) {
        if (key in _query.rawQuery) {
            delete _query.rawQuery[key]
            _query.serializedId++
        }
        return
    }

    const isNull = value === null
    const isArray = !isNull && Array.isArray(value)

    if (!isNull) {
        if (isArray) {
            value = value.map(x => x.toString())
        } else {
            value = value.toString()
        }
    }

    if (!(key in _query.rawQuery)) {
        _query.rawQuery[key] = value
        _query.serializedId++
    } else {
        let modified = false
        const oldValue = _query.rawQuery[key]
        if (oldValue === null) {
            modified = !isNull
        } else if (Array.isArray(oldValue)) {
            if (!isArray) {
                modified = true
            } else if (arraysMatch(oldValue, value)) {
                modified = true
            }
        } else if (isArray) {
            modified = true
        } else if (value !== oldValue) {
            modified = true
        }
        if (modified) {
            _query.rawQuery[key] = value
            _query.serializedId++
        }
    }
    dlog('Set to raw', key, value)
}

function setWatcher (key) {
    if (key in watchers) {
        return
    }
    dlog('Adding watcher', key)
    watchers[key] = watch(
        () => _query.query[key],
        value => serializeChangedValue(key, value)
    )
}

function clearWatchers () {
    Object.values(watchers).forEach(watcher => watcher())
    watchers = {}
}

function handleRouteChange (to) {
    if (!prepareQuery(to)) {
        fingerprint = ''
        detailedFingerprint = {}
        Object.keys(_query.query).forEach(function (key) {
            delete _query.query[key]
        })
        _query.enabled = false
        queryDefinition = {}
        querySettings = {}
        clearWatchers()
        return
    }
    _query.enabled = true
}

function parseAndStoreQuery (query, actualDetailedFingerprint) {
    for (const key of Object.keys(query)) {
        if (detailedFingerprint[key] === actualDetailedFingerprint[key]) {
            continue
        }
        const val = query[key]
        const def = queryDefinition[key]
        if (!def) {
            _query.query[key] = val
        } else {
            _query.query[key] = def.datatype.parse(val)
        }
    }
    for (const key of Object.keys(queryDefinition)) {
        if (key in _query.query) {
            continue
        }
        const def = queryDefinition[key]
        let defVal = def.defaultValue
        if (typeof defVal === 'function') {
            defVal = defVal()
        }
        _query.query[key] = defVal
    }
    _query.rawQuery = { ...query }

    if (querySettings.onLoad) {
        querySettings.onLoad(_query.query)
    }
}

function setup (_router, _datatypes, _debug) {
    router = _router
    datatypes = _datatypes
    debug = _debug

    router.beforeEach((to, from) => {
        if (to.name !== from.name) {
            handleRouteChange(to)
        }
        if (!_query.enabled) {
            return
        }
        // check fingerprint if query modified
        const actualFingerprint = queryFingerprint(to.query)
        if (actualFingerprint.fingerprint === fingerprint) {
            dlog('same fingerprint, not changing args')
            return
        }
        dlog('parsing args', actualFingerprint)

        // parse and store query params
        parseAndStoreQuery(to.query, actualFingerprint.detailedFingerprint)

        // set up watchers
        for (const key of Object.keys(_query.query)) {
            setWatcher(key)
        }

        // set fingerprint
        fingerprint = actualFingerprint.fingerprint
        detailedFingerprint = actualFingerprint.detailedFingerprint
    })

    watch(
        () => _query.serializedId,
        () => {
            // no need to go through the parsing process again when router calls beforeEach,
            // so set the fingerprint
            const actualFingerprint = queryFingerprint(_query.rawQuery)
            fingerprint = actualFingerprint.fingerprint
            detailedFingerprint = actualFingerprint.detailedFingerprint
            router.push({ query: _query.rawQuery })
        }
    )
}

function define (key, datatype, defaultValue) {
    queryDefinition[key] = {
        datatype,
        defaultValue
    }
    _query.query[key] = datatype.parse(_query.rawQuery[key], defaultValue)
    setWatcher(key)
    dlog('Defined new key', key)
}

function as_array (key, datatype) {
    if (!(key in _query.query)) {
        define(key, datatype || ArrayDatatype, [])
    }
    let arr = _query.query[key] || []
    if (!Array.isArray(arr)) {
        return [arr]
    } else {
        return [...arr]
    }
}

function addValue(key, value, datatype) {
    const arr = as_array(key, datatype)
    const idx = arr.indexOf(value)
    if (idx < 0) {
        arr.push(value)
    }
    _query.query[key] = arr
}

function removeValue(key, value, datatype) {
    const arr = as_array(key, datatype)
    const idx = arr.indexOf(value)
    if (idx >= 0) {
        arr.splice(idx, 1)
    }
    _query.query[key] = arr
}

function wrapDynamic () {
    const handler = {
        set: function (target, prop, value) {
            if (!(prop in target)) {
                define(prop, StringDatatype, '')
            }
            target[prop] = value
            return true
        },
        get: function(target, prop) {
            if (prop === 'define') {
                return define
            }
            if (prop === 'addValue') {
                return addValue
            }
            if (prop === 'removeValue') {
                return removeValue
            }
            if (prop === '__definition') {
                return queryDefinition
            }
            return target[prop]
        },
    }

    return new Proxy(_query.query, handler)
}

export function useQuery () {
    return {
        query: wrapDynamic(_query.query),
        rawQuery: _query.rawQuery,
        define
    }
}

export default {
    install (app, { router, datatypes, debug }) {
        setup(router, {
            'string': StringDatatype,
            'bool': BoolDatatype,
            'int': IntDatatype,
            'array': ArrayDatatype,
            'commaarray': CommaArrayDatatype,
            'spacearray': SpaceArrayDatatype,
            ...(datatypes || {})
        }, debug)
        app.config.globalProperties.$query = useQuery().query
    }
}
