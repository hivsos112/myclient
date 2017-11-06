package com.bsoft.dao;

import ctd.persistence.support.hibernate.HibernateSupportDelegateDAO;
import ctd.persistence.support.hibernate.template.AbstractHibernateStatelessResultAction;
import ctd.persistence.support.hibernate.template.HibernateSessionTemplate;
import ctd.persistence.support.hibernate.template.HibernateStatelessResultAction;
import org.hibernate.Query;
import org.hibernate.StatelessSession;
import org.hibernate.transform.Transformers;

import java.util.List;
import java.util.Map;

/**
 * Created by yangl on 2017/11/2.
 */
public class SimpleDAO extends HibernateSupportDelegateDAO<Map<String, Object>> {

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
                sqlQuery.setResultTransformer(Transformers.ALIAS_TO_ENTITY_MAP).uniqueResult();
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
}
