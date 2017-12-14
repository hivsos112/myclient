/**
 * Created by yangl on 2017/12/13.
 */
Ext.define("MyApp.view.layout.LayoutAssistant", {
    extend: "MyApp.view.base.BaseModule",
    initPanel: function () {
        if (this.panel) {
            return this.panel;
        }
        var panel = Ext.create('Ext.panel.Panel', {
            layout: 'border',
            defaults: {
                frame: true
            },
            items: [{
                //title: '上',
                region: 'north',     // position for region
                xtype: 'panel',
                height: 100,
                margin: '0 0 2 0'
            }, {
                //title: '下',
                region: 'south',     // position for region
                xtype: 'panel',
                height: 100,
                margin: '2 0 0 0'
            }, {
                // xtype: 'panel' implied by default
               // title: '左',
                region: 'west',
                xtype: 'panel',
                margin: '2 2 0 0',
                width: 200,
                layout: 'fit'
            }, {
                // xtype: 'panel' implied by default
               // title: '右',
                region: 'east',
                xtype: 'panel',
                margin: '2 0 0 2',
                width: 200,
                layout: 'fit'
            }, {
                title: '中',
                region: 'center',     // center region is required, no width/height specified
                xtype: 'panel',
                layout: 'fit',
                margin: '2 2 0 0'
            }]
        });
        this.panel = panel;
        return panel;
    }
});