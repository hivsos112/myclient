Ext.define('MyApp.view.base.MyNavTree', {
    extend: 'Ext.tree.Panel',
    xtype: 'base-navtree',
    reference: 'base-navtree',
    rootVisible: false,
    width: '150',
    scrollable: true,
    store: 'Menus',
    listeners: {
        cellclick: function (cell, td, cellIndex, record) {
            if (record.get("leaf")) {
                var mainTab = Ext.Context.mainTab;
                var script = record.get("script")
                if (script) {
                    if (!this.mainTab)
                        this.mainTab = {}
                    var tab = this.mainTab[script];
                    if (!tab) {
                        var m = Ext.create(script);
                        var tab = mainTab.add({
                            title: record.get("text"),
                            closable: true,
                            layout: "fit",
                            items: m.initPanel()
                        });
                        tab.on('destroy', function () {
                            delete this.mainTab[script];
                        }, this);
                        this.mainTab[script] = tab;
                        mainTab.setActiveTab(tab);
                    } else {
                        Ext.Context.mainTab.setActiveTab(tab);
                    }

                }
            }
        }
    }
})