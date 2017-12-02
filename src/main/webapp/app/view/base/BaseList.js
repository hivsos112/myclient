/**
 * Created by yangl on 2017/11/1.
 */
Ext.define('MyApp.view.base.BaseList', {
    extend: 'MyApp.view.base.BaseModule',
    /** ***可配置项***** */
    /** schema */
    entryName: '',
    /** 启用列表分页 */
    enablePaging: true,
    /** 默认加载 */
    autoLoadData: true,
    /** 默认选中第一条记录 */
    selectFirst: true,
    /** 允许列表单元格文本选中*/
    enableTextSelection: false,
    /** * 按钮配置 如[{name: "新建", cmd: "create"}, {name: "查看", cmd: "read"}]*/
    actions: [],
    /** *列表查询参数* */
    /** *******End******* */
    xtype: 'base-list',
    requires: ["Ext.toolbar.Paging", "Ext.grid.filters.Filters"],
    /**
     * 初始查询参数
     * @returns {{}}
     */
    initParams: function () {
        return {};
    },
    setParams: function (cnd, data, sort) {
        this.params.cnd = cnd;
        this.params.cndData = data;
        this.params.sort = sort
    },
    initPanel: function () {
        var me = this;
        if (me.grid)
            return me.grid;
        if (!me.entryName) {
            return;
        }
        me.params = this.initParams();
        me.params.entryName = this.entryName;
        me.requestData = {
            serviceId: me.serviceId,
            method: me.method,
            body: [me.params]
        };
        var cfg = {
            title: me.title,
            stateful: me.stateful || false,
            stateId: me.stateId,
            multiSelect: me.multiSelect || false,
            scrollable: true,
            headerBorders: false,
            columnLines: true,
            scroll: true,
            columns: [],
            viewConfig: {
                enableTextSelection: this.enableTextSelection
            },
            /** 列过滤插件 **/
            plugins: ["gridfilters"]
        };
        var items = this.loadSchema(me.entryName);
        // columns
        cfg.columns = this.getColumns(items);
        // store
        this.store = this.getStore(items);
        this.store.on("beforeload", this.onStoreBeforeLoad, this);
        this.store.on("load", this.onLoadData, this);
        cfg.store = this.store;
        if (this.enablePaging) { // 分页
            cfg.bbar = Ext.create('Ext.PagingToolbar', {
                store: this.store,
                displayInfo: true,
                displayMsg: '当前记录 {0} - {1} 全部 {2}',
                emptyMsg: "无记录"
            });
        }
        if (this.actions && this.actions.length > 0) {
            cfg.tbar = this.createButtons(this.actions);
        }
        this.exConfig(cfg);
        var grid = Ext.create("Ext.grid.Panel", cfg);
        grid.on("afterrender", this._onReady, this);
        grid.on("select", this.onRowSelect, this);
        grid.on("rowdblclick", this.onRowDblClick, this);
        me.grid = grid;
        this.addEvent();
        return grid;
    },
    /**
     * 扩展配置
     * @param cfg
     */
    exConfig: Ext.emptyFn,
    /**
     * 界面渲染完成后调用
     */
    onReady: Ext.emptyFn,
    /**
     * 事件监听,如this.on("winShow",...);
     */
    addEvent : Ext.emptyFn,
    /**
     * 扩展配置
     * @private
     */
    _onReady: function () {
        if (this.autoLoadData) {
            this.loadData();
        }
        this.onReady();
    },
    /** 单击列调用,继承实现 入参: grid, record, tr, rowIndex */
    onRowSelect: Ext.emptyFn,
    /** 双击列调用*/
    onRowDblClick: function (grid, record, tr, rowIndex) {
        if (this.doRead) {
            this.doRead.call(this, [grid, record, tr, rowIndex]);
        } else if (this.doUpdate) {
            this.doUpdate.call(this, [grid, record, tr, rowIndex]);
        }
    },
    onStoreBeforeLoad: function (store, opt) {
        if (this.enablePaging) {
            this.params.pageNo = opt.config.page;
            this.params.pageSize = opt.config.limit;
        }
        Ext.apply(store.proxy.extraParams, this.requestData);
    },
    onLoadData: function (store, records) {
        if (this.selectFirst && records.length > 0) {
            this.selectRow(0);
        }
    },
    /**
     * list选中row行
     * @param row: record or index
     */
    selectRow: function (row) {
        this.grid.getSelectionModel().select(row);
    },
    loadData: function () {
        if (this.store) {
            this.store.load()
        }
    },
    remove: function (keyField, textField) {
        var r = this.getSelectedRecord();
        if (!r) {
            Msg.tip("请选中需要删除的记录!");
            return;
        }
        Ext.Msg.confirm('请确认', '确认删除记录[' + r.get(textField || keyField) + ']?', function (btn) {
            if (btn === 'yes') {
                this.processRemove(r.get(keyField))
            }
        }, this);
    },
    processRemove: function (value) {
        Request.post((this.removeServiceId || this.serviceId), this.removeMethod,
            [value], function (json) {
                if (json.code === 200) {
                    Msg.tip("删除成功");
                    if (this.fireEvent("delete")) {
                        this.loadData();
                    }
                } else {
                    Msg.error(json.msg);
                }
            }, this);
    },
    getSelectedRecord: function () {
        var rds = this.grid.getSelectionModel().getSelection();
        return (rds.length > 0) ? rds[0] : null
    },
    getColumns: function (items) {
        var columns = [];
        if (items && items.length > 0) {
            columns.push({xtype: 'rownumberer', width: 25});
            columns = columns.concat(this.createColumn(items));
        }
        return columns;
    }
    ,
    createColumn: function (items) {
        var columns = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var f = {
                text: item.name,
                sortable: false,
                dataIndex: item.cd
            };
            if (item.fg_hid) {
                continue;
            }
            if (item.type === "boolean") {
                f.xtype = "checkcolumn";
                f.disabled = true;
            }
            if (item.fg_filter) {
                f.filter = item.dic_id ? "list" : item.type;

            }
            item.width ? f.width = item.width : f.flex = 1;
            Ext.apply(f, item.exCfg);
            columns.push(f);
        }
        return columns;
    }
    ,
    dataModel: function (items) {
        var cfg = {};
        cfg.fields = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var c = {
                name: item.cd
            };
            var type = item.type;
            if (type && type !== "string") {
                c.type = this.getModelType(type);
            }
            if (item.fg_key) {
                cfg.pkey = item.cd;
            }
            cfg.fields.push(c);
        }
        return Ext.create("Ext.data.Model", cfg);
    }
    ,
    getModelType: function (type) {
        switch (type) {
            case "int":
            case "long":
                return "int";
            case "float":
            case "double":
            case "number":
                return "number";
            case "boolean":
                return "boolean";
            case "data":
            case "datetime":
                return "date";
            default :
                return "auto";

        }
    }
    ,
    getStore: function (items) {
        var reader = Ext.create("Ext.data.reader.Json", {
            rootProperty: 'data',
            totalProperty: 'totalCount'
        });
        reader.getResponseData = function (response) {
            try {
                var result = Ext.decode(response.responseText);
                if (result.code === 200) {
                    return result.body;
                }
                return [];
            } catch (ex) {
                Ext.Logger.warn('Unable to parse the JSON returned by the server');
                return this.createReadError(ex.message);
            }
        };
        return Ext.create("Ext.data.Store", {
            model: this.dataModel(items),
            pageSize: this.pageSize || 50,
            proxy: {
                type: 'ajax',
                url: "*.jsonRequest",
                paramsAsJson: true,
                actionMethods: {
                    read: "POST"
                },
                reader: reader
            }
        })
    }
});