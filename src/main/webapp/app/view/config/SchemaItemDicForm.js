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
    autoLoadData: false,
    actions: [{name: "保存", cmd: "save"}, {name: "关闭", cmd: "close"}],
    colCount: 1,
    init: function () {
        this.on("winShow", this.onWinShow, this);
    },
    initFormData: function (data) {
        if (data) {
            var dicProp = data.dic_prop;
            data = $decode((dicProp || "{}"));
        }
        // 参数必须数组形式
        this.callParent([data]);
    },
    onWinShow: function () {
        this.loadData();
    },
    getServerData: function (data) {
        var ndata = {};
        ndata.dic_prop = $encode(data);
        return ndata
    }
});