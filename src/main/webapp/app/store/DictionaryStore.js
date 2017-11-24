Ext.define('MyApp.store.Dictionary', {
    extend: 'Ext.data.Store',
    alias: 'store.dictionary',
    fields: [],
    proxy: {
        type: 'ajax',
        url : dicId + "",
        reader: {
            type: 'json',
            rootProperty: 'items'
        }
    }
});
