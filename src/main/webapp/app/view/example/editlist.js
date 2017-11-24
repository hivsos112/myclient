Ext.define('MyApp.view.example.editlist', {
    extend: 'MyApp.view.base.EditList',
    serviceId: "chis.config",
    method: "getTableData",
    entryName: "c_sy_schema",
    title: "基础列表",
    enablePaging: false,
    actions: [{name: "新建", cmd: "create"}, {name: "查看", cmd: "read"}],
    doCreate: function () {
        Ext.Msg.alert("提示", Ext.encode(this.entryName));
    },
    doRead: function () {
        this.entryName = "edit_2"
    }
});


