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
                if (items[i].fg_hid === "Y") {
                    continue
                }
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
    doNew: function () {
        this.initDataId = null;
        this.clear();
    },
    clear: function () {
        this.data = null;
        if (!this.form)
            return;
        this.form.getForm().reset();
        this.initFormData();
    },
    initFormData: function (data) {
        this.data = data;
        var items = this.items;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var f = this.form.getForm().findField(item.cd);
            if (f) {
                if (data && data[item.cd]) {
                    f.setValue(data[item.cd]);
                } else {
                    f.setValue(item.defaultValue)
                }
            }
        }
    },
    loadData: function () {
        this.clear();
        if (this.initDataId) { // pkey
            Request.post((this.loadServiceId || this.serviceId), this.loadMethod, [this.entryName, this.initDataId], function (resp) {
                if (resp.code > 200) {
                    Msg.error(resp.msg);
                    return;
                }
                this.fireEvent("loadData", resp.body);
                this.initFormData(resp.body);
            }, this)
        }
    },
    getServerData: function (data) {
        return data
    },
    doSave: function () {
        if ((this.saveServiceId || this.serviceId) && this.saveMethod) {
            if (this.form.getForm().isValid()) {
                var data = this.getServerData(this.form.getForm().getValues());
                this.form.mask("正在保存数据...");
                Request.post((this.saveServiceId || this.serviceId), this.saveMethod, [data], function (json) {
                    this.form.unmask();
                    if (json.code === 200) {
                        Msg.tip("保存成功");
                        this.fireEvent("save");
                    } else {
                        Msg.error(json.msg);
                    }
                }, this)
            }
        }
    },
    doClose: function () {
        if (this.win) {
            this.win.hide();
        }
    },
    createField: function (item) {
        var f = {
            name: item.cd,
            fieldLabel: item.name,
            allowBlank: item.fg_nul === "Y"
        };
        if (item.fg_nul !== "Y") {
            f.allowBlank = false;
            f.labelStyle = "color:red;"
        }
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
            Ext.apply(f, {
                displayField: "text",
                valueField: "key",
                // queryMode: 'local',
                typeAhead: true,
                autoLoadOnValue: true,
                store: store
            })
            return Ext.create("Ext.form.field.ComboBox", f);
        }

        var xtype = "textfield";
        switch (item.type) {
            case "int":
            case "number":
            case "long":
                xtype = "numberfield";
                break;
            case "double":
            case "float":
                xtype = "numberfield";
                break;
            case "dete":
                xtype = "datefield";
                break;
            case "time":
            case "datetime":
                xtype = "timefield";
                break;
            case "boolean": {
            }
                xtype = "checkboxfield";
        }
        f.xtype = xtype;
        Ext.apply(f, item.exCfg);
        return f;
    }
});