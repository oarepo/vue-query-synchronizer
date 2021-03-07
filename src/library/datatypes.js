"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.SpaceArrayDatatype = exports.CommaArrayDatatype = exports.separatedArrayDatatype = exports.ArrayDatatype = exports.BoolDatatype = exports.IntDatatype = exports.StringDatatype = void 0;
var utils_1 = require("./utils");
exports.StringDatatype = {
    name: 'string',
    parseDefault: function (value) {
        return value || '';
    },
    parse: function (value, defaultValue) {
        if (value === undefined) {
            return defaultValue;
        }
        if (!value) {
            return '';
        }
        if (typeof value === 'string') {
            return value;
        }
        console.error('Incorrect variable for parameter, expecting string, got', value);
        return defaultValue;
    },
    serialize: function (value, defaultValue) {
        if (value === null || value === undefined || (value === '' && !defaultValue)) {
            return undefined;
        }
        return value === defaultValue ? undefined : value;
    }
};
exports.IntDatatype = {
    name: 'int',
    parseDefault: function (value) {
        if (value.length) {
            return parseInt(value);
        }
        return 0;
    },
    parse: function (value, defaultValue) {
        if (value === undefined || value === null) {
            return defaultValue;
        }
        var parsedValue = parseInt(value.toString());
        if (isNaN(parsedValue)) {
            return defaultValue;
        }
        return parsedValue;
    },
    serialize: function (value, defaultValue) {
        if (value === null || value === undefined) {
            return undefined;
        }
        value = parseInt((value || 0).toString());
        return value === defaultValue ? undefined : value.toString();
    }
};
exports.BoolDatatype = {
    name: 'bool',
    parseDefault: function (value) {
        return (value === '1' || value === 'true');
    },
    parse: function (value, defaultValue) {
        if (value === undefined) {
            return defaultValue || false;
        }
        return true;
    },
    serialize: function (value, defaultValue) {
        if (value === undefined) {
            return undefined;
        }
        if (value && value !== defaultValue) {
            return null;
        }
        return undefined;
    }
};
exports.ArrayDatatype = {
    name: 'array',
    parseDefault: function (value) {
        if (value === undefined) {
            return function () { return []; };
        }
        if (typeof value === 'string') {
            if (value !== '') {
                return function () { return [value]; };
            }
            else {
                return function () { return []; };
            }
        }
        return function () { return __spreadArrays((value || [])); };
    },
    parse: function (value, defaultValue) {
        if (value === undefined) {
            return (defaultValue || []).slice();
        }
        if (typeof value === 'string') {
            return [value];
        }
        if (!value) {
            return [];
        }
        return value.filter(function (x) { return x !== null; });
    },
    serialize: function (value, defaultValue) {
        if (value === null || value === undefined || value.length === 0) {
            return undefined;
        }
        if (utils_1.arraysMatch(value, defaultValue)) {
            return undefined;
        }
        if (value.length === 1) {
            return value[0];
        }
        return value;
    }
};
function separatedArrayDatatype(separator) {
    var dt = {
        name: "separated_array_" + separator,
        parseDefault: function (value) {
            if (value === undefined) {
                return [];
            }
            if (typeof value === 'string') {
                if (value === '') {
                    return [];
                }
                return value.split(separator);
            }
            return value || [];
        },
        parse: function (value, defaultValue) {
            if (value === undefined) {
                return (defaultValue || []).slice();
            }
            if (typeof value === 'string') {
                if (value === '') {
                    return [];
                }
                return value.split(separator);
            }
            if (!value) {
                return [];
            }
            return value.filter(function (x) { return x !== null; });
        },
        serialize: function (value, defaultValue) {
            if (value === null || value === undefined || value.length === 0) {
                return undefined;
            }
            if (utils_1.arraysMatch(value, defaultValue)) {
                return undefined;
            }
            return value.join(separator);
        }
    };
    return dt;
}
exports.separatedArrayDatatype = separatedArrayDatatype;
exports.CommaArrayDatatype = separatedArrayDatatype(',');
exports.SpaceArrayDatatype = separatedArrayDatatype(' ');
