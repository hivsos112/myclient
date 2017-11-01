<application id="hcn.base.Base" name="基础管理" icon="zmdi zmdi-swap-alt" xmlns="http://www.bsoft.com.cn/schema/ssdev-core"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xsi:schemaLocation="http://www.bsoft.com.cn/schema/ssdev-core
             http://www.bsoft.com.cn/schema/ssdev/ssdev-core.xsd">
    <properties>
        <p name="createDt">124578</p>
    </properties>
    <category id="ca1" name="业务系统">
        <module id="person" name="个人信息" icon="zmdi zmdi-label" >
            <action id="add" name="新增" icon="zmdi zmdi-create" />
            <action id="remove" name="删除" />
        </module>
        <module id="patientManage" name="患者管理">
            <platforms>
                <platform id="2097152" url="hcn.utils.sm.web.ServiceManager" />
            </platforms>
            <properties>
                <p name="parentId">doctorMain</p>
                <p name="index">1</p>
                <p name="family">true</p>
            </properties>
        </module>
        <module id="apps" name="应用管理" icon="zmdi zmdi-local-activity" url="ssdev.admin.app.Apps"/>
    </category>
    <module id="resourceQuery" name="资源查询">
        <platforms>
            <platform id="2097152"/>
        </platforms>
        <properties>
            <p name="parentId">doctorMain</p>
            <p name="index">2</p>
        </properties>
    </module>
</application>
