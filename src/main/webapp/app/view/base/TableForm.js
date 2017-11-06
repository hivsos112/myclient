Ext.define('MyApp.view.base.TableForm', {
    extend: 'MyApp.view.base.BaseForm',
    xtype: 'table-form',
    initPanel: function () {
        var me = this;
        if (me.form)
            return me.form;
        if (!me.entryName) {
            return;
        }
        var cfg = {
            title: me.title,
            defaultType: 'textfield',
            bodyPadding: 10,
            layout: {
                type: 'table',
                columns: me.colCount || 3,
                tableAttrs: {
                    border: 0,
                    cellpadding: "2",
                    cellspacing: "2",
                    style: {
                        width: '100%'
                    }
                }
            },
            defaults: {
                labelWidth: me.labelWidth || 120,
                xtype: 'textfield',
                width: '100%',
                minWidth: me.minWidth || 280
            },
            items: []
        };
        var items = this.loadSchema(me.entryName);
        if (items && items.length > 0) {
            for (var i = 0; i < items.length; i++) {
                cfg.items.push(this.createField(items[i]));
            }
        }
        this.exConfig(cfg);
        var form = Ext.create("Ext.form.Panel", cfg);
        form.on("afterrender", this.onReady, this)
        me.form = form;
        return form;
    }

});