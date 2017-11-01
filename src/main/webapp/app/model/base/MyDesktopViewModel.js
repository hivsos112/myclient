Ext.define('MyApp.model.base.MyDesktopViewModel', {  
    extend: 'Ext.app.ViewModel',  
  
    alias: 'viewmodel.desktop', // connects to viewModel/type below  
  
    /**
     * 初始化数据从后台获取
     * @type 
     */
    data: {  
        appName: '基层医疗V3.0',
        userName: '管理员',
        roleName : '',
        loginTime : '',
    }
});  