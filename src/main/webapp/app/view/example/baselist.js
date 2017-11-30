Ext.define('MyApp.view.example.baselist', {
    extend: 'MyApp.view.base.BaseList',
    serviceId: "chis.config",
    method: "getTableData",
    entryName: "mpi_demographicinfo",
    title: "基础列表",
    actions: [{name: "新建", cmd: "create"}, {name: "查看", cmd: "read"}],
    enablePaging: true,
    doCreate: function () {
        Ext.Msg.alert("提示", Ext.encode(this.entryName));
    },
    doRead: function () {
        this.entryName = "edit_1"
    }
});


