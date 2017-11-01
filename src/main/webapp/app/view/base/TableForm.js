Ext.define('MyApp.view.base.TableForm', {
			extend : 'MyApp.view.base.SimpleForm',
			xtype : 'table-form',
			title : '表格form',
			layout : {
				type : 'table',
				columns : 3,
				tableAttrs : {
					border : 0,
					cellpadding : '2',
					cellspacing : "2",
					style : {
						width : '100%'
					}
				}
			},
			defaults : {
				xtype : 'textfield',
				width : '100%',
				minWidth : 280
			},
			buttons : ['->', {
						text : '保存',
						cmd : 'save',
						handler : 'doAction'
					}, {
						text : '取消',
						cmd : 'cancel',
						handler : 'doAction'
					}]
		});