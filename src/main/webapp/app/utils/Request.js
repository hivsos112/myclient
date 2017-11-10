/**
 * Created by yangl on 2017/11/2.
 */
Ext.define("MyApp.utils.Request", {
    alternateClassName: 'Request',
    statics: {
        /**
         * jsonRequest调用
         * @param serviceId String
         * @param method String
         * @param body Array
         * @param callback Function
         */
        get: function (serviceId, method, body, callback, scope) {
            return this.ajax(serviceId, method, body, callback, scope, 'GET')
        },
        post: function (serviceId, method, body, callback, scope) {
            return this.ajax(serviceId, method, body, callback, scope, 'POST')
        },
        ajax: function (serviceId, method, body, callback, scope, way) {
            if (callback && typeof(callback) == 'function') {
                Ext.Ajax.request({
                    url: '*.jsonRequest',
                    method: way,
                    jsonData: {
                        serviceId: serviceId,
                        method: method,
                        body: body
                    },
                    success: function (response, opts) {
                        var data = Ext.decode(response.responseText);
                        callback.call(scope || this, data);
                    },
                    failure: function (response, opts) {
                        Ext.Msg.show({
                            title: "错误信息",
                            msg: response,
                            buttons: Ext.MessageBox.OK,
                            icon: Ext.Msg.ERROR
                        });
                    }
                });
            } else {
                var response = Ext.Ajax.request({
                    url: '*.jsonRequest',
                    async: false,
                    method: way,
                    jsonData: {
                        serviceId: serviceId,
                        method: method,
                        body: body
                    }
                });
                if (response.status > 200) {
                    Ext.Msg.alert("错误", response.statusText);
                    return;
                }
                return Ext.decode(response.responseText);
            }
        }
    }

});