package ctd.persistence.delegate;

import ctd.net.rpc.proxy.ProxyGenerator;
import ctd.persistence.DAO;
import ctd.persistence.DAOFactory;
import ctd.persistence.ReadDAO;
import ctd.persistence.WriteDAO;
import ctd.persistence.annotation.DAOMethod;
import ctd.persistence.annotation.DAOParam;
import ctd.persistence.support.DelegateDAO;
import ctd.util.ClassResourceUtil;
import ctd.util.MvelTemplater;
import ctd.util.annotation.RpcService;
import javassist.*;
import javassist.bytecode.AnnotationsAttribute;
import javassist.bytecode.ClassFile;
import javassist.bytecode.ConstPool;
import javassist.bytecode.MethodInfo;
import javassist.bytecode.annotation.Annotation;
import javassist.bytecode.annotation.BooleanMemberValue;
import javassist.bytecode.annotation.LongMemberValue;
import javassist.bytecode.annotation.StringMemberValue;
import org.apache.commons.lang3.StringUtils;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class DAOProxyCreator {
	private static final AtomicInteger counter = new AtomicInteger(0);
	private static final String DEFAULT_PARENT_CLASS_NAME = "ctd.persistence.support.hibernate.HibernateSupportDelegateDAO";
	private static final String DEFAULT_PARENT_READ_CLASS_NAME = "ctd.persistence.support.hibernate.HibernateSupportReadDAO";
	private static final String DEFAULT_PARENT_WRITE_CLASS_NAME = "ctd.persistence.support.hibernate.HibernateSupportWriteDAO";
	
	private static final String MVEL_PATH_DELETE = "/ctd/persistence/delegate/template/delete.mvel";
	private static final String MVEL_PATH_DELETE_BETWEEN = "/ctd/persistence/delegate/template/deleteBetween.mvel";
	private static final String MVEL_PATH_DELETE_AB = "/ctd/persistence/delegate/template/deleteByAB.mvel";
	private static final String MVEL_PATH_FIND = "/ctd/persistence/delegate/template/find.mvel";
	private static final String MVEL_PATH_FIND_BETWEEN = "/ctd/persistence/delegate/template/findBetween.mvel";
	private static final String MVEL_PATH_FIND_AB = "/ctd/persistence/delegate/template/findByAB.mvel";
	private static final String MVEL_PATH_FIND_SQL = "/ctd/persistence/delegate/template/findBySql.mvel";
	private static final String MVEL_PATH_GET = "/ctd/persistence/delegate/template/get.mvel";
	private static final String MVEL_PATH_GET_AB = "/ctd/persistence/delegate/template/getByAB.mvel";
	private static final String MVEL_PATH_GET_SQL = "/ctd/persistence/delegate/template/getBySql.mvel";
	private static final String MVEL_PATH_MAPPING = "/ctd/persistence/delegate/template/mapping.mvel";
	private static final String MVEL_PATH_UPDATE = "/ctd/persistence/delegate/template/update.mvel";
	private static final String MVEL_PATH_UPDATE_AB = "/ctd/persistence/delegate/template/updateByAB.mvel";
	private static final String MVEL_PATH_UPDATE_SQL = "/ctd/persistence/delegate/template/updateBySql.mvel";

	private static final String CLS_AN_ORG_CLASS_INFO = "ctd.util.annotation.OriginalClassInfo";
	
	private static final Pattern findPattern1 = Pattern.compile("^(find|query|delete|remove)By([A-Z][\\w$_]*)(Like|LessThan|GreaterThan|After|Before|Between|In|NotIn|Not)$");
	private static final Pattern findPattern2 = Pattern.compile("^(find|query|get|delete|remove|update)([A-Z][\\w$_]*)?By([A-Z][\\w$_]*)(And|Or)([A-Z][\\w$]*)$");
	private static final Pattern findPattern3 = Pattern.compile("^(find|query|get|delete|remove|update)([A-Z][\\w$_]*)?By([A-Z][\\w$_]*)$");
	private static final Pattern findPattern4 = Pattern.compile("^(find|query|get|delete|remove|update)");
	private static final ClassPool cpool = ClassPool.getDefault();
	
	static{
		cpool.importPackage("ctd.persistence.bean");
		cpool.importPackage("ctd.persistence.support.hibernate.template");
		cpool.importPackage("ctd.persistence.support.hibernate");
		cpool.importPackage("ctd.persistence.event.support");
		cpool.importPackage("ctd.util");
		cpool.importPackage("ctd.schema.constants");
		cpool.importPackage("java.util");
	}
	
	@SuppressWarnings("unchecked")
	public static <E> DelegateDAO<E> createProxyDAOBean(String daoClass,ReadDAO<E> r,WriteDAO<E> w) throws Exception{
		cpool.insertClassPath(new ClassClassPath(ctd.persistence.delegate.DAOProxyCreator.class));
		CtClass ct = cpool.get(daoClass);
		
		StringBuilder className = new StringBuilder(daoClass);
		className.append("Impl").append(counter.incrementAndGet());
		CtClass cc = cpool.makeClass(className.toString());
		CtClass cp = cpool.get(DEFAULT_PARENT_CLASS_NAME);
		
		if(ct.isInterface()){	
			cc.addInterface(ct);
			cc.setSuperclass(cp);
		}
		else{
			if(ct.subtypeOf(cp)){
				cc.setSuperclass(ct);
			}
			else{
				throw new IllegalStateException("dao[" + daoClass + "] must be subtype of[" + DEFAULT_PARENT_CLASS_NAME + "]");
			}
		}
		
		try{
			CtMethod[] methods = ct.getMethods();
			parseMethods(cc,methods);
			if(r != null){
				String rn = r.getClass().getName();
				CtClass ctr = cpool.get(rn);
				methods = ctr.getDeclaredMethods();
				mappingMethods(cc,methods,'r',rn);
			}
			if(w != null){
				String wn = w.getClass().getName();
				CtClass ctr = cpool.get(wn);
				methods = ctr.getDeclaredMethods();
				mappingMethods(cc,methods,'w',wn);
			}

            setClassAnnotation(cc,ct);

			DelegateDAO<E> dao = (DelegateDAO<E>) cc.toClass().newInstance();
			DAOFactory.register(daoClass,dao);
			if(r != null){
				dao.setReadDAO(r);
			}
			if(w != null){
				dao.setWriteDAO(w);
			}
			return dao;
		}
		catch(Exception e){
			throw new IllegalStateException("daoClass[" + daoClass + "] create proxy entity failed.", e);
		}
        finally {
            cc.detach();
        }
	}
	
	@SuppressWarnings("unchecked")
	public static <E> ReadDAO<E> createProxyReadDAOBean(String daoClass) throws Exception {
		CtClass ct = cpool.get(daoClass);

        StringBuilder className = new StringBuilder(daoClass);
		className.append("Impl").append(counter.incrementAndGet());
		CtClass cc = cpool.makeClass(className.toString());
		CtClass cp = cpool.get(DEFAULT_PARENT_READ_CLASS_NAME);
		
		if(ct.isInterface()){	
			cc.addInterface(ct);
			cc.setSuperclass(cp);
		}
		else{
			if(ct.subtypeOf(cp)){
				cc.setSuperclass(ct);
			}
			else{
				throw new IllegalStateException("readDao[" + daoClass + "] must be subtype of[" + DEFAULT_PARENT_READ_CLASS_NAME + "]");
			}
		}

        try {
            CtMethod[] methods = ct.getMethods();
            parseMethods(cc, methods);
            setClassAnnotation(cc,ct);
            return (ReadDAO<E>) cc.toClass().newInstance();
        }
        catch (Exception e){
            throw new IllegalStateException("readDaoClass[" + daoClass + "] create proxy entity failed.", e);
        }

	}
	
	@SuppressWarnings("unchecked")
	public static <E> WriteDAO<E> createProxyWriteDAOBean(String daoClass) throws Exception {
		CtClass ct = cpool.get(daoClass);

        StringBuilder className = new StringBuilder(daoClass);
		className.append("Impl").append(counter.incrementAndGet());
		CtClass cc = cpool.makeClass(className.toString());
		CtClass cp = cpool.get(DEFAULT_PARENT_WRITE_CLASS_NAME);
		
		if(ct.isInterface()){	
			cc.addInterface(ct);
			cc.setSuperclass(cp);
		}
		else{
			if(ct.subtypeOf(cp)){
				cc.setSuperclass(ct);
			}
			else{
				throw new IllegalStateException("writeDao[" + daoClass + "] must be subtype of[" + DEFAULT_PARENT_WRITE_CLASS_NAME + "]");
			}
		}
        try {
            CtMethod[] methods = ct.getMethods();
            parseMethods(cc, methods);
            setClassAnnotation(cc,ct);
            return (WriteDAO<E>) cc.toClass().newInstance();
        }
        catch (Exception e){
            throw new IllegalStateException("writeDaoClass[" + daoClass + "] create proxy entity failed.", e);
        }

	}

    public static DAO<?> createProxyRemoteDAOBean(String daoClass,String remoteServiceId) throws Exception{
        CtClass ct = cpool.get(daoClass);
        CtClass cp = cpool.get(DEFAULT_PARENT_CLASS_NAME);
        if(!ct.subtypeOf(cp)){
            throw new IllegalStateException("dao[" + daoClass + "] must be subtype of[" + DEFAULT_PARENT_CLASS_NAME + "]");
        }
        DAO<?> dao = ProxyGenerator.createProxyBean(remoteServiceId, daoClass);
        DAOFactory.register(daoClass,dao);
        return dao;
    }

	private static void setClassAnnotation(CtClass c,CtClass ct) throws IOException {
		ClassFile cf = c.getClassFile();
		ConstPool constpool = cf.getConstPool();
		AnnotationsAttribute at = new AnnotationsAttribute(constpool,AnnotationsAttribute.visibleTag);
		Annotation annot = new Annotation(CLS_AN_ORG_CLASS_INFO, constpool);
		annot.addMemberValue("className",new StringMemberValue(ct.getName(),constpool));
        annot.addMemberValue("lastModified",new LongMemberValue(ClassResourceUtil.resolveLastModified(ct.getName()),constpool));
        annot.addMemberValue("isInterface",new BooleanMemberValue(ct.isInterface(),constpool));
		at.addAnnotation(annot);
		cf.addAttribute(at);
	}

	private static void mappingMethods(CtClass cc, CtMethod[] methods,char p,String cast) throws Exception {
		for(CtMethod m : methods){
			if(!m.hasAnnotation(RpcService.class)){
				continue;
			}
			CtClass returnType = m.getReturnType();
			
			Map<String,Object> ctx = new HashMap<>();
			ctx.put("methodName", m.getName());
			ctx.put("returnType", returnType.getName());
			ctx.put("args", m.getParameterTypes());
			ctx.put("exceptions", m.getExceptionTypes());
			ctx.put("p", p);
			ctx.put("cast", cast);
			
			createMethod(cc, m, MVEL_PATH_MAPPING, ctx);
		}
	}

	private static void parseMethods(CtClass cc,CtMethod[] methods) throws Exception {
		
		for(CtMethod m : methods){
			String fn = m.getName();
			if(!m.hasAnnotation(DAOMethod.class)){
				continue;
			}
			DAOMethod an = (DAOMethod) m.getAnnotation(DAOMethod.class);
			if(!StringUtils.isEmpty(an.sql())){
				createSqlMethod(cc,m);
				continue;
			}
			
			String action;
			Matcher matcher = findPattern1.matcher(fn);
			if(matcher.find()){
				action = matcher.group(1);
				String fieldName  = StringUtils.uncapitalize(matcher.group(2));
				String limit  = StringUtils.uncapitalize(matcher.group(3));
				switch(action){
					case "find":
					case "query":
						createFindLimit(cc,m,fieldName,limit);
						break;
					
					case "delete":
						createDeleteLimit(cc,m,fieldName,limit);
						break;
				}
				
			}
			else{
				matcher = findPattern2.matcher(fn);
				if(matcher.find()){
					action = matcher.group(1);
					String fn1  = StringUtils.uncapitalize(matcher.group(3));
					String link = StringUtils.uncapitalize(matcher.group(4));
					String fn2  = StringUtils.uncapitalize(matcher.group(5));
					
					switch(action){
						case "find":
						case "query":
							createFind2Params(cc,m,fn1,fn2,link);
							break;
						case "delete":
						case "remove":
							createDelete2Params(cc,m,fn1,fn2,link);
							break;
						case "get":
							createGet2Params(cc,m,fn1,fn2,link);
							break;
						case "update":
							String updateFn = StringUtils.uncapitalize(matcher.group(2));
							createUpdate2Params(cc,m,fn1,fn2,link,updateFn);
							break;
					}
					
				}
				else{
					matcher = findPattern3.matcher(fn);
					if(matcher.find()){
						action = matcher.group(1);
						String fieldName = StringUtils.uncapitalize(matcher.group(3));
						
						switch(action){
							case "find":
							case "query":
								createFind(cc,m,fieldName);
								break;
							case "get":
								createGet(cc,m,fieldName);
								break;
							case "delete":
							case "remove":
								createDelete(cc,m,fieldName);
								break;
							case "update":
								String updateFn = StringUtils.uncapitalize(matcher.group(2));
								createUpdate(cc,m,fieldName,updateFn);
						}
					}
					else{
						throw new IllegalStateException("method[" + fn + "] is invalid.");
					}
				}
			}
		}
	}
	
	private static void createMethod(CtClass cc,CtMethod m, String path,Map<String,Object> ctx) throws Exception{
		try{
			String body = (String)MvelTemplater.run(path, ctx);
			
			CtMethod cm = CtNewMethod.make(body, cc);
			copyAnnotations(cm,m);
			cc.addMethod(cm);
			
		}
		catch(CannotCompileException e){
			throw new IllegalStateException("dao method[" + m.getName() + "] compile failed.", e);
		}
	}
	
	private static void copyAnnotations(CtMethod cm,CtMethod m) throws Exception{
		Object[] ans = m.getAnnotations();
		
		MethodInfo methodInfo = cm.getMethodInfo();
		ConstPool constpool = methodInfo.getConstPool();
		AnnotationsAttribute at = new AnnotationsAttribute(constpool,AnnotationsAttribute.visibleTag);
		for(Object a : ans){	
			if(a instanceof DAOMethod){
				continue;
			}
			Annotation annot = new Annotation(a.toString().substring(1), constpool);
			at.addAnnotation(annot);
		}
		methodInfo.addAttribute(at);
		
	}

	private static void createSqlMethod(CtClass cc, CtMethod m) throws Exception {
		DAOMethod an = (DAOMethod) m.getAnnotation(DAOMethod.class);
		String sql = an.sql();
		String fn = m.getName(); 
		String sqlFieldName = "sql_" + fn;
		createSqlField(cc,sqlFieldName,sql);
		
		Matcher matcher = findPattern4.matcher(fn);
		if(matcher.find()){
			String action = matcher.group(1);
			String path = null;
			
			CtClass returnType = m.getReturnType();
			CtClass[] params =  m.getParameterTypes();
			
			Map<String,Object> ctx = new HashMap<>();
			ctx.put("methodName", fn);
			ctx.put("args", params);
			ctx.put("exceptions", m.getExceptionTypes());
			ctx.put("sqlField", sqlFieldName);
			ctx.put("startArg",-1);
			ctx.put("limitArg",-1);
			
			DAOParam[] dps =  an.params();
			ctx.put("dps", dps);
			
			
			Object[][] pas = m.getParameterAnnotations();
			
			Map<String,Integer> paramMap = new HashMap<>();
			for(int i = 0; i < params.length; i ++){
				Object[] as = pas[i];
				if(as.length > 0 && as[0] instanceof DAOParam){
					DAOParam paramAn = (DAOParam) as[0];
					if(StringUtils.isEmpty(paramAn.value())){
						if(paramAn.pageStart()){
							if(!params[i].getSimpleName().equals("int")){
								throw new IllegalStateException("pageStart param must be int type.");
							}
							ctx.put("startArg", i);
						}
						else if(paramAn.pageLimit()){
							if(!params[i].getSimpleName().equals("int")){
								throw new IllegalStateException("pageLimit param must be int type.");
							}
							ctx.put("limitArg", i);
						}
						else{
							throw new IllegalStateException("Annotation[DAOParam] is invalid:value must not empty or pageStart|pageLimit is true");
						}
					}
					else{
						paramMap.put(paramAn.value(), i);
					}
				}
			}
			ctx.put("paramMap", paramMap);
			
			switch(action){
				case "update":
				case "delete":
				case "remove":
					path = MVEL_PATH_UPDATE_SQL;
					break;
				case "find":
				case "query":
					ctx.put("returnType", returnType.getName());
					ctx.put("rtList", returnType.getSimpleName().equals("List"));
					ctx.put("limit", an.limit());
					path = MVEL_PATH_FIND_SQL;
					break;
				
				case "get":
					ctx.put("returnType", returnType.getName());
					path = MVEL_PATH_GET_SQL;
					break;
			}
			createMethod(cc,m,path,ctx);	
		}
		else{
			throw new IllegalStateException("dao method[" + fn + "] is invalid.");
		}
	}

	private static void createLimitCnd(CtClass cc, CtMethod m,String fieldName, String limit,String cndField) throws Exception{
		DAOMethod an = (DAOMethod) m.getAnnotation(DAOMethod.class);
		String defaultCnds = an.cnds();
		
		switch(limit){
			case "like":
				createCndField(cc,m,fieldName,cndField,"like",defaultCnds);
				break;
			
			case "in":
				createCndField(cc,m,fieldName,cndField,"in",defaultCnds);
				break;
			
			case "lessThan":
			case "before":
				createCndField(cc,m,fieldName,cndField,"lt",defaultCnds);
				break;
	
			case "greaterThan":
			case "after":
				createCndField(cc,m,fieldName,cndField,"gt",defaultCnds);
				break;
			
			case "not":
				createCndField(cc,m,fieldName,cndField,"ne",defaultCnds);
				break;
			
			case "between":
				createCndFieldBetween(cc,m,fieldName,cndField,defaultCnds);
				break;
		}
	}
	
	
	
	private static void createDeleteLimit(CtClass cc, CtMethod m,String fieldName, String limit) throws Exception {
		String cndField = "cnd_" + m.getName();
		createLimitCnd(cc,m,fieldName,limit,cndField);
		
		Map<String,Object> ctx = new HashMap<String,Object>();
		ctx.put("methodName", m.getName());
		ctx.put("args", m.getParameterTypes());
		ctx.put("exceptions", m.getExceptionTypes());
		ctx.put("cnd", cndField);
		ctx.put("fieldName", fieldName);
		
		String path = limit.equals("between") ? MVEL_PATH_DELETE_BETWEEN :  MVEL_PATH_DELETE;
		createMethod(cc,m,path,ctx);
	}

	private static void createFindLimit(CtClass cc, CtMethod m,String fieldName, String limit) throws Exception {
		String cndField = "cnd_" + m.getName();
		createLimitCnd(cc,m,fieldName,limit,cndField);
		
		
		CtClass returnType = m.getReturnType();
		
		Map<String,Object> ctx = new HashMap<String,Object>();
		ctx.put("methodName", m.getName());
		ctx.put("returnType", returnType.getName());
		ctx.put("args", m.getParameterTypes());
		ctx.put("exceptions", m.getExceptionTypes());
		ctx.put("cnd", cndField);
		ctx.put("fieldName", fieldName);
		ctx.put("rtList", returnType.getSimpleName().equals("List"));
		
		DAOMethod an = (DAOMethod) m.getAnnotation(DAOMethod.class);
		ctx.put("orderBy", an.orderBy());
		ctx.put("limit", an.limit());
		
		String path =  limit.equals("between") ? MVEL_PATH_FIND_BETWEEN : MVEL_PATH_FIND;
		createMethod(cc,m,path,ctx);
	}

	private static void createGet2Params(CtClass cc, CtMethod m, String fn1,String fn2, String link) throws Exception {
		DAOMethod an = (DAOMethod) m.getAnnotation(DAOMethod.class);
		String defaultCnds = an.cnds();
		
		String cndField = "cnd_" + m.getName();
		createCndField2Params(cc,m,fn1,fn2,link,cndField,defaultCnds);
		
		CtClass returnType = m.getReturnType();
		Map<String,Object> ctx = new HashMap<>();
		ctx.put("methodName", m.getName());
		ctx.put("args", m.getParameterTypes());
		ctx.put("returnType", returnType.getName());
		ctx.put("exceptions", m.getExceptionTypes());
		ctx.put("cnd", cndField);
		ctx.put("fn1", fn1);
		ctx.put("fn2", fn2);
		
		createMethod(cc,m,MVEL_PATH_GET_AB,ctx);
	}

	private static void createDelete2Params(CtClass cc, CtMethod m, String fn1,String fn2, String link) throws Exception {
		
		DAOMethod an = (DAOMethod) m.getAnnotation(DAOMethod.class);
		String defaultCnds = an.cnds();
		
		String cndField = "cnd_" + m.getName();
		createCndField2Params(cc,m,fn1,fn2,link,cndField,defaultCnds);
		
		Map<String,Object> ctx = new HashMap<String,Object>();
		ctx.put("methodName", m.getName());
		ctx.put("args", m.getParameterTypes());
		ctx.put("exceptions", m.getExceptionTypes());
		ctx.put("cnd", cndField);
		ctx.put("fn1", fn1);
		ctx.put("fn2", fn2);
		
		createMethod(cc,m,MVEL_PATH_DELETE_AB,ctx);
	}
	
	private static void createUpdate2Params(CtClass cc, CtMethod m, String fn1,String fn2, String link, String updateFn) throws Exception {
		DAOMethod an = (DAOMethod) m.getAnnotation(DAOMethod.class);
		String defaultCnds = an.cnds();
		
		String cndField = "cnd_" + m.getName();
		createCndField2Params(cc,m,fn1,fn2,link,cndField,defaultCnds);
		
		Map<String,Object> ctx = new HashMap<String,Object>();
		ctx.put("methodName", m.getName());
		ctx.put("args", m.getParameterTypes());
		ctx.put("exceptions", m.getExceptionTypes());
		ctx.put("cnd", cndField);
		ctx.put("fn1", fn1);
		ctx.put("fn2", fn2);
		ctx.put("updateFn", updateFn);
		
		createMethod(cc,m,MVEL_PATH_UPDATE_AB,ctx);
	}

	private static void createFind2Params(CtClass cc, CtMethod m, String fn1,String fn2,String link) throws Exception {
		DAOMethod an = (DAOMethod) m.getAnnotation(DAOMethod.class);
		String defaultCnds = an.cnds();
		
		String cndField = "cnd_" + m.getName();
		createCndField2Params(cc,m,fn1,fn2,link,cndField,defaultCnds);
		
		CtClass returnType = m.getReturnType();
		Map<String,Object> ctx = new HashMap<String,Object>();
		ctx.put("methodName", m.getName());
		ctx.put("args", m.getParameterTypes());
		ctx.put("returnType", returnType.getName());
		ctx.put("exceptions", m.getExceptionTypes());
		ctx.put("cnd", cndField);
		ctx.put("fn1", fn1);
		ctx.put("fn2", fn2);
		ctx.put("rtList", returnType.getSimpleName().equals("List"));
		ctx.put("orderBy", an.orderBy());
		ctx.put("limit", an.limit());
		
		createMethod(cc,m,MVEL_PATH_FIND_AB,ctx);
	}

	private static void createGet(CtClass cc, CtMethod m, String fieldName) throws Exception {
		DAOMethod an = (DAOMethod) m.getAnnotation(DAOMethod.class);
		String defaultCnds = an.cnds();
		
		String cndField = "cnd_" + m.getName();
		createCndField(cc,m,fieldName,cndField,defaultCnds);
		
		CtClass returnType = m.getReturnType();
		Map<String,Object> ctx = new HashMap<String,Object>();
		ctx.put("methodName", m.getName());
		ctx.put("args", m.getParameterTypes());
		ctx.put("returnType", returnType.getName());
		ctx.put("exceptions", m.getExceptionTypes());
		ctx.put("cnd", cndField);
		ctx.put("fieldName", fieldName);
		
		createMethod(cc,m,MVEL_PATH_GET,ctx);
	}
	
	private static void createUpdate(CtClass cc, CtMethod m, String fieldName,String updateFn) throws Exception {
		DAOMethod an = (DAOMethod) m.getAnnotation(DAOMethod.class);
		String defaultCnds = an.cnds();
		
		String cndField = "cnd_" + m.getName();
		createCndField(cc,m,fieldName,cndField,defaultCnds);
		
		Map<String,Object> ctx = new HashMap<String,Object>();
		ctx.put("methodName", m.getName());
		ctx.put("args", m.getParameterTypes());
		ctx.put("exceptions", m.getExceptionTypes());
		ctx.put("cnd", cndField);
		ctx.put("fieldName", fieldName);
		ctx.put("updateFn", updateFn);
		
		createMethod(cc,m,MVEL_PATH_UPDATE,ctx);
	}

	private static void createDelete(CtClass cc, CtMethod m, String fieldName) throws Exception {
		DAOMethod an = (DAOMethod) m.getAnnotation(DAOMethod.class);
		String defaultCnds = an.cnds();
		
		String cndField = "cnd_" + m.getName();
		createCndField(cc,m,fieldName,cndField,defaultCnds);
		
		Map<String,Object> ctx = new HashMap<String,Object>();
		ctx.put("methodName", m.getName());
		ctx.put("args", m.getParameterTypes());
		ctx.put("exceptions", m.getExceptionTypes());
		ctx.put("cnd", cndField);
		ctx.put("fieldName", fieldName);
		
		createMethod(cc,m,MVEL_PATH_DELETE,ctx);
		
	}
	
	private static void createFind(CtClass cc, CtMethod m,String fieldName) throws Exception {
		
		DAOMethod an = (DAOMethod) m.getAnnotation(DAOMethod.class);
		String defaultCnds = an.cnds();
		
		
		String cndField = "cnd_" + m.getName();
		createCndField(cc,m,fieldName,cndField,defaultCnds);
		
		CtClass returnType = m.getReturnType();
		
		Map<String,Object> ctx = new HashMap<String,Object>();
		ctx.put("methodName", m.getName());
		ctx.put("returnType", returnType.getName());
		ctx.put("args", m.getParameterTypes());
		ctx.put("exceptions", m.getExceptionTypes());
		ctx.put("cnd", cndField);
		ctx.put("fieldName", fieldName);
		ctx.put("rtList", returnType.getSimpleName().equals("List"));
		ctx.put("orderBy", an.orderBy());
		ctx.put("limit",an.limit());
		
		createMethod(cc,m,MVEL_PATH_FIND,ctx);
	}
	
	private static void createCndField(CtClass cc,CtMethod m,String fieldName,String cndField,String defaultCnds) throws Exception{
		createCndField(cc,m,fieldName,cndField,"eq",defaultCnds);
	}
	
	private static void createCndField(CtClass cc,CtMethod m,String fieldName,String cndField,String limit,String defaultCnds) throws Exception{
		StringBuilder sb = new StringBuilder();
		sb.append("JSONUtils.parse(\"");
		if(StringUtils.isEmpty(defaultCnds)){
			sb.append("['").append(limit).append("',['$','").append(fieldName).append("'],['$','%$q.").append(fieldName).append("']]");
		}
		else{
			sb.append(defaultCnds);
		}
		sb.append("\",List.class)");
	
		CtField ctField = new CtField(cpool.get("java.util.List"),cndField,cc);
		ctField.setModifiers(Modifier.PRIVATE | Modifier.FINAL);
		cc.addField(ctField,sb.toString());
	}
	
	private static void createSqlField(CtClass cc,String fieldName,String sql) throws Exception{
		CtField ctField = new CtField(cpool.getCtClass("java.lang.String"),fieldName,cc);
		ctField.setModifiers(Modifier.PRIVATE | Modifier.FINAL);
		cc.addField(ctField,"\"" + sql + "\"");
	}
	
	private static void createCndFieldBetween(CtClass cc, CtMethod m,String fieldName, String cndField,String defaultCnds) throws Exception{
		StringBuilder sb = new StringBuilder();
		sb.append("JSONUtils.parse(\"");
		if(StringUtils.isEmpty(defaultCnds)){
			sb.append("['between',['$','").append(fieldName).append("'],['$','%$q.arg0'],['$','%$q.arg1']]");
		}
		else{
			sb.append(defaultCnds);
		}
		sb.append("\",List.class)");
		CtField ctField = new CtField(cpool.get("java.util.List"),cndField,cc);
		ctField.setModifiers(Modifier.PRIVATE | Modifier.FINAL);
		cc.addField(ctField,sb.toString());
	}
	
	private static void createCndField2Params(CtClass cc, CtMethod m,String fn1, String fn2,String link, String cndField,String defaultCnds) throws Exception{
		StringBuilder sb = new StringBuilder();
		sb.append("JSONUtils.parse(\"");
		if(StringUtils.isEmpty(defaultCnds)){
			sb.append("['").append(link).append("',['eq',['$','").append(fn1).append("'],['$','%$q.").append(fn1).append("']],")
			.append("['eq',['$','").append(fn2).append("'],['$','%$q.").append(fn2).append("']]]");
		}
		else{
			sb.append(defaultCnds);
		}
		sb.append("\",List.class)");
		CtField ctField = new CtField(cpool.get("java.util.List"),cndField,cc);
		ctField.setModifiers(Modifier.PRIVATE | Modifier.FINAL);
		cc.addField(ctField,sb.toString());
	}

	

}
