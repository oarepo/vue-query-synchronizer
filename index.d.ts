import Vue from 'vue'

declare module 'vue/types/vue' {
  interface Vue {
    $query: any
    $rawQuery: any
  }
}


declare module "@oarepo/vue-query-synchronizer" {
    import Router from "vue-router";
    import {PluginObject} from "vue";

    interface VueQuerySynchronizerOptions {
        router: Router;
        debug?: boolean;
    }

    const VueQuerySynchronizerObject: PluginObject<VueQuerySynchronizerOptions>;

    interface Datatype<T> {
        parseDefault: (value: undefined | null | string) => T;
        parse: (value: undefined | null | string, defaultValue: T, parsingDefaultValue?: boolean) => T;
        serialize: (value: T, defaultValue: T) => undefined | null | string;
    }

    const ArrayDatatype: Datatype<any[]>;
    const BoolDatatype: Datatype<boolean>;
    const IntDatatype: Datatype<number>;
    const StringDatatype: Datatype<string>;
    const CommaArrayDatatype: Datatype<any[]>;
    const SpaceArrayDatatype: Datatype<any[]>;

    export {
        VueQuerySynchronizerObject as default,
        ArrayDatatype, BoolDatatype, IntDatatype, StringDatatype,
        CommaArrayDatatype, SpaceArrayDatatype
    };
}
