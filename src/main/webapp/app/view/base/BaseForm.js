/**
 * Created by yangl on 2017/11/1.
 */
Ext.define('MyApp.view.base.BaseForm', {
    extend: 'MyApp.view.base.BaseModule',
    xtype: 'base-form',
    autoLoadData: true,
    initPanel: function () {
        var me = this;
        if (me.form)
            return me.form;
        if (!me.entryName) {
            return;
        }
        if (this.init) {
            this.init.call(this);
        }
        var cfg = {
            title: me.title,
            defaultType: 'textfield',
            bodyPadding: 10,
            autoScroll: true,
            defaults: {
                labelWidth: me.labelWidth || 120,
                anchor: '100%'
            },
            items: []
        };
        var items = this.loadSchema(me.entryName);
        if (items && items.length > 0) {
            cfg.items = this.createItems(items);
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
        form.on("afterrender", this._onReady, this);
        me.form = form;
        return form;
    },
    /**
     * 基础实现,非特殊情况不允许子类重写
     * @private
     */
    _onReady: function () {
        if (this.autoLoadData) {
            this.loadData();
        }
        this.onReady();
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
                    if (item.type === 'boolean') {
                        f.setValue(data[item.cd]);
                    } else {
                        f.setValue(data[item.cd]);
                    }
                } else {
                    f.setValue(item.defaultValue);
                }
            }
        }
    },
    loadData: function () {
        this.clear();
        if (this.initDataId) { // pkey
            Request.post((this.loadServiceId || this.serviceId), this.loadMethod, [this.entryName, this.initDataId], function (json) {
                if (json.code > 200) {
                    Msg.error(json.msg);
                    return;
                }
                this.initFormData(json.body);
                this.fireEvent("loadData", json.body);
            }, this)
        }
    },
    /**
     * 扩展参数用
     * @param data
     * @returns {*}
     */
    getServerData: function (data) {
        return data
    },
    doSave: function () {
        if ((this.saveServiceId || this.serviceId) && this.saveMethod) {
            if (this.form.getForm().isValid()) {
                var data = this.getServerData(this.form.getForm().getValues());
                var op = "create";
                if (this.initDataId) {
                    data[this.pkey] = this.initDataId;
                    op = "update";
                }
                this.form.mask("正在保存数据...");
                Request.post((this.saveServiceId || this.serviceId), this.saveMethod, [op, data], function (json) {
                    this.form.unmask();
                    if (json.code === 200) {
                        Msg.tip("保存成功");
                        if (!this.initDataId) {
                            this.initDataId = json.body.keyValue;
                        }
                        this.fireEvent("save");
                    } else {
                        Msg.error(json.msg);
                    }
                }, this)
            }
        }
    },
    createItems: function (items) {
        var fields = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.fg_key) {
                this.pkey = item.cd; // 主键字段
            }
            if (item.fg_hid) {
                continue
            }
            var f = {
                name: item.cd,
                fieldLabel: item.name,
                allowBlank: item.fg_nul
            };
            if (!item.fg_nul) {
                f.labelStyle = "color:red;"
            }
            // 字典类型
            if (item.dic_id) {
                fields.push(this.createDic(f, item));
                continue;
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
                case "date":
                    xtype = "datefield";
                    break;
                case "time":
                case "datetime":
                    xtype = "timefield";
                    break;
                case "boolean":
                    xtype = "checkboxfield";
                    f.inputValue = 1;
                    break;
                default :
                    xtype = "textfield";
            }
            f.xtype = xtype;
            Ext.apply(f, item.exCfg);
            fields.push(f);
        }
        return fields;
    },
    createDic: function (cfg, item) {
        var url = item.dic_id + ".dic";
        var dic_prop = $decode((item.dic_prop || "{}"));
        var dicType = dic_prop.type;
        debugger
        if (dicType === "20" || dicType === "30") { // checkbox radio group
            var response = Ext.Ajax.request({
                url: url,
                async: false
            });
            if (response.status === 200) { // 成功
                var json = $decode(response.responseText);
                Ext.apply(cfg, {
                    xtype: (dicType === "20" ? 'checkboxgroup' : "radiogroup"),
                    cls: 'x-check-group-alt',
                    columns: dic_prop.columnCount || 3,
                    items: this.getDicItems(json.items, item.defaultValue)
                });
                return cfg;
            }
            return;
        }
        var reader = Ext.create("Ext.data.reader.Json", {
            rootProperty: 'items'
        });
        var model = Ext.create("Ext.data.Model", {
            fields: ['key', 'text']
        });
        var storeType = "Ext.data.Store";
        if (dicType === "11" || dicType === "13") {
            // 下拉树 待实现
        }
        var store = Ext.create(storeType, {
            model: model,
            pageSize: this.pageSize || 50,
            proxy: {
                type: 'ajax',
                url: url,
                reader: reader
            }
        });
        Ext.apply(cfg, {
            displayField: "text",
            valueField: "key",
            // queryMode: 'local',
            typeAhead: true,
            autoLoadOnValue: true,
            store: store
        });
        if (dicType === "12") {
            cfg.xtype = "tagfield";
            cfg.filterPickList = true;
            cfg.queryMode = "local";
            return cfg;
        }
        return Ext.create("Ext.form.field.ComboBox", cfg);
    },
    getDicItems: function (items, defaultValue) {
        var a = [];
        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            var cfg = {boxLabel: it.text, inputValue: it.key};
            if (it.key == defaultValue) {
                cfg.checked = true;
            }
            a.push(cfg);
        }
        return a;
    }
});