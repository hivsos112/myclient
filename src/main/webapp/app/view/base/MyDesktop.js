Ext.define('MyApp.view.base.MyDesktop', {
    extend: 'Ext.container.Viewport',
    requires: ['MyApp.view.base.MyNavTree', 'MyApp.view.main.List',
        'MyApp.model.base.MyDesktopController',
        'MyApp.model.base.MyDesktopViewModel'],
    xtype: 'desktop',
    layout: 'border',
    controller: 'base-desktop',
    viewModel: {
        type: 'desktop' // references alias "viewmodel.desktop"
    },
    listeners: {
        afterrender: function (desktop) {
            Ext.Context.desktop = desktop;
        }
    },
    items: [{
        region: 'north',
        bind: {
            html: '<h1 style="color:#FFF;padding-left:12px;">{appName}</h1>'
        },
        bodyStyle: 'background-color : #5fa2dd;',
        margin: '0 0 5 0'
    }, {
        region: 'west',
        collapsible: true,
        title: '功能菜单',
        width: 180,
        split: true,
        reference: 'treelistContainer',

        // could use a TreePanel or AccordionLayout for navigational
        // items
        items: [{
            // xtype : 'base-navtree'
            xclass: 'MyApp.view.base.MyNavTree'
        }]
    }, {
        region: 'south',
        bind: {
            title: '欢迎您,{roleName} {userName}  {loginTime}'
        },
        height: 42
    }, {
        region: 'east',
        title: 'East Panel',
        collapsible: true,
        split: true,
        width: 150
    }, {
        region: 'center',
        xtype: 'tabpanel', // TabPanel itself has no title
        activeTab: 0, // First tab active by default
        bodyStyle: "padding-top:2px;",
        items: {
            title: '首页',
            items: [{
                html: '<h1>Welcome To ExtJS 6</h1>'
            }]
        },
        listeners: {
            afterrender: function (mainTab) {
                Ext.Context.mainTab = mainTab
            }
        }
    }]

})