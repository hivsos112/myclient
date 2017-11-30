/**
 * Created by yangl on 2017/11/7.
 */
Ext.define('MyApp.view.config.SchemaItemList', {
    extend: 'MyApp.view.base.BaseList',
    serviceId: "chis.config",
    method: "getTableData",
    entryName: "c_sy_schema_item",
    title: "Schema字段",
    autoLoadData: false,
    actions: [{name: "新建", cmd: "create"}, {name: "修改", cmd: "update"},
        {name: "保存当前排序", cmd: "saveSort", tooltip: "用鼠标选中行拖拽进行上下排序"},
        {name: "字典项配置", cmd: "dicConfig"}],
    enablePaging: true,
    exConfig: function (cfg) {
        Ext.apply(cfg.viewConfig, {
            plugins: {
                ptype: "gridviewdragdrop",
                dragText: "用鼠标拖拽进行上下排序"
            }
        });
    },
    getForm: function () {
        if (!this.form) {
            var form = Ext.create("MyApp.view.config.SchemaItemForm", {
                entryName: this.entryName
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
    doSaveSort: function () {
        var sortData = [];
        for (var i = 0; i < this.store.getCount(); i++) {
            var r = this.store.getAt(i);
            sortData.push({
                id: r.get("id"),
                sort: i + 1 // 从1开始
            })
        }
        Request.post(this.serviceId, "saveItemSort", [sortData], function (json) {
            if (json.code == 200) {
                Msg.tip("保存成功");
                this.loadData();
            } else {
                Msg.error(json.msg);
            }
        }, this)
    },
    doDicConfig: function () {
        if (!this.dicForm) {
            var form = Ext.create("MyApp.view.config.SchemaItemDicForm");
            this.dicForm = form;
        }
        return this.dicForm;
    }
});