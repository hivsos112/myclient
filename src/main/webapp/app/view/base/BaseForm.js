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
        // 按钮
        if (this.actions && this.actions.length > 0) {
            if (this.buttonPos === "bottom") {
                cfg.buttons = this.createButtons(this.actions);
            } else {
                cfg.tbar = this.createButtons(this.actions);
            }
        }

        this.exConfig(cfg);
        var form = Ext.create("Ext.form.Panel", cfg);
        form.on("afterrender", this.onReady, this);
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
    getFormData: function () {
        return this.form.getForm().getValues();
    },
    createField: function (item) {
        // 字典类型
        if (item.dic_id) {
            var url = item.dic_id + ".dic";
            var reader = Ext.create("Ext.data.reader.Json", {
                rootProperty: 'items'
            });
            var model = Ext.create("Ext.data.Model", {
                fields: ['key', 'text']
            });
            var store = Ext.create("Ext.data.Store", {
                model: model,
                pageSize: this.pageSize || 50,
                proxy: {
                    type: 'ajax',
                    url: url,
                    reader: reader
                }
            });
            return Ext.create("Ext.form.field.ComboBox", {
                fieldLabel: item.name,
                name: item.cd,
                displayField: "text",
                valueField: "key",
                // queryMode: 'local',
                typeAhead: true,
                autoLoadOnValue: true,
                store: store
            });
        }
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