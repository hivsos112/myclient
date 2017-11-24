/**
 * 消息提醒工具类
 * @author yangl
 */
Ext.define("MyApp.utils.Message", {
    alternateClassName: 'Msg',
    statics: {
        tip: function (message) {
            Ext.toast({
                html: message,
                closable: false,
                align: 't',
                slideInDuration: 100,
                minWidth: 400
            });
        },
        info: function (message) {
            this.show(message, "info")
        },
        warn: function (message) {
            this.show(message, "warn")
        },
        error: function (message) {
            this.show(message, "error")
        },
        show: function (message, type) {
            var title = "提示", icon = Ext.Msg.INFO;
            if (type === "warn") {
                title = "警告";
                icon = Ext.Msg.WARNING;
            } else if (type === "error") {
                title = "错误";
                icon = Ext.Msg.ERROR;
            }
            Ext.Msg.show({
                title: title,
                msg: message,
                buttons: Ext.MessageBox.OK,
                icon: icon
            });
        }
    }
});