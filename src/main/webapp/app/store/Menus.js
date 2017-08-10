Ext.define('MyApp.store.Menus', {
			extend : 'Ext.data.TreeStore',

			root : {
				text : '功能菜单',
				expanded : true,
				children : [{
							text : '例子',
							expanded : true,
							children : [{
										leaf : true,
										text : '例子一',
										script : "MyApp.view.example.myform"
									}

							]

						}, {
							text : '基础表单',
							expanded : true,
							children : [{
										leaf : true,
										text : 'SimpleForm',
										script : "MyApp.view.base.SimpleForm"
									}, {
										leaf : true,
										text : 'TableForm',
										script : "MyApp.view.base.TableForm"
									}

							]

						}, {
							text : '基础列表',
							expanded : true,
							children : [{
										leaf : true,
										text : 'SimpleList',
										script : "MyApp.view.base.SimpleList"
									}]
						}, {
							text : '模版解析',
							expanded : true,
							children : [{
										leaf : true,
										text : '模板一',
										template : 'template_1'
									}]
						}]
			}
		});