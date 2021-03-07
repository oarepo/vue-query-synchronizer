import {reactive, watch} from 'vue'
import {arraysMatch, queryFingerprint} from './utils'
import {
    ArrayDatatype,
    BoolDatatype,
    CommaArrayDatatype,
    IntDatatype,
    SpaceArrayDatatype,
    StringDatatype
} from './datatypes'
import {LocationQuery, RouteLocationNormalizedLoaded, Router} from "vue-router";
import {
    DataType,
    DataTypes,
    DetailedFingerprint, GenericParsedQuery, NavigationOperation,
    ParsedQuery,
    QueryParameterDefinition,
    QueryParameterDefinitions,
    QuerySettings,
    TypedParsedQuery
} from "./types";
import {WatchStopHandle} from "@vue/runtime-core";

export * from './datatypes'
export * from './types'


/**
 * convert parameter in "meta/query" from string representation to object representation
 *
 * @internal
 */
function parseParamDefinition<T>(
    defOrString: QueryParameterDefinition<T> | string,
    datatypes: DataTypes): QueryParameterDefinition<T> {
    let def: QueryParameterDefinition<T>
    if (typeof defOrString === 'string') {
        let splitted = defOrString.split(':')
        if (splitted.length === 1) {
            splitted = ['string', splitted[0]]
        }
        const datatype = datatypes[splitted[0]]
        def = {
            datatype: datatype,
            defaultValue: datatype.parseDefault(splitted[1])
        }
    } else {
        def = defOrString
    }
    if (def.datatype === undefined) {
        def.datatype = datatypes['string']
    }
    return def
}

const _query = reactive({
    query: {} as ParsedQuery,
    rawQuery: {} as LocationQuery,
    enabled: true,
    serializedId: 0
})

let router!: Router
let datatypes!: DataTypes
let debug = false
let navigationOperation!: (query: ParsedQuery, router: Router) => 'push' | 'replace'

let queryDefinition: QueryParameterDefinitions | null = null
let querySettings: QuerySettings | null = null
let fingerprint: string | null = null
let detailedFingerprint: DetailedFingerprint = {}
let watchers: { [key: string]: WatchStopHandle } = {}

function dlog(...args: any[]) {
    if (debug) {
        console.log(...args)
    }
}

function prepareQuery(route: RouteLocationNormalizedLoaded) {
    const _queryDefinition: QueryParameterDefinitions = {}
    const _querySettings: QuerySettings = {}

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

function serializeChangedValue(key: string, value: any) {
    dlog('serialize changed value', key, value)
    if (value !== undefined) {
        const def = queryDefinition![key]
        if (def) {
            value = def.datatype.serialize(value, def.defaultValue)
        }
    }

    saveValueToRawQuery(key, value)
}

function saveValueToRawQuery(key: string, value: string | string[]) {
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
            value = (value as any[]).map(x => x.toString())
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
            } else if (arraysMatch(oldValue, value as any[])) {
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

function setWatcher(key: string) {
    if (key in watchers) {
        return
    }
    dlog('Adding watcher', key)
    watchers[key] = watch(
        () => _query.query[key],
        value => serializeChangedValue(key, value)
    )
}

function clearWatchers() {
    Object.values(watchers).forEach(watcher => watcher())
    watchers = {}
}

function handleRouteChange(to: RouteLocationNormalizedLoaded) {
    fingerprint = null
    detailedFingerprint = {}
    Object.keys(_query.query).forEach(function (key) {
        delete _query.query[key]
    })
    queryDefinition = {}
    querySettings = {}
    clearWatchers()

    if (!prepareQuery(to)) {
        _query.enabled = false
    } else {
        _query.enabled = true
    }
}

function parseAndStoreQuery(query: LocationQuery, actualDetailedFingerprint: DetailedFingerprint) {
    dlog('Parse and store query called with', query, actualDetailedFingerprint)
    for (const key of Object.keys(query)) {
        if (detailedFingerprint[key] === actualDetailedFingerprint[key]) {
            continue
        }
        const val = query[key]
        const def = queryDefinition![key]
        if (!def) {
            _query.query[key] = val
        } else {
            _query.query[key] = def.datatype.parse(val, def.defaultValue)
        }
    }
    for (const key of Object.keys(queryDefinition!)) {
        if (key in _query.query) {
            continue
        }
        const def = queryDefinition![key]
        let defVal = def.defaultValue
        if (typeof defVal === 'function') {
            defVal = defVal()
        }
        _query.query[key] = defVal
    }
    _query.rawQuery = {...query}

    if (querySettings!.onLoad) {
        querySettings!.onLoad(_query.query)
    }
}

function setup(_router: Router, _datatypes: DataTypes, _debug: boolean, _navigationOperation: NavigationOperation) {
    router = _router
    datatypes = _datatypes
    debug = _debug
    if (_navigationOperation === 'push' || _navigationOperation === 'replace') {
        navigationOperation = (() => _navigationOperation)
    } else {
        navigationOperation = _navigationOperation
    }

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
            if (querySettings!.onChange) {
                querySettings!.onChange(_query.rawQuery, _query.query)
            }
            const op = navigationOperation(_query.query, router)
            router[op]({query: _query.rawQuery})
        }
    )
}

