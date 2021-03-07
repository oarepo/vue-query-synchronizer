import {LocationQuery, Router} from "vue-router";

/**
 * @internal
 */
export interface QueryParameterDefinition<T> {
    datatype: DataType<T>;
    defaultValue: T
}

/**
 * @internal
 */
export type QueryParameterDefinitions = {
    [key: string]: QueryParameterDefinition<any>
}

/**
 * DataType - converter for values in URL.
 *
 * Converts string value from url into javascript representation (for example, a number) and vice versa
 *
 * @typeParam T a typescript type to which the url parameter is converted to
 */
export interface DataType<T> {
    /**
     * data type's name, for example `int`. This is the key that is present in route's meta before ':'
     */
    name: string,

    /**
     * Parse default value from the configuration. For example, if the configuration is `int:1`,
     * the datatype is `int` and the default value `1`. This function takes the default value
     * and returns the javascript value (of type T)
     *
     * @param value the default value to be parsed
     * @return Either the default value or a function producing
     * the default value (for modifiable types, such as empty array -
     * so that it stays empty whenever default value is passed)
     */
    parseDefault(value: string): T | (() => T),

    /**
     * Parses value from the url
     *
     * @param value         value as found in the url. Might be a single string (if the parameter is present once)
     *                      or an array of strings (if the argument is present multiple times)
     *                      It might be also null (or string of nulls), if the argument does not have
     *                      a value (`...?strict&strict&strict`)
     * @param defaultValue  the default value previously parsed via `parseDefault`
     */
    parse(value: string | (string | null)[] | null, defaultValue: T): T,


    /**
     * Serializes the value to string, array of string, null or undefined.
     *
     * @param value             javascript value
     * @param defaultValue      value that will be put to url
     * @return
     * * `undefined`  if the parameter should be removed from url (for example, is equal to the default value)
     * * `null`       if the parameter should be put to url without a value (for example ?strict)
     * * `string`     `param=string` will be put to url query
     * * `string[]`   `param=string[0]&param=string[1]...` will be put to url query
     */
    serialize(value: T, defaultValue: T): string | string[] | undefined | null
}

/**
 * A dictionary of datatypes
 * @internal
 */
export type DataTypes = {
    [key: string]: DataType<any>
}

/**
 * Query returned by useQuery() is not only an object with parsed query parameters,
 * but contains several helper methods defined in this mixin.
 */
export type ParsedQueryMixin = {
    /**
     * Dynamically add a new query parameter. If the parameter is already known,
     * its datatype will be replaced and the parameter will be parsed again.
     *
     * @param key               name of the URL parameter
     * @param datatype          datatype of the parameter
     * @param defaultValue      the default value
     */
    define(key: string, datatype: DataType<any>, defaultValue: any): void,

    /**
     * Adds a value to array parameter, making sure that it is added only once
     *
     * @param key               name of the URL parameter
     * @param value             the value
     * @param datatype          optional datatype, used only if the parameter's datatype is not yet an array
     */
    addValue(key: string, value: any, datatype?: DataType<any>): void,

    /**
     * Removes a value from array parameter
     *
     * @param key               name of the URL parameter
     * @param value             the value
     * @param datatype          optional datatype, used only if the parameter's datatype is not yet an array
     */
    removeValue(key: string, value: any, datatype?: DataType<any>): void,

    /**
     * @internal
     */
    __definition: QueryParameterDefinitions
}

/**
 * If not defined otherwise, the returned query is of this generic type
 */
export type GenericParsedQuery = {
    [key: string]: string | number | string[] | number[] | boolean | any,
}

/**
 * This is the type of the return value of useQuery() if not specified otherwise
 */
export interface ParsedQuery extends ParsedQueryMixin, GenericParsedQuery {
}

/**
 * User can type the result of useQuery with his own type. In this case the return value
 * is TypedParsedQuery<T>
 */
export type TypedParsedQuery<T> = ParsedQueryMixin & T


/**
 * Callback methods called when query is initialized, URL parameters parsed or serialized.
 * See readme for details
 */
export interface QuerySettings {
    onInit?: (paramList: QueryParameterDefinitions) => void,
    onLoad?: (query: ParsedQuery) => void,
    onChange?: (newQuery: LocationQuery, query: ParsedQuery) => void
}

/**
 * @internal
 */
export interface DetailedFingerprint {
    [key: string]: string | null
}


export type NavigationOperation = 'replace' | 'push' | (
    (query: ParsedQuery, router: Router) => 'push' | 'replace'
    )
