package com.bsoft.utils;

/**
 * 字符型工具类
 * Created by yangl on 2017/11/6.
 *
 * @author yangl
 */
public class S {
    public static String toString(Object o) {
        if (o == null) {
            return null;
        }
        return o.toString();
    }

    public static boolean isEmtpy(Object o) {
        return o == null || "".equals(o.toString());
    }
}
