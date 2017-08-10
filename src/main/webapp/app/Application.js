/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */
Ext.define('MyApp.Application', {
    extend: 'Ext.app.Application',
    
    name: 'MyApp',
    requires : ['MyApp.store.Menus','MyApp.store.Personnel'],

    stores: [
        // TODO: add global / shared stores here
    	'Menus'
    ],
    
    launch: function () {
        // TODO - Launch the application
    },
    onAppUpdate: function () {
        Ext.Msg.confirm('Application Update', '应用已经更新,是否刷新?',
            function (choice) {
                if (choice === 'yes') {
                    window.location.reload();
                }
            }
        );
    }
});
