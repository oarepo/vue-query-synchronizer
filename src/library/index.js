"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.useRawQuery = exports.useQuery = exports.parseParamDefinition = void 0;
var vue_1 = require("vue");
var utils_1 = require("./utils");
var datatypes_1 = require("./datatypes");
__exportStar(require("./datatypes"), exports);
__exportStar(require("./types"), exports);
/*
 * convert parameter in "meta/query" from string representation to object representation
 */
function parseParamDefinition(defOrString, datatypes) {
    var def;
    if (typeof defOrString === 'string') {
        var splitted = defOrString.split(':');
        if (splitted.length === 1) {
            splitted = ['string', splitted[0]];
        }
        var datatype = datatypes[splitted[0]];
        def = {
            datatype: datatype,
            defaultValue: datatype.parseDefault(splitted[1])
        };
    }
    else {
        def = defOrString;
    }
    if (def.datatype === undefined) {
        def.datatype = datatypes['string'];
    }
    return def;
}
exports.parseParamDefinition = parseParamDefinition;
var _query = vue_1.reactive({
    query: {},
    rawQuery: {},
    enabled: true,
    serializedId: 0
});
var router;
var datatypes;
var debug = false;
var queryDefinition = null;
var querySettings = null;
var fingerprint = null;
var detailedFingerprint = {};
var watchers = {};
function dlog() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (debug) {
        console.log.apply(console, args);
    }
}
function prepareQuery(route) {
    var _queryDefinition = {};
    var _querySettings = {};
    // merge query definition from all matched segments on path
    route.matched.forEach(function (match) {
        if (!match.meta) {
            return;
        }
        if (match.meta.query) {
            Object.assign(_queryDefinition, match.meta.query);
        }
        if (match.meta.querySettings) {
            Object.assign(_querySettings, match.meta.querySettings);
        }
    });
    if (!_queryDefinition) {
        return false;
    }
    // parse param definitions
    Object.keys(_queryDefinition).forEach(function (key) {
        _queryDefinition[key] = parseParamDefinition(_queryDefinition[key], datatypes);
    });
    if (_querySettings.onInit) {
        _querySettings.onInit(_queryDefinition);
    }
    queryDefinition = _queryDefinition;
    querySettings = _querySettings;
    dlog('query definition, query settings', queryDefinition, querySettings);
    return true;
}
function serializeChangedValue(key, value) {
    dlog('serialize changed value', key, value);
    if (value !== undefined) {
        var def = queryDefinition[key];
        if (def) {
            value = def.datatype.serialize(value, def.defaultValue);
        }
    }
    saveValueToRawQuery(key, value);
}
function saveValueToRawQuery(key, value) {
    if (value === undefined) {
        if (key in _query.rawQuery) {
            delete _query.rawQuery[key];
            _query.serializedId++;
        }
        return;
    }
    var isNull = value === null;
    var isArray = !isNull && Array.isArray(value);
    if (!isNull) {
        if (isArray) {
            value = value.map(function (x) { return x.toString(); });
        }
        else {
            value = value.toString();
        }
    }
    if (!(key in _query.rawQuery)) {
        _query.rawQuery[key] = value;
        _query.serializedId++;
    }
    else {
        var modified = false;
        var oldValue = _query.rawQuery[key];
        if (oldValue === null) {
            modified = !isNull;
        }
        else if (Array.isArray(oldValue)) {
            if (!isArray) {
                modified = true;
            }
            else if (utils_1.arraysMatch(oldValue, value)) {
                modified = true;
            }
        }
        else if (isArray) {
            modified = true;
        }
        else if (value !== oldValue) {
            modified = true;
        }
        if (modified) {
            _query.rawQuery[key] = value;
            _query.serializedId++;
        }
    }
    dlog('Set to raw', key, value);
}
function setWatcher(key) {
    if (key in watchers) {
        return;
    }
    dlog('Adding watcher', key);
    watchers[key] = vue_1.watch(function () { return _query.query[key]; }, function (value) { return serializeChangedValue(key, value); });
}
function clearWatchers() {
    Object.values(watchers).forEach(function (watcher) { return watcher(); });
    watchers = {};
}
function handleRouteChange(to) {
    fingerprint = null;
    detailedFingerprint = {};
    Object.keys(_query.query).forEach(function (key) {
        delete _query.query[key];
    });
    queryDefinition = {};
    querySettings = {};
    clearWatchers();
    if (!prepareQuery(to)) {
        _query.enabled = false;
    }
    else {
        _query.enabled = true;
    }
}
function parseAndStoreQuery(query, actualDetailedFingerprint) {
    dlog('Parse and store query called with', query, actualDetailedFingerprint);
    for (var _i = 0, _a = Object.keys(query); _i < _a.length; _i++) {
        var key = _a[_i];
        if (detailedFingerprint[key] === actualDetailedFingerprint[key]) {
            continue;
        }
        var val = query[key];
        var def = queryDefinition[key];
        if (!def) {
            _query.query[key] = val;
        }
        else {
            _query.query[key] = def.datatype.parse(val, def.defaultValue);
        }
    }
    for (var _b = 0, _c = Object.keys(queryDefinition); _b < _c.length; _b++) {
        var key = _c[_b];
        if (key in _query.query) {
            continue;
        }
        var def = queryDefinition[key];
        var defVal = def.defaultValue;
        if (typeof defVal === 'function') {
            defVal = defVal();
        }
        _query.query[key] = defVal;
    }
    _query.rawQuery = __assign({}, query);
    if (querySettings.onLoad) {
        querySettings.onLoad(_query.query);
    }
}
function setup(_router, _datatypes, _debug) {
    router = _router;
    datatypes = _datatypes;
    debug = _debug;
    router.beforeEach(function (to, from) {
        if (to.name !== from.name) {
            handleRouteChange(to);
        }
        if (!_query.enabled) {
            return;
        }
        // check fingerprint if query modified
        var actualFingerprint = utils_1.queryFingerprint(to.query);
        if (actualFingerprint.fingerprint === fingerprint) {
            dlog('same fingerprint, not changing args');
            return;
        }
        dlog('parsing args', actualFingerprint);
        // parse and store query params
        parseAndStoreQuery(to.query, actualFingerprint.detailedFingerprint);
        // set up watchers
        for (var _i = 0, _a = Object.keys(_query.query); _i < _a.length; _i++) {
            var key = _a[_i];
            setWatcher(key);
        }
        // set fingerprint
        fingerprint = actualFingerprint.fingerprint;
        detailedFingerprint = actualFingerprint.detailedFingerprint;
    });
    vue_1.watch(function () { return _query.serializedId; }, function () {
        // no need to go through the parsing process again when router calls beforeEach,
        // so set the fingerprint
        var actualFingerprint = utils_1.queryFingerprint(_query.rawQuery);
        fingerprint = actualFingerprint.fingerprint;
        detailedFingerprint = actualFingerprint.detailedFingerprint;
        if (querySettings.onChange) {
            querySettings.onChange(_query.rawQuery, _query.query);
        }
        router.push({ query: _query.rawQuery });
    });
}
function define(key, datatype, defaultValue) {
    queryDefinition[key] = {
        datatype: datatype,
        defaultValue: defaultValue
    };
    _query.query[key] = datatype.parse(_query.rawQuery[key], defaultValue);
    setWatcher(key);
    dlog('Defined new key', key);
}
function as_array(key, datatype) {
    if (!(key in _query.query)) {
        define(key, datatype || datatypes_1.ArrayDatatype, []);
    }
    var arr = _query.query[key] || [];
    if (!Array.isArray(arr)) {
        return [arr];
    }
    else {
        return __spreadArrays(arr);
    }
}
function addValue(key, value, datatype) {
    var arr = as_array(key, datatype);
    var idx = arr.indexOf(value);
    if (idx < 0) {
        arr.push(value);
    }
    _query.query[key] = arr;
}
function removeValue(key, value, datatype) {
    var arr = as_array(key, datatype);
    var idx = arr.indexOf(value);
    if (idx >= 0) {
        arr.splice(idx, 1);
    }
    _query.query[key] = arr;
}
var handler = {
    set: function (target, prop, value) {
        if (!(prop in target)) {
            define(prop, datatypes_1.StringDatatype, '');
        }
        target[prop] = value;
        return true;
    },
    get: function (target, prop) {
        if (prop === 'define') {
            return define;
        }
        if (prop === 'addValue') {
            return addValue;
        }
        if (prop === 'removeValue') {
            return removeValue;
        }
        if (prop === '__definition') {
            return queryDefinition;
        }
        return target[prop];
    }
};
var proxiedQuery = new Proxy(_query.query, handler);
function useQuery() {
    return proxiedQuery;
}
exports.useQuery = useQuery;
function useRawQuery() {
    return _query;
}
exports.useRawQuery = useRawQuery;
exports["default"] = {
    install: function (app, _a) {
        var router = _a.router, datatypes = _a.datatypes, debug = _a.debug;
        setup(router, __assign({ 'string': datatypes_1.StringDatatype, 'bool': datatypes_1.BoolDatatype, 'int': datatypes_1.IntDatatype, 'array': datatypes_1.ArrayDatatype, 'commaarray': datatypes_1.CommaArrayDatatype, 'spacearray': datatypes_1.SpaceArrayDatatype }, (datatypes || {})), debug || false);
        app.config.globalProperties.$query = useQuery();
    }
};
