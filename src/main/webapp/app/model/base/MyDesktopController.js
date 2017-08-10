Ext.define('MyApp.model.base.MyDesktopController', {
			extend : 'Ext.app.ViewController',
			alias : 'controller.base-desktop',
			init : function(view) {
				return;
				// 可以通过view.getViewModel()获取对应的viewModel并修改里面的数据
				var res = Ext.Ajax.request({
							url : '*.jsonRequest',
							async : false,
							method : 'POST',
							jsonData : {
								method : "init"
							}
						});
				console.log(res.responseText)
				Ext.apply(view.getViewModel().data, Ext
								.decode(res.responseText));
			},
			onReady : function() {
				alert('desktop init!')
			},
			menuClick : function(menu, item) {
				var key = menu.key;
				if (key == 'nav') {
					var pressed = true;
					var treelist = this.lookupReference('treelist'), ct = this
							.lookupReference('treelistContainer');

					treelist.setExpanderFirst(!pressed);
					treelist.setUi(pressed ? 'nav' : null);
					treelist.setHighlightPath(pressed);
					ct[pressed ? 'addCls' : 'removeCls']('treelist-with-nav');

					if (Ext.isIE8) {
						this.repaintList(treelist);
					}
				}
			},
			ajax : function() {
				Ext.Ajax.request({
							url : 'template_1.jsc',

							success : function(response, opts) {
								alert(response.responseText)
								// var obj = Ext.decode(response.responseText);
								// console.dir(obj);
							},

							failure : function(response, opts) {
								console
										.log('server-side failure with status code '
												+ response.status);
							}
						});
			}
		});