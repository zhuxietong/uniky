<template>
    <text class="me-font">{{ icon }}</text>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";

let IconMap = {
    delete: "&#xe604;",
    addFill: "&#xe606;",
};

type IconName = keyof typeof IconMap;

const props = defineProps<{
    name: IconName;
}>();

let value = IconMap[props.name] || "&#xe604;";
value = value.replace("&#x", "%u").replace(";", "");
value = unescape(value);
const icon = ref(value);

watch(
    () => props.name,
    (val) => {
        let iconStr = IconMap[val];
        iconStr = iconStr.replace("&#x", "%u").replace(";", "");
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
    src: url("/h5/static/iconfont.woff2") format("woff2");
    /*  #endif  */
    /* #ifdef  MP-WEIXIN */
    //src: url('//at.alicdn.com/t/c/font_2942740_av9lw25yela.woff2?t=1707276070685') format('woff2');
    src: url("/static/iconfont.woff2") format("woff2");

    /* #endif */
    /*  #ifdef  APP-PLUS */
    src: url("/static/iconfont.woff2") format("woff2");
    /*  #endif  */
}

/*!* 在线链接服务仅供平台体验和调试使用，平台不承诺服务的稳定性，企业客户需下载字体包自行发布使用并做好备份。 *!*/
/*@font-face {*/
/*  font-family: 'iconfont';  !* Project id 2942740 *!*/
/*  src: url('//at.alicdn.com/t/c/font_2942740_oa0mdid0yx.woff2?t=1694135753186') format('woff2');*/
/*}*/

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
