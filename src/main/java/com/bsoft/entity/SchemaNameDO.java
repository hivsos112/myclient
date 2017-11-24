package com.bsoft.entity;

import ctd.schema.annotation.Schema;

import javax.persistence.*;

/**
 * Created by yangl on 2017/11/8.
 */
@Schema
@Entity
@Table(name = "c_sy_schema")
public class SchemaNameDO {

    private int id;
    private String cd;
    private String name;
    private String table_name;
    private String sort;

    @Id
    @Column(name = "id")
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    @Basic
    @Column(name = "cd")
    public String getCd() {
        return cd;
    }

    public void setCd(String cd) {
        this.cd = cd;
    }

    @Basic
    @Column(name = "name")
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Basic
    @Column(name = "table_name")
    public String getTable_name() {
        return table_name;
    }

    public void setTable_name(String table_name) {
        this.table_name = table_name;
    }

    @Basic
    @Column(name = "sort")
    public String getSort() {
        return sort;
    }

    public void setSort(String sort) {
        this.sort = sort;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        SchemaNameDO that = (SchemaNameDO) o;

        if (id != that.id) return false;
        if (cd != null ? !cd.equals(that.cd) : that.cd != null) return false;
        if (name != null ? !name.equals(that.name) : that.name != null) return false;
        if (table_name != null ? !table_name.equals(that.table_name) : that.table_name != null) return false;
        return sort != null ? sort.equals(that.sort) : that.sort == null;
    }

    @Override
    public int hashCode() {
        int result = id;
        result = 31 * result + (cd != null ? cd.hashCode() : 0);
        result = 31 * result + (name != null ? name.hashCode() : 0);
        result = 31 * result + (table_name != null ? table_name.hashCode() : 0);
        result = 31 * result + (sort != null ? sort.hashCode() : 0);
        return result;
    }
}
