package ctd.mvc.controller.support;


import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import ctd.util.json.support.exception.JSONParseException;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import ctd.account.UserRoleToken;
import ctd.mvc.controller.OutputSupportMVCController;
import ctd.mvc.controller.util.UserRoleTokenUtils;
import ctd.net.rpc.beans.ServiceBean;
import ctd.net.rpc.desc.support.MethodDesc;
import ctd.net.rpc.desc.support.ServiceDesc;
import ctd.net.rpc.json.JSONRequestBean;
import ctd.net.rpc.json.JSONResponseBean;
import ctd.net.rpc.json.JSONRequestParser;
import ctd.net.rpc.util.ServiceAdapter;
import ctd.security.Repository;
import ctd.security.ResourceNode;
import ctd.security.exception.SecurityException;
import ctd.spring.AppDomainContext;
import ctd.util.ServletUtils;
import ctd.util.context.Context;
import ctd.util.context.ContextUtils;
import ctd.util.exception.CodedBase;
import ctd.util.exception.CodedBaseException;
import ctd.util.exception.CodedBaseRuntimeException;

@Controller("mvcJSONRequester")
public class JSONRequester extends OutputSupportMVCController {
	private static final Logger logger = LoggerFactory.getLogger(JSONRequester.class);
	private static final String MVC_AUTHENTICATION =  "mvc_authentication";
	private static final String MVC_EXPIRES = "mvc_expires";
	private static final String LOCAL_DOMAIN_PLACE_HOLDER = "$.";
	private static final String HEADER_SERVICE_ID = "X-Service-Id";
	private static final String HEADER_SERVICE_METHOD = "X-Service-Method";
	private static final String HEADER_ACTION_ID = "X-Action-Id";


    @RequestMapping(value="/**/*.jsonRequest",method=RequestMethod.POST,headers="content-type=application/json")
    public void doJSONRequest(HttpServletRequest request,HttpServletResponse response){
        String beanName = request.getHeader(HEADER_SERVICE_ID);
        String methodName = request.getHeader(HEADER_SERVICE_METHOD);
        String actionId = request.getHeader(HEADER_ACTION_ID);
        dpApiInvoke(beanName,methodName,actionId,request,response);
    }



    @SuppressWarnings("unchecked")
    @RequestMapping(value="/api/{beanName}/{method}",method=RequestMethod.POST,headers="content-type=application/json")
    public void dpApiInvoke(@PathVariable("beanName") String beanName, @PathVariable("method") String methodName, @RequestParam(value="ac", required=false) String actionId,HttpServletRequest request,HttpServletResponse response){
		
		JSONResponseBean responseBean = new JSONResponseBean();
		boolean gzip = ServletUtils.isAcceptGzip(request);
		try {
			
			ContextUtils.put(Context.HTTP_REQUEST, request);
			if(StringUtils.isNotEmpty(beanName)){
                beanName = getRealBeanName(beanName);

                if(!isAccessible(request,beanName,actionId)){
                    throw new SecurityException(SecurityException.ACCESS_DENIED);
                }

				ServiceDesc service = ServiceAdapter.findLocalServiceDesc(beanName);

				if(service == null){
                    byte[] bytes = IOUtils.toByteArray(request.getInputStream());
                    byte[] res = ServiceAdapter.invokeWithJsonBytes(beanName, methodName, bytes);
                    try{
                        jsonBytesOutput(response, res, gzip);
                    }
                    catch(IOException e){
                        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                        logger.error(e.getMessage());
                    }
                    ContextUtils.clear();
                    return;
				}
				else{
                    MethodDesc method = service.getMethodByName(methodName);
                    if(method == null){
                        throw new JSONParseException(JSONParseException.METHOD_NOT_FOUND,"service[" + beanName + "] method[" + methodName + "] not found.");
                    }
                    Object[] parameters = JSONRequestParser.parseParameters(method, request.getInputStream());
                    Object result = ServiceAdapter.invokeLocalService((ServiceBean<?>)service, method, parameters);
                    responseBean.setBody(result);
				}
			}
			else{
				JSONRequestBean requestBean = JSONRequestParser.parse(request.getInputStream());
				actionId = (String) requestBean.getProperty("actionId");
				beanName = requestBean.getServiceId();
				
				if(isAccessible(request,beanName,actionId)){
					Object result = ServiceAdapter.invokeWithJsonRequest(requestBean);
					responseBean.setBody(result);
				}
				else{
					throw new SecurityException(SecurityException.ACCESS_DENIED);
				}
			}
		}
		catch (SecurityException e) {
            outputAuthFailed(response,e);
            ContextUtils.clear();
			return;
		} 
		catch (CodedBaseException e) {
			Throwable t = e.getCause();
			if(t instanceof CodedBase){
				CodedBase c = (CodedBase)t;
				responseBean.setCode(c.getCode());
				responseBean.setMsg(c.getMessage());
			}
			else{
				responseBean.setCode(e.getCode());
				responseBean.setMsg(e.getMessage());
			}
            logger.error("jsonRequest exception.",e);
		}
		catch(CodedBaseRuntimeException e){
			Throwable t = e.getCause();
			if(t instanceof CodedBase){
				CodedBase c = (CodedBase)t;
				responseBean.setCode(c.getCode());
				responseBean.setMsg(c.getMessage());
			}
			else{
				responseBean.setCode(e.getCode());
				responseBean.setMsg(e.getMessage());
			}
            logger.error("jsonRequest exception.",e);
		}
		catch (Exception e) {
			Throwable t = e.getCause();
			if(t instanceof CodedBase){
				CodedBase c = (CodedBase)t;
				responseBean.setCode(c.getCode());
				responseBean.setMsg(c.getMessage());
			}
			else{
				logger.error(e.getMessage(),e);
				response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                ContextUtils.clear();
				return;
			}
		}
		
		try{
			jsonOutput(response,responseBean,gzip);
		} 
		catch (Exception e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            e.printStackTrace();
			logger.error(e.getMessage());
		}
		finally{
			ContextUtils.clear();
		}
		
	}
	
	private String getRealBeanName(String beanName){
		if(beanName.startsWith(LOCAL_DOMAIN_PLACE_HOLDER)){
			beanName = StringUtils.replaceOnce(beanName, "$", AppDomainContext.getName());
		}
		return beanName;
	}
	
	private boolean isAccessible(HttpServletRequest request, String beanName, String actionId) throws CodedBaseException {
		ServiceDesc service = ServiceAdapter.getServiceDesc(beanName);
		if(service == null){
			throw new CodedBaseException(404,"service[" + beanName + "] not found.");
		}
		Boolean authentication = service.getProperty(MVC_AUTHENTICATION, Boolean.class,true);
		boolean access = true;
        UserRoleToken token = null;

        try{
            token = UserRoleTokenUtils.getUserRoleToken(request);
            Map<String,Object> headers = new HashMap<>();
            headers.put(Context.UID, token.getUserId());
            headers.put(Context.URT, token.getId());

            ContextUtils.put(Context.RPC_INVOKE_HEADERS, headers);
            ContextUtils.put(Context.USER_ROLE_TOKEN, token);
        }
        catch (SecurityException e){
            if(authentication == true){
                throw e;
            }
        }

        if(authentication == true && (token == null || !isAccessableAction(token.getRoleId(),actionId))){
            access = false;
        }

		return access;
	}
	
	private boolean isAccessableAction(String principal,String actionId){
		if(StringUtils.isEmpty(actionId)){
			return true;
		}
		String[] paths = actionId.split("/");
		ResourceNode node = Repository.getNode(paths);
		return node.lookupPermissionMode().isAccessible();
	}
}
