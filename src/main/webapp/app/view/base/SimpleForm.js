/**
 * 基础form表单
 */
Ext.define('MyApp.view.base.SimpleForm', {
			extend : 'Ext.form.Panel',
			requires : ['MyApp.model.base.SimpleFormController'],
			xtype : 'base-form',
			controller : 'base-form',
			title : 'SimpleForm',
			frame : true,
			bodyPadding : 10,
			defaultType : 'textfield',
			constructor : function(config) {
				var res = Ext.Ajax.request({
							url : '*.jsonRequest',
							async : false,
							method : 'POST',
							jsonData : {
								method : "items",
								totalCount : 6
							}
						});
				var fields = Ext.decode(res.responseText).fields;
				var items = [];
				for (var i = 0; i < fields.length; i++) {
					var p = fields[i];
					var f = Ext.apply({}, p);
					if (p.dic) {
						f.xtype = 'combo'
						f.store = Ext.create('Ext.data.Store', {
									fields : p.dic.fields,
									proxy : {
										type : 'ajax',
										url : '*.jsonRequest?method=comboData',
										reader : {
											type : 'json',
											rootProperty : 'root'
										}
									},
									autoLoad : true
								})
					}
					items.push(f);
				}
				this.items = items;

				this.callParent(config);
				this.on("afterrender", this.onReady, this);
			},
			onReady : function() {
				// 模块初始化操作
			}
		});