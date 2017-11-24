/**
 * Created by yangl on 2017/11/7.
 */
Ext.define('MyApp.view.config.SchemaItemList', {
    extend: 'MyApp.view.base.BaseList',
    serviceId: "chis.config",
    method: "getTableData",
    entryName: "c_sy_schema_item",
    title: "Schema字段",
    autoLoadData : false,
    actions: [{name: "新建", cmd: "create"}, {name: "修改", cmd: "update"},
        {name: "↑", cmd: "up"}, {name: "↓", cmd: "down"}],
    enablePaging: true,
    doCreate: function () {

    },
    doUpdate: function () {

    }
});