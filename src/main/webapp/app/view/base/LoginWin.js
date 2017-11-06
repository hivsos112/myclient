Ext.define('MyApp.view.base.LoginWin', {
    extend: 'Ext.window.Window',
    xtype: 'login',
    requires: [
        'Ext.form.Panel',
        'MyApp.model.base.LoginController'
    ],
    viewModel: {
        data: {
            msg: ''
        }
    },
    bodyPadding: 10,
    bind: {
        title: '用户登录{msg}'
    },

    closable: false,//窗口是否可关闭
    autoShow: true,//windows默认是隐藏，要设置为显示

    items: {
        xtype: 'form',
        controller: 'login',
        listeners: {
            afterrender: function () {
                var form = this.getForm();
                var nameField = form.findField("username");
                nameField.focus();
                var roleComb = form.findField("role");
                if (roleComb) {
                    roleComb.on("select", function (f, r) {
                        form.findField("manageUnitName").setValue(r.get("manageUnitName"));
                    }, this)
                }
            }
        },
        defaults: {
            xtype: 'textfield'
        },
        items: [{
            name: 'username',
            fieldLabel: '用户名',
            allowBlank: false,
            listeners: {
                blur: 'loadRoles'
            },
            value : "admin"
        }, {
            name: 'password',
            fieldLabel: '密码',
            allowBlank: false,
            inputType: 'password',
            listeners: {
                blur: 'loadRoles'
            },
            value : "123"
        }, {
            xtype: 'combobox',
            name: 'role',
            store: {
                xtype: 'store',
                queryMode: 'local',
                fields: [
                    {name: 'id', type: 'int'},
                    {name: 'roleName', type: 'string'},
                    {name: 'manageUnit', type: 'string'},
                    {name: 'manageUnitName', type: 'string'}
                ],
                autoLoad: true
            },
            fieldLabel: '角色',
            displayField: 'roleName',
            valueField: 'id',
            allowBlank: false
        }, {
            name: 'manageUnitName',
            fieldLabel: '机构',
            allowBlank: false
        }],
        buttons: [{
            text: '登录',
            formBind: true,//按钮是否可用取决于form
            listeners: {
                click: 'onLoginClick'
            }
        }]
    }
});