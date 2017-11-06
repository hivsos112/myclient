/**
 * Created by yangl on 2017/11/1.
 */
Ext.define('MyApp.view.base.BaseForm', {
    extend: 'MyApp.view.base.BaseModule',
    xtype: 'base-form',
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
            defaults: {
                labelWidth: me.labelWidth || 120,
                anchor: '100%'
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
    },
    onReady: function () {

    },
    /**
     * 扩展配置
     * @param cfg
     */
    exConfig: function (cfg) {

    },
    createField: function (item) {
        var f = {};
        f.name = item.cd;
        f.fieldLabel = item.name;
        var type = "textfield";
        switch (item.type) {
            case "int":
            case "number":
            case "long":
                type = "numberfield";
                break;
            case "double":
            case "float":
                type = "numberfield";
                break;
            case "dete":
                type = "datefield";
                break;
            case "time":
            case "datetime":
                type = "timefield";
                break;
        }
        f.xtype = type;
        Ext.apply(f, item.exCfg);
        return f;
    }
});