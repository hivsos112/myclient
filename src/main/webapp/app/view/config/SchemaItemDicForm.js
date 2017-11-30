/**
 * Created by yangl on 2017/11/27.
 */
Ext.define('MyApp.view.config.SchemaItemDicForm', {
    extend: 'MyApp.view.base.TableForm',
    entryName: "dic_prop",
    serviceId: "chis.config",
    saveMethod: "saveItemDicProp",
    loadMethod: "getItemDicProp",
    buttonPos: "bottom",
    actions: [{name: "保存", cmd: "save"}, {name: "关闭", cmd: "close"}],
    colCount: 1,
    addListener: function () {
        this.on("loadData", this.onLoadData, this)
    },
    onLoadData: function (data) {
        var dicProp = data.dic_prop;
        data = $decode(dicProp);
        return data;
    },
    getServerData: function (data) {
        var ndata = {};
        ndata.dic_prop = $encode(data);
        return ndata
    }
});