/**
 * Created by yangl on 2017/11/27.
 */
Ext.define('MyApp.view.config.SchemaItemForm', {
    extend: 'MyApp.view.base.TableForm',
    serviceId: "chis.config",
    saveMethod: "saveSchemaItem",
    loadMethod: "getData",
    buttonPos: "bottom",
    actions: [{name: "保存", cmd: "save"}, {name: "关闭", cmd: "close"}],
    colCount : 1,
    getServerData: function (data) {
        data.sid = this._var.sid;
        return data
    }
});