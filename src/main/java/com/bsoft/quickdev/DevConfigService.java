package com.bsoft.quickdev;

import com.bsoft.utils.S;
import com.bsoft.dao.SimpleDAO;
import ctd.util.annotation.RpcService;

import java.util.*;

/**
 * 开发助手
 * Created by yangl on 2017/8/14.
 *
 * @author yangl
 */

public class DevConfigService {

    private SimpleDAO simpleDAO;

    /**
     * 获取表字段信息
     *
     * @return
     */
    @RpcService
    public List<Map<String, Object>> getTableDesc(String tableName) {
        // 根据不同数据库，获取表结构信息
        List<Map<String, Object>> l = simpleDAO.queryData("show full COLUMNS from " + tableName, null);
        return l;
    }

    @RpcService
    public List<Map<String, Object>> getSchema(String schemaId) {
        String sql = "select b.id,b.cd,b.name,b.type,b.dic_id,b.width,b.length,b.fg_vir from c_sy_schema a,c_sy_schema_item b where a.id=b.sid and a.cd=:id";
        Map<String, Object> p = new HashMap<>();
        p.put("id", schemaId);
        return simpleDAO.queryData(sql, p);
    }


    @RpcService
    public Map<String, Object> getTableData(Map<String, Object> body) {
        int pageSize = 0;
        int pageNo = 1;
        long totalCount = 0;
        List l = null;
        Map<String, Object> p = new HashMap<>(16);
        String entryName = S.toString(body.get("entryName"));
        StringBuffer sql = new StringBuffer("select ").append(getFields(entryName)).append(" from ").append(entryName);
        if (body.containsKey("pageSize")) {
            totalCount = simpleDAO.getTotalCount(sql.toString(), p);
            if (totalCount > 0) {
                pageSize = Integer.parseInt(body.get("pageSize").toString());
                pageNo = Integer.parseInt(body.get("pageNo").toString());
                sql.append(" limit :start,:limit ");
                p.put("start", pageSize * (pageNo - 1));
                p.put("limit", pageSize * pageNo);

            }
        }
        l = simpleDAO.queryData(sql.toString(), p);
        Map<String, Object> m = new HashMap<>(16);
        m.put("data", l);
        m.put("totalCount", totalCount);
        return m;
    }

    private String getFields(String entryName) {
        StringBuffer sb = new StringBuffer();
        List<Map<String, Object>> l = getSchema(entryName);
        for (Map<String, Object> m : l) {
            sb.append(m.get("cd")).append(",");
        }
        return sb.substring(0, sb.length() - 1);
    }

    /**
     * 保存schema信息
     *
     * @return
     */
    @RpcService
    public List<Map<String, Object>> saveSchema(String schemaName, List<Map<String, Object>> props) {
        // 保存schema结构信息
        return null;
    }

    public SimpleDAO getSimpleDAO() {
        return simpleDAO;
    }

    public void setSimpleDAO(SimpleDAO simpleDAO) {
        this.simpleDAO = simpleDAO;
    }

}
