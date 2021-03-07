import {arraysMatch} from './utils'
import {DataType} from "./types";

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

export const CommaArrayDatatype = separatedArrayDatatype(',')
export const SpaceArrayDatatype = separatedArrayDatatype(' ')
