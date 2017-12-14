Ext.define('MyApp.view.example.myform', {
    extend: 'MyApp.view.base.BaseForm',
    entryName: "mpi_demographicinfo",
    title : "基础表单",
    actions: [{name: "保存", cmd: "save"}],
    doSave : function () {
        Msg.info("Form表单数据:" + Ext.encode(this.form.getForm().getValues()));

    }
});


