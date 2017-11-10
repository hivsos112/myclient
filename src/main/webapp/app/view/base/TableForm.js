Ext.define('MyApp.view.base.TableForm', {
    extend: 'MyApp.view.base.BaseForm',
    xtype: 'table-form',
    exConfig: function (cfg) {
        var me = this;
        Ext.apply(cfg, {
            bodyPadding: 10,
            layout: {
                type: 'table',
                columns: me.colCount || 3,
            },
            defaults: {
                labelWidth: me.labelWidth || 80,
                xtype: 'textfield',
                width: '100%',
                minWidth: me.minWidth || 180
            }
        })
    }

});