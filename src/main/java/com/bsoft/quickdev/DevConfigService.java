package com.bsoft.quickdev;

import com.bsoft.dao.SimpleDAO;
import com.bsoft.utils.S;
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

    private static final String PageSize = "pageSize";
    private static final String CND = "cnd";
    private static final String SORT = "sort";

    /**
     * 获取表字段信息
     *
     * @return
     */
    @RpcService
    public Map<String, Object> getTableDesc(Map<String, Object> body) {
        String tableName = S.toString(body.get("tableName"));
        Map<String, Object> resp = new HashMap<>(16);
        // 根据不同数据库，获取表结构信息
        List<Map<String, Object>> l = simpleDAO.queryData("show full COLUMNS from " + tableName, null);
        resp.put("data", l);
        return resp;
    }

    @RpcService
    public List<Map<String, Object>> getSchema(String schemaId) {
        String sql = "select b.id,b.cd,b.name,b.type,b.dic_id,b.dic_prop,b.defaultValue,b.width,b.length,b.fg_vir,b.fg_nul,b.fg_hid,b.fg_key,b.fg_filter from c_sy_schema a,c_sy_schema_item b where a.id=b.sid and a.cd=:id order by b.sort";
        Map<String, Object> p = new HashMap<>(16);
        p.put("id", schemaId);
        return simpleDAO.queryData(sql, p);
    }


    @RpcService
    public List<Map<String, Object>> getSchemaName(String schemaId) {
        String sql = "select a.id,a.cd,a.name,a.table_name from c_sy_schema a where a.cd=:id";
        Map<String, Object> p = new HashMap<>(16);
        p.put("id", schemaId);
        return simpleDAO.queryData(sql, p);
    }

    @RpcService
    public Map<String, Object> getData(String entryName, Object pkey) {
        StringBuilder sql = new StringBuilder("select ").append(getFields(entryName)).append(" from ").append(entryName).append(" where id=:id");
        Map<String, Object> p = new HashMap<>(2);
        p.put("id", pkey);
        return simpleDAO.getData(sql.toString(), p);
    }

    @RpcService
    public Map<String, Object> getTableData(Map<String, Object> body) {
        int pageSize = 0;
        int pageNo = 1;
        long totalCount = 0;
        List l = null;
        Map<String, Object> p = new HashMap<>(16);
        String entryName = S.toString(body.get("entryName"));
        StringBuilder sql = new StringBuilder("select ").append(getFields(entryName)).append(" from ").append(entryName);
        if (body.containsKey(CND)) {
            sql.append(" where ").append(body.get(CND));
            Object cndData = body.get("cndData");
            if (cndData != null && cndData instanceof Map) {
                p.putAll((Map<String, Object>) cndData);
            }
        }
        if (body.containsKey(SORT)) {
            sql.append(" order by ").append(body.get(SORT));
        }
        if (body.containsKey(PageSize)) {
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
        StringBuilder sb = new StringBuilder();
        List<Map<String, Object>> l = getSchema(entryName);
        for (Map<String, Object> m : l) {
            sb.append(m.get("cd")).append(",");
        }
        return sb.length() > 0 ? sb.substring(0, sb.length() - 1) : "";
    }

    private int updateData(String schemaName, Map<String, Object> data) {
        List<Map<String, Object>> l = getSchema(schemaName);
        StringBuilder updateSql = new StringBuilder("update ").append(schemaName).append(" set ");
        List<String> fields = new ArrayList<>();
        Map<String, Object> params = new HashMap<>();
        String condition = null;
        for (int i = 0; i < l.size(); i++) {
            Map<String, Object> item = l.get(i);
            if ((boolean) item.get("fg_vir")) {
                continue;
            }
            String cd = S.toString(item.get("cd"));
            if ((boolean) item.get("fg_key")) {
                condition = cd + "=:" + cd;
                params.put(cd, data.get(cd));
                continue;
            }
            if (data.containsKey(cd)) {
                if (fields.size() > 0) {
                    updateSql.append(",");
                }
                fields.add(cd);
                params.put(cd, data.get(cd));
                updateSql.append(cd).append("=:").append(cd);
            }
        }
        updateSql.append(" where ").append(condition);
        return simpleDAO.executeUpdate(updateSql.toString(), params);
    }

    private int saveData(String schemaName, Map<String, Object> data) {
        List<Map<String, Object>> l = getSchema(schemaName);
        StringBuilder createSql = new StringBuilder("insert into ").append(schemaName).append("(");
        List<String> fields = new ArrayList<>();
        Map<String, Object> params = new HashMap<>();
        for (int i = 0; i < l.size(); i++) {
            if ((boolean) l.get(i).get("fg_vir")) {
                continue;
            }
            String cd = S.toString(l.get(i).get("cd"));
            if (data.containsKey(cd)) {
                if (fields.size() > 0) {
                    createSql.append(",");
                }
                fields.add(cd);
                params.put(cd, data.get(cd));
                createSql.append(cd);
            }
        }
        createSql.append(") values(");
        for (int i = 0; i < fields.size(); i++) {
            createSql.append(":").append(fields.get(i));
            if (i == (fields.size() - 1)) {
                createSql.append(")");
            } else {
                createSql.append(",");
            }

        }
        return simpleDAO.executeUpdate(createSql.toString(), params);
    }

    /**
     * 保存schema信息
     *
     * @return
     */
    @RpcService
    public Map<String, Object> saveSchemaName(String op, Map<String, Object> data) {
        Map<String, Object> res = new HashMap<>();
        // 保存schema结构信息
        if ("create".equals(op)) {
            int keyValue = saveData("c_sy_schema", data);
            res.put("keyValue", keyValue);
        } else {
            int n = updateData("c_sy_schema", data);
            res.put("count", n);
        }
        return res;
    }

    @RpcService
    public Map<String, Object> saveSchemaItem(String op, Map<String, Object> data) {
        Map<String, Object> res = new HashMap<>();
        // 保存schemaItem结构信息
        if ("create".equals(op)) {
            int keyValue = saveData("c_sy_schema_item", data);
            res.put("keyValue", keyValue);
        } else {
            int n = updateData("c_sy_schema_item", data);
            res.put("count", n);
        }
        return res;
    }

    @RpcService
    public void saveAsItems(String schemaId, List<Map<String, Object>> fields) {
        // 已经存在的不保存
        List<Map<String, Object>> l = getSchema(schemaId);
        Set<String> set = new HashSet<>();
        for (Map m : l) {
            set.add(S.toString(m.get("cd")));
        }
        for (Map fd : fields) {
            if (set.contains(S.toString(fd.get("cd")))) continue;
            saveData("c_sy_schema_item", fd);
        }
    }

    @RpcService
    public void saveItemSort(List<Map<String, Object>> sortInfo) {
        // 已经存在的不保存
        for (Map m : sortInfo) {
            updateData("c_sy_schema_item", m);
        }
    }

    /**
     * 保存字典类型字段的扩展属性
     *
     * @param dicProp
     */
    @RpcService
    public void saveItemDicProp(String op ,Map<String, Object> dicProp) {
        // 已经存在的不保存
        updateData("c_sy_schema_item", dicProp);
    }

    /**
     * 获取字典类型字段的扩展属性
     *
     * @param pkey
     */
    @RpcService
    public Map<String, Object> getItemDicProp(String entryName, Object pkey) {
        entryName = "c_sy_schema_item";
        return getData(entryName, pkey);
    }

    /**
     * 删除schema信息
     *
     * @return
     */
    @RpcService
    public void deleteSchemaName(Object value) {
        String deleteSql = "delete from c_sy_schema where id=:id";
        Map<String, Object> p = new HashMap<>();
        p.put("id", value);
        simpleDAO.executeUpdate(deleteSql, p);
    }


    public SimpleDAO getSimpleDAO() {
        return simpleDAO;
    }

    public void setSimpleDAO(SimpleDAO simpleDAO) {
        this.simpleDAO = simpleDAO;
    }

}
