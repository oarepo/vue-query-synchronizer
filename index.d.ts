declare module "@oarepo/vue-query-synchronizer" {
    import Router, {Route} from "vue-router";
    import {PluginObject} from "vue";

    export interface VueQuerySynchronizerOptions {
        router: Router;
        debounce?: number;
    }

    const VueQuerySynchronizerObject: PluginObject<VueQuerySynchronizerOptions>;

    interface Datatype<T> {
        parse: (value: undefined | null | string, defaultValue: T, parsingDefaultValue?: boolean) => T;
        serialize: (value: T, defaultValue: T) => undefined | null | string;
    }

    const ArrayDatatype: Datatype<any[]>;
    const BoolDatatype: Datatype<boolean>;
    const NumberDatatype: Datatype<number>;
    const StringDatatype: Datatype<string>;

    type Param = string | { datatype?: string, [key: string]: any };
    type MakerFunction = (route: Route) => { [key: string]: any };
    const query: (
        paramsList: Param[],
        extraParams: { [key: string]: any } | ((route: Route) => { [key: string]: any }),
        // options?: QueryOptions,
    ) => MakerFunction;

    export {
        VueQuerySynchronizerObject as default,
        ArrayDatatype, BoolDatatype, NumberDatatype, StringDatatype,
        query,
    };
}
