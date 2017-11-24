Ext.define('MyApp.view.example.tableform', {
    extend: 'MyApp.view.base.TableForm',
    entryName: "c_sy_schema",
    title : "表格表单",
    actions: [{name: "保存", cmd: "save"}],
    buttonPos : "bottom",
    doSave : function () {
        alert("Form表单数据:" + Ext.encode(this.getFormData()));
    }
});


