Ext.define('MyApp.view.example.myform', {
			extend : 'MyApp.view.base.TableForm',
			
			items : [
				{name : 'ksdm',fieldLabel : '科室代码',xtype : 'numberfield',hideTrigger: true},
				{name : 'ksmc',fieldLabel : '科室名称'},
				{name : 'ksjb',fieldLabel : '科室级别',xtype : 'combobox', store: 'mystore'}
			]

		})