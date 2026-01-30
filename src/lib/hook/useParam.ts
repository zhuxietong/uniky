import { onLoad } from '@dcloudio/uni-app'
import { onMounted, ref } from 'vue'

export const useParam = <Q extends object = {}, J extends object = {}>(
  callBack?: (params: { option: Partial<Q & J>; query: Partial<Q>; json: Partial<J> }) => void,
) => {
  const query = ref<Partial<Q>>({})
  const json = ref<Partial<J>>({})
  const param = ref<Partial<Q & J>>({})

  onLoad((op?: AnyObject) => {
    let jsonObj: any = {}
    let queryObj: any = {}

    if (!op || Object.keys(op).length === 0) {
      param.value = {} as any
      query.value = {} as any
      json.value = {} as any
      callBack?.({ option: {} as any, query: {} as any, json: {} as any })
      return
    }

    const decodedOp: { [k: string]: any } = {}
    for (const key in op) {
      if (typeof op[key] === 'string') {
        if (key === 'json') {
          try {
            decodedOp[key] = JSON.parse(decodeURIComponent(op[key]))
            jsonObj = decodedOp[key]
            json.value = jsonObj
          } catch (e) {}
          continue
        }
        decodedOp[key] = decodeURIComponent(op[key])
      } else {
        decodedOp[key] = op[key]
      }
    }

    try {
      queryObj = { ...decodedOp }
      delete queryObj.json
      query.value = queryObj
    } catch (e) {}

    param.value = { ...jsonObj, ...queryObj }
    callBack?.({ option: param.value as any, query: query.value as any, json: json.value as any })
  })

  return {
    query,
    param,
    json,
  }
}

export const useMountedLoad = <Q extends object = {}, J extends object = {}>(
  callBack?: (params: { option: Partial<Q & J>; query: Partial<Q>; json: Partial<J> }) => void,
) => {
  const query = ref<Partial<Q>>({})
  const json = ref<Partial<J>>({})
  const param = ref<Partial<Q & J>>({})

  onLoad((op?: AnyObject) => {
    let jsonObj: any = {}
    let queryObj: any = {}

    if (!op || Object.keys(op).length === 0) {
      param.value = {} as any
      query.value = {} as any
      json.value = {} as any
      return
    }

    const decodedOp: { [k: string]: any } = {}
    for (const key in op) {
      if (typeof op[key] === 'string') {
        if (key === 'json') {
          try {
            decodedOp[key] = JSON.parse(decodeURIComponent(op[key]))
            jsonObj = decodedOp[key]
            json.value = jsonObj
          } catch (e) {}
          continue
        }
        decodedOp[key] = decodeURIComponent(op[key])
      } else {
        decodedOp[key] = op[key]
      }
    }

    try {
      queryObj = { ...decodedOp }
      delete queryObj.json
      query.value = queryObj
    } catch (e) {}

    param.value = { ...jsonObj, ...queryObj }
  })

  onMounted(() => {
    callBack?.({
      option: (param.value || {}) as any,
      query: (query.value || {}) as any,
      json: (json.value || {}) as any
    })
  })

  return {
    query,
    param,
    json,
  }
}