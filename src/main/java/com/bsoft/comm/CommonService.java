package com.bsoft.comm;

import ctd.account.UserRoleToken;
import ctd.rtm.RTMBroker;
import ctd.rtm.RTMMessage;
import ctd.util.AppContextHolder;
import ctd.util.annotation.RpcService;
import ctd.util.context.beans.JVMStatBean;
import org.apache.http.client.utils.DateUtils;

import java.util.*;

/**
 * Created by yangl on 2017/8/14.
 */

public class CommonService {
    @RpcService
    public Map<String, Object> loadSystemInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("appName", "基层医疗信息系统");
        UserRoleToken ur = UserRoleToken.getCurrent();   //获取当前登录用户的信息
        info.put("userName", ur.getUserName());
        info.put("roleName", ur.getRoleName());
        info.put("loginTime", DateUtils.formatDate(new Date(), "yyyy-MM-dd HH:mm:ss"));
        return info;
    }

    @RpcService
    public List<Map<String, Object>> getItems() {
        List<Map<String, Object>> l = new ArrayList<>();
        for (int i = 0; i < 6; i++) {
            Map<String, Object> m = new HashMap<>();
            m.put("fieldLabel", "字段" + i);
            m.put("name", "field_" + i);
            if (i == 1) {
                Map<String, Object> dic = new HashMap<>();
                List<String> flds = new ArrayList<>();
                flds.add("key");
                flds.add("text");
                dic.put("fields", flds);
                m.put("dic", dic);
            }
            l.add(m);
        }
        return l;
    }

    @RpcService
    public void sendMessage(String msg) {
        RTMBroker broker = AppContextHolder.getBean("rtmBroker", RTMBroker.class);

        JVMStatBean jvms = new JVMStatBean();

        broker.dispatch(new RTMMessage("JVM_STAT_M", jvms.getOpSystemStatus()));
    }
}
