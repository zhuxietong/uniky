---
name: create-page
description: 根据给出路径去创建一个uni-app 的页面
---

# 创建页面流程逻辑说明

## 项目基础
该项目是uni-app的项目

## 什么时候创建页面
当给出页面路径时使用改路径去创建页面的vue文件，同时在src/pages.json文件中添加页面路由配置
例如给我给出 pages/demo/index 时
（1）为我在 src/pages/demo 路径下创建 index.vue 作为页面文件
（2）在src/pages.json 中添加页面信息，

```jsonc
{
  "pages":[
    {
			"path": "pages/demo/index",
			"style": "style": {
           "navigationBarTitleText": "示例首页",
           "navigationStyle": "default",
           "backgroundColor": "#f8f8f8",
           "navigationBarBackgroundColor": "#f8f8f8"
         }
   }
  ]
}
```

如果路径以`pages-`开头， 例如pages-order/list/query则作为子报添加到 subPackages 子模块中

```jsonc
{
  "subPackages":[
    {
          "root": "pages-order",
          "pages": [
            {
              "path": "list/query",
              "style": {
                "navigationBarTitleText": "订单查询",
                "navigationStyle": "default",
                "backgroundColor": "#FFFFFF"
              }
            }
          ]
        }
      ],
  ]
}
```
