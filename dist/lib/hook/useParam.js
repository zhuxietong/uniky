import { onLoad } from '@dcloudio/uni-app';
import { onMounted, ref } from 'vue';
export const useParam = (callBack) => {
    const query = ref({});
    const json = ref({});
    const param = ref({});
    onLoad((op) => {
        let jsonObj = {};
        let queryObj = {};
        if (!op || Object.keys(op).length === 0) {
            param.value = {};
            query.value = {};
            json.value = {};
            callBack?.({ option: {}, query: {}, json: {} });
            return;
        }
        const decodedOp = {};
        for (const key in op) {
            if (typeof op[key] === 'string') {
                if (key === 'json') {
                    try {
                        decodedOp[key] = JSON.parse(decodeURIComponent(op[key]));
                        jsonObj = decodedOp[key];
                        json.value = jsonObj;
                    }
                    catch (e) { }
                    continue;
                }
                decodedOp[key] = decodeURIComponent(op[key]);
            }
            else {
                decodedOp[key] = op[key];
            }
        }
        try {
            queryObj = { ...decodedOp };
            delete queryObj.json;
            query.value = queryObj;
        }
        catch (e) { }
        param.value = { ...jsonObj, ...queryObj };
        callBack?.({ option: param.value, query: query.value, json: json.value });
    });
    return {
        query,
        param,
        json,
    };
};
export const useMountedLoad = (callBack) => {
    const query = ref({});
    const json = ref({});
    const param = ref({});
    onLoad((op) => {
        let jsonObj = {};
        let queryObj = {};
        if (!op || Object.keys(op).length === 0) {
            param.value = {};
            query.value = {};
            json.value = {};
            return;
        }
        const decodedOp = {};
        for (const key in op) {
            if (typeof op[key] === 'string') {
                if (key === 'json') {
                    try {
                        decodedOp[key] = JSON.parse(decodeURIComponent(op[key]));
                        jsonObj = decodedOp[key];
                        json.value = jsonObj;
                    }
                    catch (e) { }
                    continue;
                }
                decodedOp[key] = decodeURIComponent(op[key]);
            }
            else {
                decodedOp[key] = op[key];
            }
        }
        try {
            queryObj = { ...decodedOp };
            delete queryObj.json;
            query.value = queryObj;
        }
        catch (e) { }
        param.value = { ...jsonObj, ...queryObj };
    });
    onMounted(() => {
        callBack?.({
            option: (param.value || {}),
            query: (query.value || {}),
            json: (json.value || {})
        });
    });
    return {
        query,
        param,
        json,
    };
};
//# sourceMappingURL=useParam.js.map