/**
 * Created by yangl on 2017/11/28.
 */

Ext.define('MyApp.view.base.CheckList', {
    extend: 'MyApp.view.base.BaseList',
    exConfig: function (cfg) {
        cfg.selModel = {
            selType: 'checkboxmodel'
        }
    }
});
