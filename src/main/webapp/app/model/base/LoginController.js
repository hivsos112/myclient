Ext.define('MyApp.model.base.LoginController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.login',
    loadRoles: function () {
        var form = this.getView().getForm();
        var uname = form.findField("username").getValue();
        var pwd = form.findField("password").getValue();
        var roleComb = form.findField("role");
        var manageUnitField = form.findField("manageUnitName");
        if (!uname || !pwd) {
            return;
        }
        var res = Ext.Ajax.request({
            url: 'logon/myRoles',
            async: false,
            method: 'POST',
            jsonData: {
                loginName: uname,
                pwd: hex_md5(pwd)
            }
        });
        var json = Ext.decode(res.responseText);
        var code = json.code;
        var msg = this.translate(code, json.msg);
        if (code != 200) {
            msg = (' - <font color="red">' + msg + '</font>');
            this.getViewModel().set('msg', msg);
            return;
        }
        // 设置角色
        var roles = json.body;
        if (!roles || roles.length == 0) {
            this.getViewModel().set('msg', (' - <font color="red">该用户没有有效的角色!</font>'));
            return;
        }
        this.getViewModel().set('msg', ''); // 重置消息
        roleComb.getStore().loadData(roles);
        var rd = roleComb.getStore().getAt(0)
        if (rd) {
            roleComb.setValue(rd);
            manageUnitField.setValue(rd.get("manageUnitName"));
        }
    },
    translate: function (code, msg) {
        if (code == 200) {
            return ' - 登录成功!';
        } else if (code == 404) {
            return '用户不存在!';
        } else if (code == 501) {
            return '密码不正确!';
        }
        return msg;
    },
    onLoginClick: function () {
        var form = this.getView().getForm();
        var roleComb = form.findField("role");
        var urt = roleComb.getValue();
        Ext.Ajax.request({
            url: "logon/myApps?urt=" + urt + "&deep=3",
            method: 'GET',
            success: function (response, opts) {
                var obj = Ext.decode(response.responseText);
                Ext.Context.loginWin.destroy();
                var app = MyApp.getApplication();
                app.setMainView('MyApp.view.base.MyDesktop');
            },
            failure: function (response, opts) {
                console.log('server-side failure with status code ' + response.status);
            }
        });

    }
})