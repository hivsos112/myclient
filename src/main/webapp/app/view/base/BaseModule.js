/**
 * Created by yangl on 2017/11/2.
 */

Ext.define("MyApp.view.base.BaseModule", {
    requires: ['MyApp.utils.Request'],
    loadSchema: function (entryName) {
        var res = Request.post("phis.config", "getSchema", [entryName]);
        if (res.code > 200) {
            Ext.Msg.alert("错误", res.msg);
            return [];
        }
        return res.body;
    }

})