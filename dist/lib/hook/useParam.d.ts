export declare const useParam: <Q extends object = {}, J extends object = {}>(callBack?: (params: {
    option: Partial<Q & J>;
    query: Partial<Q>;
    json: Partial<J>;
}) => void) => {
    query: [Partial<Q>] extends [import("vue").Ref<any, any>] ? import("@vue/shared").IfAny<import("vue").Ref<any, any> & Partial<Q>, import("vue").Ref<import("vue").Ref<any, any> & Partial<Q>, import("vue").Ref<any, any> & Partial<Q>>, import("vue").Ref<any, any> & Partial<Q>> : import("vue").Ref<import("vue").UnwrapRef<Partial<Q>>, Partial<Q> | import("vue").UnwrapRef<Partial<Q>>>;
    param: [Partial<Q & J>] extends [import("vue").Ref<any, any>] ? import("@vue/shared").IfAny<import("vue").Ref<any, any> & Partial<Q & J>, import("vue").Ref<import("vue").Ref<any, any> & Partial<Q & J>, import("vue").Ref<any, any> & Partial<Q & J>>, import("vue").Ref<any, any> & Partial<Q & J>> : import("vue").Ref<import("vue").UnwrapRef<Partial<Q & J>>, Partial<Q & J> | import("vue").UnwrapRef<Partial<Q & J>>>;
    json: [Partial<J>] extends [import("vue").Ref<any, any>] ? import("@vue/shared").IfAny<import("vue").Ref<any, any> & Partial<J>, import("vue").Ref<import("vue").Ref<any, any> & Partial<J>, import("vue").Ref<any, any> & Partial<J>>, import("vue").Ref<any, any> & Partial<J>> : import("vue").Ref<import("vue").UnwrapRef<Partial<J>>, Partial<J> | import("vue").UnwrapRef<Partial<J>>>;
};
export declare const useMountedLoad: <Q extends object = {}, J extends object = {}>(callBack?: (params: {
    option: Partial<Q & J>;
    query: Partial<Q>;
    json: Partial<J>;
}) => void) => {
    query: [Partial<Q>] extends [import("vue").Ref<any, any>] ? import("@vue/shared").IfAny<import("vue").Ref<any, any> & Partial<Q>, import("vue").Ref<import("vue").Ref<any, any> & Partial<Q>, import("vue").Ref<any, any> & Partial<Q>>, import("vue").Ref<any, any> & Partial<Q>> : import("vue").Ref<import("vue").UnwrapRef<Partial<Q>>, Partial<Q> | import("vue").UnwrapRef<Partial<Q>>>;
    param: [Partial<Q & J>] extends [import("vue").Ref<any, any>] ? import("@vue/shared").IfAny<import("vue").Ref<any, any> & Partial<Q & J>, import("vue").Ref<import("vue").Ref<any, any> & Partial<Q & J>, import("vue").Ref<any, any> & Partial<Q & J>>, import("vue").Ref<any, any> & Partial<Q & J>> : import("vue").Ref<import("vue").UnwrapRef<Partial<Q & J>>, Partial<Q & J> | import("vue").UnwrapRef<Partial<Q & J>>>;
    json: [Partial<J>] extends [import("vue").Ref<any, any>] ? import("@vue/shared").IfAny<import("vue").Ref<any, any> & Partial<J>, import("vue").Ref<import("vue").Ref<any, any> & Partial<J>, import("vue").Ref<any, any> & Partial<J>>, import("vue").Ref<any, any> & Partial<J>> : import("vue").Ref<import("vue").UnwrapRef<Partial<J>>, Partial<J> | import("vue").UnwrapRef<Partial<J>>>;
};
//# sourceMappingURL=useParam.d.ts.map