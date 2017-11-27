/**
 * Created by yangl on 2017/11/7.
 */
Ext.define('MyApp.view.config.SchemaItemList', {
    extend: 'MyApp.view.base.BaseList',
    serviceId: "chis.config",
    method: "getTableData",
    entryName: "c_sy_schema_item",
    title: "Schema字段",
    autoLoadData : false,
    actions: [{name: "新建", cmd: "create"}, {name: "修改", cmd: "update"},
        {name: "↑", cmd: "up"}, {name: "↓", cmd: "down"}],
    enablePaging: true,
    getForm: function () {
        if (!this.form) {
            var form = Ext.create("MyApp.view.config.SchemaItemForm", {
                entryName: this.entryName,
                serviceId: "chis.config",
                saveMethod: "saveSchemaItem",
                loadMethod: "getData",
                buttonPos: "bottom",
                actions: [{name: "保存", cmd: "save"}, {name: "关闭", cmd: "close"}]
            });
            form.on("save", this.loadData, this);
            form.on("winShow", this.onFormShow, this);
            this.form = form;
        }
        return this.form;
    },
    onFormShow: function () {
        this.form.loadData();
    },
    doCreate: function () {
        var form = this.getForm();
        form.doNew();
        var win = form.getWin(true);
        win.setTitle("新建-" + this.title);
        win.show();
    },
    doUpdate: function () {
        var r = this.getSelectedRecord();
        if (!r) {
            Msg.tip("请先选择需要修改的记录!");
            return;
        }
        var form = this.getForm();
        form.initDataId = r.get("id");
        var win = form.getWin(true);
        win.setTitle("修改-" + this.title);
        win.show();
    },
    doRemove: function () {
        this.remove("id", "name");
    },
    doQueryFiled: function () {
        var r = this.getSelectedRecord();
        if (!r) {
            Msg.tip("请先选择需要查看的记录!");
            return;
        }

    },
    onRowClick: function (grid, record, tr, rowIndex) {
        var id = record.get("id");
        this.fireEvent("showItem", id);
    }
});