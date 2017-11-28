/**
 * Created by yangl on 2017/11/7.
 */
Ext.define("MyApp.view.config.SchemaConfigModule", {
    extend: 'MyApp.view.base.BaseModule',
    requires: ["MyApp.view.config.SchemaNameList", "MyApp.view.config.SchemaItemList"],
    initPanel: function () {
        var cfg = {
            xtype: 'layout-horizontal-box',
            layout: {
                type: 'hbox',
                pack: 'start',
                align: 'stretch'
            },
            items: [
                {
                    flex: 1,
                    layout: "fit",
                    items: this.getNameList()
                },
                {
                    flex: 2,
                    layout: "fit",
                    items: this.getItemList()
                }
            ]
        }
        var panel = Ext.create("Ext.panel.Panel", cfg);
        this.panel = panel;
        return panel;
    },
    getNameList: function () {
        var nameList = Ext.create("MyApp.view.config.SchemaNameList");
        nameList.on("showItem", this.showItems, this);
        this.nameList = nameList;
        return nameList.initPanel();
    },
    getItemList: function () {
        var itemList = Ext.create("MyApp.view.config.SchemaItemList");
        this.itemList = itemList;
        return itemList.initPanel();
    },
    showItems: function (id) {
        this.itemList._var.sid = id;
        this.itemList.setParams("sid=:sid", {sid: id});
        this.itemList.loadData();
    }

});