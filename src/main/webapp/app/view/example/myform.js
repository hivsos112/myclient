Ext.define('MyApp.view.example.myform', {
    extend: 'MyApp.view.base.BaseForm',
    entryName: "cloud_demo",
    title : "基础表单",
    actions: [{name: "保存", cmd: "save"}],
    doSave : function () {
        alert("Form表单数据:" + Ext.encode(this.getFormData()));
    }
});


