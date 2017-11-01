$styleSheet("ext.classic.theme-triton.resources.theme-triton-all")

$import("app.utils.md5");
$import("ext.build.ext-all-debug")
$import("ext.local.locale-zh_CN")

Ext.onReady(function(){
    Ext.Context = {};

    Ext.application({
        name: 'MyApp',

        extend: 'MyApp.Application',

        requires: [
            'MyApp.view.base.MyDesktop'
        ],

        // The name of the initial view to create. With the classic toolkit this class
        // will gain a "viewport" plugin if it does not extend Ext.Viewport. With the
        // modern toolkit, the main view will be added to the Viewport.
        //

        //-------------------------------------------------------------------------
        // Most customizations should be made to MyApp.Application. If you need to
        // customize this file, doing so below this section reduces the likelihood
        // of merge conflicts when upgrading to new versions of Sencha Cmd.
        //-------------------------------------------------------------------------
    });
})