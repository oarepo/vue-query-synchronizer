"use strict";
exports.__esModule = true;
exports.queryFingerprint = exports.arraysMatch = exports.isObject = void 0;
function isObject(obj) {
    var type = typeof obj;
    return type === 'function' || (type === 'object' && !!obj);
}
exports.isObject = isObject;
// https://gomakethings.com/how-to-check-if-two-arrays-are-equal-with-vanilla-js/
function arraysMatch(arr1, arr2) {
    // Check if the arrays are the same length
    if (arr1.length !== arr2.length)
        return false;
    // Check if all items exist and are in the same order
    for (var i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i])
            return false;
    }
    // Otherwise, return true
    return true;
}
exports.arraysMatch = arraysMatch;
// adapted from vue router to be always
// the same regardless of order of defined keys
function queryFingerprint(query) {
    var fingerprint = '';
    var detailedFingerprint = {};
    for (var _i = 0, _a = Object.keys(query).sort(); _i < _a.length; _i++) {
        var key = _a[_i];
        var value = query[key];
        key = encodeURIComponent(key);
        if (value == null) {
            fingerprint += '&' + key;
            detailedFingerprint[key] = null;
            continue;
        }
        // keep null values
        var values = Array.isArray(value)
            ? value.map(function (v) { return v && encodeURIComponent(v); })
            : [value && encodeURIComponent(value)];
        values.sort();
        var valueFingerprint = '';
        for (var i = 0; i < values.length; i++) {
            valueFingerprint += '&' + key;
            if (values[i] != null) {
                valueFingerprint += ('=' + values[i]);
            }
        }
        fingerprint += valueFingerprint;
        detailedFingerprint[key] = valueFingerprint;
    }
    return { fingerprint: fingerprint, detailedFingerprint: detailedFingerprint };
}
exports.queryFingerprint = queryFingerprint;
