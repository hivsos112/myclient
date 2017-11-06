Ext.define('MyApp.model.base.SimpleFormController', {
			extend : 'Ext.app.ViewController',
			alias : 'controller.base-form',
			doAction : function(item, e) {
				var cmd = item.cmd;
				cmd = cmd.charAt(0).toUpperCase() + cmd.substr(1)
				var action = this["do" + cmd]
				if (action) {
					action.apply(this, [item, e])
				}
			},
			doSave : function() {
				//var form = this.getView().getForm();
				//var v = form.findField("first").getValue();
				//alert("first value :" + v)
                var res = Ext.Ajax.request({
                    url: '*.jsonRequest',
                    async: false,
                    method: 'POST',
                    jsonData: {
                        serviceId: "phis.config",
                        method: "getTableDesc",
                        body: ['base_user']
                    }
                });
				console.log(res)
			},
			doCancel : function() {
				this.getView().getForm().reset()
			},
			myhandler : function() {
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