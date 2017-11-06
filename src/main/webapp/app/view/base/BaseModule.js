/**
 * Created by yangl on 2017/11/2.
 */

Ext.define("MyApp.view.base.BaseModule", {
    requires: ['MyApp.utils.Request'],
    loadSchema: function (entryName) {
        var res = Request.post("chis.config", "getSchema", [entryName]);
        if (res.code > 200) {
            Ext.Msg.alert("错误", res.msg);
            return [];
        }
        return res.body;
    },
    createButtons: function (actions) {
        var buttons = [];
        if (this.actions && this.actions.length > 0) {
            for (var i = 0; i < actions.length; i++) {
                var action = actions[i];
                buttons.push({
                    text: action.name,
                    cmd: action.cmd,
                    scope: this,
                    handler: this.doAction
                })
            }
        }
        return buttons;
    },
    doAction: function (item, e) {
        var cmd = item.cmd;
        cmd = cmd.charAt(0).toUpperCase() + cmd.substr(1);
        var action = this["do" + cmd];
        if (action) {
            action.apply(this, [item, e])
        }
    }

});