---
name: icon-update
description: 根据给出iconfont下载文件夹去更新我的icon信息
---

# 更新逻辑说明

## iconfont 下载文件夹结构
/
├── demo_index.html      # 演示页面 (24K)
├── demo.css             # 演示样式 (8.2K)
├── iconfont.css         # 字体样式文件 (1.4K)
├── iconfont.js          # JavaScript 版本 (23K)
├── iconfont.json        # 图标配置信息 (3.5K)
├── iconfont.ttf         # TrueType 字体 (5.6K)
├── iconfont.woff        # Web 字体格式 (3.3K)
└── iconfont.woff2       # Web 字体格式2 (2.7K)

### 关键文件 iconfont.json
```json
{
  "id": "5127762",
  "name": "noted",
  "font_family": "iconfont",
  "css_prefix_text": "icon-",
  "description": "",
  "glyphs": [
    {
      "icon_id": "46919908",
      "name": "delete",
      "font_class": "delete",
      "unicode": "#xe604",
      "unicode_decimal": 59062
    }
    ...
  ]
}

```

## 通过iconfont下载文件夹结构信息 创建或更新icon.vue文件；同时更新static/iconfont.woff2 文件

src/component/icon.vue 基础示例如下
```vue
<template>
    <text class="me-font">{{ icon }}</text>
</template>

<script lang="ts" setup>
// created by zhuxietong on 2026-02-25 16:52
import { ref, watch } from "vue";

let IconMap = {
    delete: "&#xe604;",
};

type IconName = keyof typeof IconMap;

const props = defineProps<{
    name: IconName;
}>();

let value = IconMap[props.name] || "&#xe68f;";
value = value.replace("&#x", "%u").replace(";", "");
value = unescape(value);
const icon = ref(value);

watch(
    () => props.name,
    (val) => {
        let iconStr = IconMap[val];
        iconStr = iconStr.replace("&#x", "%u").replace(";", "");
        iconStr = unescape(iconStr);
        icon.value = iconStr;
    },
);
</script>

<style lang="scss">
@font-face {
    font-family: "iconfont";
    /*  #ifdef  H5 */
    src: url("/static/iconfont.woff2") format("woff2");
    /*  #endif  */
    /* #ifdef  MP-WEIXIN */
    src: url("/static/iconfont.woff2") format("woff2");
    /* #endif */
    /*  #ifdef  APP-PLUS */
    src: url("/static/iconfont.woff2") format("woff2");
    /*  #endif  */
}

.me-font {
    font-family: iconfont;
    text-align: center;
    line-height: 1;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}
</style>
```

（1）创建更新src/component/icon.vue 文件，文件中 IconMap 来自于iconfont.json中 glyphs 下的name，unicode 项；注意按照基础示例中IconMap 的值前面须添加'&'前置字符

（2）更新的后同时将iconfont.woff2文件拷贝跟新到src/static/ 文件夹下
