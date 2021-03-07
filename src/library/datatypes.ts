import {arraysMatch} from './utils'
import {DataType} from "./types";

/**
 * Parses URL parameter as string
 */
export const StringDatatype: DataType<string> = {
    name: 'string',
    parseDefault(value) {
        return value || ''
    },
    parse(value, defaultValue): string {
        if (value === undefined) {
            return defaultValue
        }
        if (!value) {
            return ''
        }
        if (typeof value === 'string') {
            return value
        }
        console.error('Incorrect variable for parameter, expecting string, got', value)
        return defaultValue
    },
    serialize(value, defaultValue) {
        if (value === null || value === undefined || (value === '' && !defaultValue)) {
            return undefined
        }
        return value === defaultValue ? undefined : value
    }
}

/**
 * Interprets URL parameter as integer
 */
export const IntDatatype: DataType<number> = {
    name: 'int',
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
        const parsedValue = parseInt(value.toString())
        if (isNaN(parsedValue)) {
            return defaultValue
        }
        return parsedValue
    },
    serialize(value, defaultValue) {
        if (value === null || value === undefined) {
            return undefined
        }
        value = parseInt((value || 0).toString())
        return value === defaultValue ? undefined : value.toString()
    }
}

/**
 * Interprets URL parameter as boolean. If the parameter is present the value is true, false otherwise
 */
export const BoolDatatype: DataType<boolean> = {
    name: 'bool',
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

/**
 * Interprets URL parameter as an array of strings, that is the parameter might be present multiple times
 */
export const ArrayDatatype: DataType<string[]> = {
    name: 'array',
    parseDefault(value) {
        if (value === undefined) {
            return () => []
        }
        if (typeof value === 'string') {
            if (value !== '') {
                return () => [value]
            } else {
                return () => []
            }
        }
        return () => [...(value as string[] || [])]
    },
    parse(value, defaultValue): string[] {
        if (value === undefined) {
            return (defaultValue || []).slice()
        }
        if (typeof value === 'string') {
            return [value]
        }
        if (!value) {
            return []
        }
        return value.filter(x => x !== null) as string[]
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

/**
 * Helper function to generate a new datatype that is an array of strings but serialized within one
 * param=value url parameter with values separated by the given separator
 */
export function separatedArrayDatatype(separator: string) {
    const dt: DataType<string[]> = {
        name: `separated_array_${separator}`,
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
        parse(value, defaultValue): string[] {
            if (value === undefined) {
                return (defaultValue || []).slice()
            }
            if (typeof value === 'string') {
                if (value === '') {
                    return []
                }
                return value.split(separator)
            }
            if (!value) {
                return []
            }
            return value.filter(x => x !== null) as string[]
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
    return dt
}

/**
 * parses param=v1,v2,v3,... into [v1,v2,v3] string array
 */
export const CommaArrayDatatype = separatedArrayDatatype(',')

/**
 * parses param=v1%20v2%20v3... into [v1,v2,v3] string array
 */
export const SpaceArrayDatatype = separatedArrayDatatype(' ')
