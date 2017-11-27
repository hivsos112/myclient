/**
 * Created by yangl on 2017/11/7.
 */
Ext.define('MyApp.view.config.SchemaNameList', {
    extend: 'MyApp.view.base.BaseList',
    serviceId: "chis.config",
    method: "getTableData",
    removeMethod: "deleteSchemaName",
    entryName: "c_sy_schema",
    title: "Schema名称",
    actions: [{name: "新建", cmd: "create"}, {name: "修改", cmd: "update"},
        {name: "删除", cmd: "remove"}, {name: "查看字段", cmd: "queryFiled"}],
    enablePaging: true,
    getForm: function () {
        if (!this.form) {
            var form = Ext.create("MyApp.view.base.BaseForm", {
                entryName: this.entryName,
                serviceId: "chis.config",
                saveMethod: "saveSchemaName",
                loadMethod: "getData",
                buttonPos: "bottom",
                actions: [{name: "保存", cmd: "save"}, {name: "关闭", cmd: "close"}]
            });
            form.on("save", this.loadData, this);
            form.on("winShow", this.onFormShow, this)
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
        var win = form.getWin(true, {title: "新建-" + this.title});
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
        var win = form.getWin(true, {title: "修改-" + this.title});
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
        if(!this.descListWin) {
            this.descList = Ext.create("MyApp.view.config.TableDescList");
            this.descList.on("winShow",function(){
                this.loadData();
            },this.descList)
            var win = this.descList.getWin(true);
            win.setTitle("表字段 - " + r.get("name"));
            win.setWeight(800);
            win.setHeight(600);
            this.descListWin = win;
        }
        this.descList.params.tableName = r.get("table_name") || r.get("cd");
        this.descListWin.show();
    },
    onRowClick: function (grid, record, tr, rowIndex) {
        var id = record.get("id");
        this.fireEvent("showItem", id);
    }
});