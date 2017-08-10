Ext.define('MyApp.view.base.LoginWin', {
    extend: 'Ext.form.Panel',
    xtype: 'form-login',


    title: '用户登录',
    frame: true,
    width: 320,
    bodyPadding: 10,

    defaultType: 'textfield',

    items: [{
        allowBlank: false,
        fieldLabel: '用户名',
        name: 'user',
        emptyText: '请输入用户名...'
    }, {
        allowBlank: false,
        fieldLabel: '密码',
        name: 'pass',
        emptyText: '请输入密码...',
        inputType: 'password'
    }, {
        xtype: 'checkbox',
        fieldLabel: '记住密码',
        name: 'remember'
    }],

    buttons: [
        {text: '登录', handler: "doLogin"},
        {text: '重置', handler: "doReset"}
    ],

    initComponent: function () {
        this.defaults = {
            anchor: '100%',
            labelWidth: 120
        };

        this.callParent();
    }
});