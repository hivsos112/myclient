Ext.define('MyApp.store.Menus', {
    extend: 'Ext.data.TreeStore',

    root: {
        text: '功能菜单',
        expanded: true,
        children: [{
            text: '监控信息',
            expanded: true,
            children: [{
                leaf: true,
                text: 'CPU使用率',
                script: "MyApp.view.chart.SystemCpuUsage"
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
            text: '模版解析',
            expanded: true,
            children: [{
                leaf: true,
                text: '模板一',
                template: 'template_1'
            }]
        }]
    }
});