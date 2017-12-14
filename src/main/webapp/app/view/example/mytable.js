Ext.define('MyApp.view.example.mytable', {
    extend: 'MyApp.view.base.BaseModule',
    initPanel: function () {
        var id = Ext.id(null, "vue-comp-");
        this.tempId = id;
        var tpl = this.getTemplate();
        console.log(tpl);
        var div = document.createElement('div');
        div.id = id;
        div.innerHTML = tpl;
        var panel = Ext.create("Ext.panel.Panel", {
            html: div.outerHTML
        });
        this.panel = panel;
        panel.on("afterrender", this.onReady, this);
        return panel;
    },
    getTemplate: function () {
        var url = "app.view.example.mytable";
        url = url.replace(/[.]/gi, "/");
        url = $env.resourcesHome + url + ".vue";
        var response = Ext.Ajax.request({
            url: url,
            async: false,
            method: "GET"
        });
        if (response.status > 200) {
            if (response.status === 403) {
                Ext.Msg.alert("警告", "服务状态错误,请重新登录!");
                return;
            }
            Ext.Msg.alert("错误", response.statusText);
            return;
        }
        return response.responseText;
    },
    onReady: function () {
        var me = this;
        var cfg = {
            el: '#' + this.tempId,
            data: function () {
                return me.loadData();
            },
            methods: this.getMethods()
        };
        this.vue = new Vue(cfg);
    },
    loadData: function () {
        return {
            tableData: [{
                date: '2016-05-02',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1518 弄',
                tag: '家'
            }, {
                date: '2016-05-04',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1517 弄',
                tag: '公司'
            }, {
                date: '2016-05-01',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1519 弄',
                tag: '家'
            }, {
                date: '2016-05-03',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1516 弄',
                tag: '公司'
            }]
        }
    },
    getMethods: function () {
        return {
            open: function () {
                //const h = this.vue.$createElement
                // Msg.info("Form表单数据:" + Ext.encode(this.form.getForm().getValues()));
                this.$notify({
                    title: '标题名称',
                    message: "这里是提示信息，这里是提示信息这里是提示信息"
                });
            },
            formatter: function(row, column) {
                return row.address;
            },
            filterTag: function(value, row) {
                return row.tag === value;
            },
            handleEdit: function(index, row) {
                console.log(index, row);
            },
            handleDelete: function(index, row) {
                console.log(index, row);
            }
        }
    }

})
;