function define<T>(key: string, datatype: DataType<T>, defaultValue: T) {
    queryDefinition![key] = {
        datatype,
        defaultValue
    }
    _query.query[key] = datatype.parse(_query.rawQuery[key], defaultValue)
    setWatcher(key)
    dlog('Defined new key', key)
}

function as_array<T>(key: string, datatype: DataType<T[]>) {
    if (!(key in _query.query)) {
        define(key, datatype || ArrayDatatype, [] as T[])
    }
    let arr = _query.query[key] || []
    if (!Array.isArray(arr)) {
        return [arr]
    } else {
        return [...arr]
    }
}

function addValue<T>(key: string, value: T, datatype: DataType<T[]>) {
    const arr = as_array(key, datatype)
    const idx = arr.indexOf(value)
    if (idx < 0) {
        arr.push(value)
    }
    _query.query[key] = arr
}

function removeValue<T>(key: string, value: T, datatype: DataType<T[]>) {
    const arr = as_array(key, datatype)
    const idx = arr.indexOf(value)
    if (idx >= 0) {
        arr.splice(idx, 1)
    }
    _query.query[key] = arr
}

const handler = {
    set: function (target: ParsedQuery, prop: string, value: any) {
        if (!(prop in target)) {
            define(prop, StringDatatype, '')
        }
        target[prop] = value
        return true
    },
    get: function (target: ParsedQuery, prop: string) {
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

const proxiedQuery = new Proxy(_query.query, handler)

/**
 * The main composition API entrypoint. Returns a reactive Query object with parsed values
 *
 * @typeParam T The type of the returned query object. An interface defining query parameters and their types
 * might be passed. If not a generic (untyped) interface is used.
 */
export function useQuery<T = GenericParsedQuery>(): TypedParsedQuery<T> {
    return proxiedQuery as TypedParsedQuery<T>
}

/**
 * @internal
 */
export function useRawQuery() {
    return _query
}

const QuerySynchronizer = {
    install(app: any, {
        router,
        datatypes,
        debug,
        navigationOperation
    }: {
        router: Router,
        datatypes?: Array<DataType<any>>,
        debug?: boolean,
        navigationOperation?: NavigationOperation
    }) {
        setup(router, {
                'string': StringDatatype,
                'bool': BoolDatatype,
                'int': IntDatatype,
                'array': ArrayDatatype,
                'commaarray': CommaArrayDatatype,
                'spacearray': SpaceArrayDatatype,
                ...(datatypes || []).reduce((p, c) => {
                    p[c.name] = c
                    return p
                }, {} as any)
            }, debug || false,
            navigationOperation || 'push')
        app.config.globalProperties.$query = useQuery()
    }
}

/**
 * Vue plugin. Usage:
 * ```
 * createApp(App).use(router).use(QuerySynchronizer, { router, debug: true })
 * ```
 *
 * @param router application's router
 * @param datatypes an optional array of custom (user-defined) datatypes
 * @param debug if set to true, print library's debug messages
 */
export default QuerySynchronizer
