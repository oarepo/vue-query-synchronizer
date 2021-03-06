import {LocationQuery} from "vue-router";

export interface QueryParameterDefinition<T> {
    datatype: DataType<T>;
    defaultValue: T
}

export type QueryParameterDefinitions = {
    [key: string]: QueryParameterDefinition<any>
}

export interface DataType<T> {
    name: string,

    parseDefault(value: string): T | (() => T),

    parse(value: string | string[], defaultValue: T): T,

    serialize(value: T, defaultValue: T): string | string[]
}

export type DataTypes = {
    [key: string]: DataType<any>
}

export type ParsedQuery = {
    [key: string]: string | number | string[] | number[] | boolean | any,
    define(key: string, datatype: DataType<any>, defaultValue: any): void,
    addValue(key: string, value: any, datatype: DataType<any>): void,
    removeValue(key: string, value: any, datatype: DataType<any>): void,
    __definition: QueryParameterDefinitions
}

export interface QuerySettings {
    onInit?: (paramList: QueryParameterDefinitions) => void,
    onLoad?: (query: any) => void,
    onChange?: (newQuery: LocationQuery, query: ParsedQuery) => void
}

export interface DetailedFingerprint {
    [key: string]: string
}
