/**
 * Created by yangl on 2017/11/27.
 */
Ext.define('MyApp.view.config.TableDescList', {
    extend: 'MyApp.view.base.CheckList',
    serviceId: "chis.config",
    method: "getTableDesc",
    autoLoadData: true,
    entryName: "table_desc"
});