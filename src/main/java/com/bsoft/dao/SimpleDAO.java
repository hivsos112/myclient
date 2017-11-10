package com.bsoft.dao;

import com.bsoft.entity.SchemaNameDO;
import ctd.persistence.support.hibernate.HibernateSupportDelegateDAO;
import ctd.persistence.support.hibernate.template.AbstractHibernateStatelessResultAction;
import ctd.persistence.support.hibernate.template.HibernateSessionTemplate;
import ctd.persistence.support.hibernate.template.HibernateStatelessAction;
import ctd.persistence.support.hibernate.template.HibernateStatelessResultAction;
import org.hibernate.Query;
import org.hibernate.StatelessSession;
import org.hibernate.transform.Transformers;

import java.util.List;
import java.util.Map;

/**
 * Created by yangl on 2017/11/2.
 */
public class SimpleDAO extends HibernateSupportDelegateDAO<SchemaNameDO> {

    public SimpleDAO() {
        this.setKeyField("id");
    }

    public long getTotalCount(final String sql, final Map<String, Object> params) {
        HibernateStatelessResultAction<Long> action = new AbstractHibernateStatelessResultAction<Long>() {
            @Override
            public void execute(StatelessSession ss) throws Exception {
                Query sqlQuery = ss.createSQLQuery("select count(1) as totalCount from (" + sql + ") a");
                if (params != null) {
                    for (String key : params.keySet()) {
                        sqlQuery.setParameter(key, params.get(key));
                    }
                }
                Object m = sqlQuery.uniqueResult();
                setResult(Long.parseLong(m.toString()));
            }
        };
        HibernateSessionTemplate.instance().execute(action);
        return action.getResult();
    }

    public Map<String, Object> getData(final String sql, final Map<String, Object> params) {
        HibernateStatelessResultAction<Map<String, Object>> action = new AbstractHibernateStatelessResultAction<Map<String, Object>>() {
            @Override
            public void execute(StatelessSession ss) throws Exception {
                Query sqlQuery = ss.createSQLQuery(sql);
                if (params != null) {
                    for (String key : params.keySet()) {
                        sqlQuery.setParameter(key, params.get(key));
                    }
                }
                setResult((Map<String, Object>) sqlQuery.setResultTransformer(Transformers.ALIAS_TO_ENTITY_MAP).uniqueResult());
            }
        };
        HibernateSessionTemplate.instance().execute(action);
        return action.getResult();
    }

    public List<Map<String, Object>> queryData(final String sql, final Map<String, Object> params) {
        HibernateStatelessResultAction<List<Map<String, Object>>> action = new AbstractHibernateStatelessResultAction<List<Map<String, Object>>>() {
            @Override
            public void execute(StatelessSession ss) throws Exception {
                Query sqlQuery = ss.createSQLQuery(sql);
                if (params != null) {
                    for (String key : params.keySet()) {
                        sqlQuery.setParameter(key, params.get(key));
                    }
                }
                sqlQuery.setResultTransformer(Transformers.ALIAS_TO_ENTITY_MAP);
                setResult(sqlQuery.list());
            }
        };
        HibernateSessionTemplate.instance().execute(action);
        return action.getResult();
    }

    public int executeUpdate(final String createSql, final Map<String, Object> params) {
        AbstractHibernateStatelessResultAction<Integer> action = new AbstractHibernateStatelessResultAction<Integer>() {
            @Override
            public void execute(StatelessSession ss) throws Exception {
                int id = 0;
                Query sqlQuery = ss.createSQLQuery(createSql);
                if (params != null) {
                    for (String key : params.keySet()) {
                        sqlQuery.setParameter(key, params.get(key));
                    }
                }
                int i = sqlQuery.executeUpdate();
                if (i > 0 && createSql.trim().startsWith("insert")) {
                    id = Integer.parseInt(ss.createSQLQuery("SELECT LAST_INSERT_ID()").uniqueResult().toString());
                }
                setResult(id);
            }
        };
        HibernateSessionTemplate.instance().executeTrans(action);
        return action.getResult();
    }
}
