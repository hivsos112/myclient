/**
 * This view is an example list of people.
 */
Ext.define('MyApp.view.main.PersonelList', {
    extend: 'Ext.grid.Panel',
    xtype: 'personlist',

    requires: [
        'MyApp.store.Personnel'
    ],

    title: '用户列表',

    store: {
        type: 'personnel'
    },

    columns: [
        { text: 'Name',  dataIndex: 'name' },
        { text: 'Email', dataIndex: 'email', flex: 1 },
        { text: 'Phone', dataIndex: 'phone', flex: 1 }
    ],

    listeners: {
       // select: 'onItemSelected'
    }
});
