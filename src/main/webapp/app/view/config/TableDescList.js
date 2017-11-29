/**
 * Created by yangl on 2017/11/27.
 */
Ext.define('MyApp.view.config.TableDescList', {
    extend: 'MyApp.view.base.CheckList',
    serviceId: "chis.config",
    method: "getTableDesc",
    autoLoadData: true,
    entryName: "table_desc",
    actions: [{name: "保存", cmd: "save"}],
    doSave: function () {
        var fields = this.getSelectData();
        var items = [];
        for (var i = 0; i < fields.length; i++) {
            var f = fields[i];
            items.push({
                cd: f.Field,
                sid : this._var.item_sid,
                name: f.Comment || f.Field,
                fg_key: (f.Key ? 1 : 0),
                fg_nul: (f.Null === "YES" ? 1 : 0),
                type: this.getType(f.Type)
            });
        }
        Request.post(this.serviceId, "saveAsItems", [this._var.schemaId,items], function (json) {
            if (json.code == 200) {
                Msg.tip("保存成功");
                this.fireEvent("saveSuccess");
            }else {
                Msg.error(json.msg);
            }
        }, this)
    },
    getType: function (db_type) {
        if (!db_type) return "string";
        if (db_type.indexOf("char") >= 0) {
            return "string";
        }
        if (db_type.indexOf("tinyint") >= 0) {
            return "boolean";
        }
        if (db_type.indexOf("int") >= 0) {
            return "int";
        }
        if (db_type.indexOf("date") >= 0) {
            return "date";
        }
        if (db_type.indexOf("double") >= 0) {
            return "double";
        }
        return "string";
    }
});