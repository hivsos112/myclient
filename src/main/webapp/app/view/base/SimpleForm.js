/**
 * 基础form表单
 */
Ext.define('MyApp.view.base.SimpleForm', {
    extend: 'Ext.form.Panel',
    requires: ['MyApp.model.base.SimpleFormController'],
    xtype: 'base-form',
    controller: 'base-form',
    title: 'SimpleForm',
    frame: true,
    bodyPadding: 10,
    defaultType: 'textfield',
    constructor: function (config) {
        var res = Ext.Ajax.request({
            url: '*.jsonRequest',
            async: false,
            method: 'POST',
            jsonData: {
                serviceId: "phis.common",
                method: "getItems",
                body: []
            }
        });
        var json = Ext.decode(res.responseText);
        var fields = json.body;
        var items = [];
        for (var i = 0; i < fields.length; i++) {
            var p = fields[i];
            var f = Ext.apply({}, p);
            if (p.dic_id) {
                f.xtype = 'combo'
                f.store = this.getStore(p);
            }
            items.push(f);
        }
        this.items = items;

        this.callParent(config);
        this.on("afterrender", this.onReady, this);
    },
    onReady: function () {
        // 模块初始化操作
        var ws = new WebSocket("ws://127.0.0.1:9090/ws");
        ws.onopen = function () {
            ws.send("{topic : 'REG',endPoint : {userId:'admin'}}");
            ws.send("{topic : 'SUBSCRIBE',value : 'JVM_STAT_M'}");
        };
        ws.onmessage = function (evt) {
            console.log(evt.data);
            // ws.close();
        };
        ws.onclose = function (evt) {
            console.log("WebSocketClosed!");
        };
        ws.onerror = function (evt) {
            console.log("WebSocketError!");
        };
    }
});