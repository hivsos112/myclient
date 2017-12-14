/**
 * Created by yangl on 2017/11/2.
 */

Ext.define("MyApp.view.base.BaseModule", {
    extend: "Ext.Component",
    /**
     * 外部模块传递变量
     */
    _var: {},
    requires: ['MyApp.utils.Request', "MyApp.utils.Message"],
    loadSchema: function (entryName) {
        if (!this.items) {
            var res = Request.post("chis.config", "getSchema", [entryName]);
            if (res.code > 200) {
                Msg.error(res.msg);
                return [];
            }
            this.items = res.body;
        }
        return this.items;
    },
    createButtons: function (actions) {
        var buttons = [];
        if (this.actions && this.actions.length > 0) {
            for (var i = 0; i < actions.length; i++) {
                var action = actions[i];
                var btn = {
                    text: action.name,
                    cmd: action.cmd,
                    scope: this,
                    handler: this.doAction,
                    tooltip: action.tooltip, // 按钮提示信息
                    formBind: action.formBind // 安装可用状态与form表单校验关联
                };
                if (action.bind) {
                    btn.bind = action.bind;
                }
                // 按钮api配置项
                if (action.exCfg) {
                    Ext.apply(btn, exCfg);
                }
                buttons.push(btn);
            }
        }
        return buttons;
    }
    ,
    doAction: function (item, e) {
        var cmd = item.cmd;
        cmd = cmd.charAt(0).toUpperCase() + cmd.substr(1);
        var action = this["do" + cmd];
        if (action) {
            action.apply(this, [item, e])
        }
    },
    doClose: function () {
        if (this.win) {
            this.win.close();
        }
    }
    ,
    /**
     * 获取当前窗口
     * @param autoCreate 将调用对象的initPanel方法返回值作为窗体内容
     * @param exCfg 窗体扩展配置
     * @returns {Ext.window.Window|*}
     */
    getWin: function (autoCreate, exCfg) {
        if (!this.win) {
            var cfg = {
                extend: 'Ext.window.Window',
                height: 500,
                width: 600,
                title: '窗口',
                layout: 'fit',
                shadow: true,
                closeAction: this.closeAction || 'hide',
                closable: true
            };
            Ext.apply(cfg, exCfg);
            if (autoCreate) {
                cfg.items = this.initPanel();
            }
            var win = Ext.create("Ext.window.Window", cfg);
            win.on("beforehide", function () {
                this.fireEvent("beforehide");
            }, this)
            win.on("beforeclose", function () {
                this.fireEvent("beforeclose");
            }, this)
            win.on("beforeshow", function () {
                this.fireEvent("winShow");
            }, this)
            this.win = win;
            this.win.instance = this;
        }
        return this.win;
    }

})
;