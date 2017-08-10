Ext.define('MyApp.view.base.MyNavTree', {
	extend : 'Ext.tree.Panel',
	xtype : 'base-navtree',
	reference : 'base-navtree',
	rootVisible : false,
	width : '150',
	scrollable : true,
	store : 'Menus',
	listeners : {
		cellclick : function(cell, td, cellIndex, record, tr, rowIndex, e,
				eOpts) {
			if (record.get("leaf")) {
				var mainTab = Ext.Context.mainTab;
				if (script = record.get("script")) {
					// @Todo 获取模块配置信息
					// 获取配置信息
					if (!this.mainTab)
						this.mainTab = {}
					var list = this.mainTab[script];
					var _this = this;
					if (!list) {
						Ext.require([script], function() {
									list = Ext.create('Ext.panel.Panel', {
												closable : true,
												title : record.get("text"),
												script : script,
												layout : 'fit',
												items : [{
															xclass : script,
															frame : true
														}]
											});
									list.on('destroy', function() {
												delete _this.mainTab[this.script];
											}, list)
									_this.mainTab[script] = list
									mainTab.add(list);
									mainTab.setActiveTab(list);
								})
					} else {
						Ext.Context.mainTab.setActiveTab(list);
					}

				} else if (template = record.get("template")) {
					Ext.Ajax.request({
								url : template + '.jsc',
								success : function(response, opts) {
									Ext.globalEval(response.responseText);
									var list = Ext.create({
												xclass : template,
												closable : true
											});
									mainTab.add(list);
									mainTab.setActiveTab(list);
								},

								failure : function(response, opts) {
									console
											.log('server-side failure with status code '
													+ response.status);
								}
							});
				}
			}
		}
	}
})