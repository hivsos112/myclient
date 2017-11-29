/**
 * Created by yangl on 2017/11/28.
 */

Ext.define('MyApp.view.base.CheckList', {
    extend: 'MyApp.view.base.BaseList',
    exConfig: function (cfg) {
        cfg.selModel = {
            selType: 'checkboxmodel'
        }
    },
    /**
     * 返回Model对象数组
     * @returns {*|Ext.data.Model[]}
     */
    getSelect: function () {
        return this.grid.getSelectionModel().getSelection();
    },
    /**
     * 返回普通对象数组
     * @returns {Array}
     */
    getSelectData : function () {
        var records = this.getSelect();
        return records.map(function (rd) {
            return rd.data;
        })
    },
    selectAll : function() {

    },
    deselectAll : function () {

    },
    selectRow : function (row) {

    }
});
