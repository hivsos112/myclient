/**
 * Created by yangl on 2017/11/6.
 */
Ext.define('MyApp.view.base.EditList', {
    extend: 'MyApp.view.base.BaseList',
    requires: ["Ext.selection.CellModel,Ext.grid.*"],
    enablePaging: false,
    exConfig: function (cfg) {
        this.cellEditing = new Ext.grid.plugin.CellEditing({
            clicksToEdit: 1 // 单击编辑
        });
        if (!cfg.plugins) {
            cfg.plugins = [];
        }
        cfg.selModel = {
            type: 'cellmodel'
        };
        cfg.plugins.push(this.cellEditing);
    },
    createColumn: function (items) {
        var columns = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var f = {
                text: item.name,
                sortable: false,
                dataIndex: item.cd,
                flex: 1,
                editor: {
                    allowBlank: item.fg_null || true,
                }
            };
            if (item.width) {
                delete f.flex;
                f.width = item.width;
            }
            if (item.type === "boolean") {
                f.xtype = "checkcolumn";
            } else if (item.type === "date") {
                f.xtype = "datecolumn";
                Ext.apply(f.editor, {
                    xtype: "datefield",
                    minValue: item.min,
                    maxValue: item.max
                });
            }
            Ext.apply(f, item.exCfg);
            columns.push(f);
        }
        return columns;
    }
});