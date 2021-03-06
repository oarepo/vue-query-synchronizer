import { arraysMatch } from '@/library/utils'

export const StringDatatype = {
    name: 'string',
    parseDefault (value) {
        return value || ''
    },
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
        if (value === null || value === undefined || (value === '' && !defaultValue)) {
            return undefined
        }
        return value === defaultValue ? undefined : value
    }
}

export const IntDatatype = {
    name: 'int',
    parseDefault (value) {
        if (value.length) {
            return parseInt(value)
        }
        return 0
    },
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
        if (value === null || value === undefined) {
            return undefined
        }
        value = parseInt(value || 0)
        return value === defaultValue ? undefined : value.toString()
    }
}

export const BoolDatatype = {
    name: 'bool',
    parseDefault (value) {
        return (value === '1' || value === 'true')
    },
    parse (value, defaultValue) {
        if (value === undefined) {
            return defaultValue || false
        }
        return true
    },
    serialize (value, defaultValue) {
        if (value === undefined) {
            return undefined
        }
        if (value && value !== defaultValue) {
            return null
        }
        return undefined
    }
}

export const ArrayDatatype = {
    name: 'array',
    parseDefault (value) {
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
        return () => [...(value || [])]
    },
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

export function separatedArrayDatatype (separator) {
    return {
        name: `separated_array_${separator}`,
        parseDefault (value) {
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
        parse (value, defaultValue) {
            if (value === undefined) {
                return (defaultValue || []).slice()
            }
            if (typeof value === 'string') {
                if (value === '') {
                    return []
                }
                return value.split(separator)
            }
            return value || []
        },
        serialize (value, defaultValue) {
            if (value === null || value === undefined || value.length === 0) {
                return undefined
            }
            if (arraysMatch(value, defaultValue)) {
                return undefined
            }
            return value.join(separator)
        }
    }
}

export const CommaArrayDatatype = separatedArrayDatatype(',')
export const SpaceArrayDatatype = separatedArrayDatatype(' ')
