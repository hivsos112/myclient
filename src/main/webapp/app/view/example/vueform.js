Ext.define('MyApp.view.example.vueform', {
    extend: 'MyApp.view.base.BaseModule',
    initPanel: function () {
        var id = Ext.id(null, "vue-comp-");
        this.tempId = id;
        var tpl = this.getTemplate();
        var div = document.createElement('div');
        div.id = id;
        div.innerHTML = tpl;
        var panel = Ext.create("Ext.panel.Panel", {
            html: div.outerHTML
        });
        this.panel = panel;
        panel.on("afterrender", this.onReady, this);
        return panel;
    },
    getTemplate: function () {
        return "<template> " +
            "<el-button @click=\"visible = true\">alert提示</el-button>" +
            "<el-button @click=\"open\">提示信息</el-button>" +
            "<el-dialog :visible.sync=\"visible\" title=\"Hello world\">" +
            "<p>欢迎使用 Element</p>" +
            "</el-dialog>" +
            "</template>"
    },
    onReady: function () {
        var me = this;
        var cfg = {
            el: '#' + this.tempId,
            data: function () {
                return {visible: false}
            },
            methods: this.getMethods()
        };
        this.vue = new Vue(cfg);
    },
    getMethods : function() {
        return {
            open: function () {
                //const h = this.vue.$createElement
                // Msg.info("Form表单数据:" + Ext.encode(this.form.getForm().getValues()));
                this.$notify({
                    title: '标题名称',
                    message: "这里是提示信息，这里是提示信息这里是提示信息"
                });
            }
        }
    }

});


