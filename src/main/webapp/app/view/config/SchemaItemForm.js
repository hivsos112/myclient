/**
 * Created by yangl on 2017/11/27.
 */
Ext.define('MyApp.view.config.SchemaItemForm', {
    extend: 'MyApp.view.base.TableForm',
    colCount : 1,
    getServerData: function (data) {
        data.sid = this._var.sid;
        return data
    }
});