Ext.define('MyApp.view.example.dynTable', {
    extend: 'MyApp.view.base.BaseModule',
    serviceId: "chis.config",
    method: "getTableData",
    entryName: "mpi_demographicinfo",
    initPanel: function () {
        var id = Ext.id(null, "vue-comp-");
        this.tempId = id;
        var tpl = this.getTemplate();
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
        var url = "app.view.example.dynTable";
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
        var height = Ext.Context.mainTab.getHeight() - 80;
        var cfg = {
            el: '#' + this.tempId,
            data: function () {
                return {tableData: [], tableHeight: height,headerStyle : function () {
                    return "background-color:#eef1f6;color:black";
                }};
            },
            methods: this.getMethods()
        };
        this.vue = new Vue(cfg);
        this.loadData();
    },
    loadData: function () {
        this.panel.el.mask("数据载入中...");
        var params = {};
        params.entryName = this.entryName;
        Request.post((this.serviceId), this.method,
            [params], function (json) {
                this.panel.el.unmask();
                if (json.code === 200) {
                    this.vue.tableData = json.body.data;
                } else {
                    Msg.error(json.msg);
                }
            }, this);
    },
    getMethods: function () {
        var me = this;
        return {
            loadData: function () {
                me.loadData();
            },
            open: function () {
                //const h = this.vue.$createElement
                // Msg.info("Form表单数据:" + Ext.encode(this.form.getForm().getValues()));
                this.$notify({
                    title: '标题名称',
                    message: "这里是提示信息，这里是提示信息这里是提示信息"
                });
            },
            formatter: function (row, column) {
                return row.address;
            },
            filterTag: function (value, row) {
                return row.sex_text === value;
            },
            handleEdit: function (index, row) {
                this.$notify({
                    title: '当前行数据',
                    message: $encode(row)
                });
                console.log(index, row);
            },
            handleDelete: function (index, row) {
                console.log(index, row);
            }
        }
    }

})
;


