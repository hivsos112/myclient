Ext.define('MyApp.store.Menus', {
    extend: 'Ext.data.TreeStore',

    root: {
        text: '功能菜单',
        expanded: true,
        children: [{
            text: 'VUE嵌入',
            expanded: true,
            children: [{
                leaf: true,
                text: '提示信息',
                script: "MyApp.view.example.vueform"
            }, {
                leaf: true,
                text: '简单列表',
                script: "MyApp.view.example.mytable"
            }, {
                leaf: true,
                text: '动态数据列表',
                script: "MyApp.view.example.dynTable"
            }

            ]

        }, {
            text: '基础表单',
            expanded: true,
            children: [{
                leaf: true,
                text: 'SimpleForm',
                script: "MyApp.view.example.myform"
            }, {
                leaf: true,
                text: 'TableForm',
                script: "MyApp.view.example.tableform"
            }

            ]

        }, {
            text: '基础列表',
            expanded: true,
            children: [{
                leaf: true,
                text: '普通列表',
                script: "MyApp.view.example.baselist"
            }, {
                leaf: true,
                text: '编辑列表',
                script: "MyApp.view.example.editlist"
            }]
        }, {
            text: 'Schema配置',
            expanded: true,
            children: [{
                leaf: true,
                text: '基础配置',
                script: "MyApp.view.config.SchemaConfigModule"
            }]
        }, {
            text: '布局管理',
            expanded: true,
            children: [{
                leaf: true,
                text: 'Border布局',
                script: "MyApp.view.layout.LayoutAssistant"
            }]
        }]
    }
});