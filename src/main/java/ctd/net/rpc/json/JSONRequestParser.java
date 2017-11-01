package ctd.net.rpc.json;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import ctd.net.rpc.desc.support.MethodDesc;
import ctd.net.rpc.desc.support.ParameterDesc;
import ctd.net.rpc.desc.support.ServiceDesc;
import ctd.net.rpc.util.ServiceAdapter;
import ctd.spring.AppDomainContext;
import ctd.util.json.support.JSONParseUtils;
import ctd.util.json.support.exception.JSONParseException;
import org.apache.commons.lang3.StringUtils;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


public class JSONRequestParser {
	private static final String NM_SERVICE_ID = "serviceId";
	private static final String NM_BEAN_NAME  = "beanName";
	private static final String NM_METHOD     = "method"; 
	private static final String NM_BODY       = "body";
	private static final String NM_PARAMETERS = "parameters";
	
	private static final String LOCAL_DOMAIN_PLACE_HOLDER = "$.";

	
	public static void warmUpBean(Class<?> clz){
		JSONParseUtils.warmUpBean(clz);
	}
	
	public static JSONRequestBean parse(byte[] bytes) {
		JsonParser jp = JSONParseUtils.createParser(bytes);
		return parse(jp);
	}
	
	public static JSONRequestBean parse(String s) {
		JsonParser jp = JSONParseUtils.createParser(s);
		return parse(jp);
	}
	
	public static JSONRequestBean parse(InputStream is) {
		JsonParser jp = JSONParseUtils.createParser(is);
		return parse(jp);
	}
	
	public static Object[] parseParameters(MethodDesc methodDesc, byte[] bytes){
		JsonParser jp = JSONParseUtils.createParser(bytes);
		return parseBody(methodDesc,jp);
	}

    public static Object[] parseParameters(MethodDesc methodDesc, InputStream is){
        JsonParser jp = JSONParseUtils.createParser(is);
        return parseBody(methodDesc,jp);
    }
	
	private static JSONRequestBean parse(JsonParser jp){
		try{
			if (jp.nextToken() != JsonToken.START_OBJECT) {
				throw new JSONParseException(JSONParseException.JSON_OBJECT_NEEDED,"Expected data to start with an Object");
			}
			
			String serviceId = null;
			String method = null;
			Object[] parameters = null;
			Map<String,Object> properties = null;
			
			while(jp.nextToken() != null){
				JsonToken token = jp.getCurrentToken();
				if(token == JsonToken.FIELD_NAME){
					String nm = jp.getCurrentName();
					
					switch(nm){
						case NM_SERVICE_ID:
						case NM_BEAN_NAME:
							serviceId = jp.nextTextValue();
							if(StringUtils.isEmpty(serviceId)){
								throw new JSONParseException(JSONParseException.SERVICE_ID_MISSING,"serviceId is required.");
							}
							if(serviceId.startsWith(LOCAL_DOMAIN_PLACE_HOLDER)){
								serviceId = StringUtils.replaceOnce(serviceId, "$", AppDomainContext.getName());
							}
							break;
							
						case NM_METHOD:
							method = jp.nextTextValue();
							if(StringUtils.isEmpty(method)){
								throw new JSONParseException(JSONParseException.METHOD_MISSING,"method is required.");
							}
							break;
						
						
						case NM_BODY:
						case NM_PARAMETERS:
							if(StringUtils.isEmpty(serviceId) || StringUtils.isEmpty(method)){
								throw new JSONParseException(JSONParseException.BODY_POSITION,"[serviceId] and [method] must defined before [body].");
							}
							ServiceDesc serviceDesc = ServiceAdapter.getServiceDesc(serviceId);
							if(serviceDesc == null){
								throw new JSONParseException(JSONParseException.SERVICE_NOT_FOUND,"service[" + serviceId + "] not found.");
							}
							MethodDesc methodDesc = serviceDesc.getMethodByName(method);
                            if(methodDesc == null){
								throw new JSONParseException(JSONParseException.METHOD_NOT_FOUND,"service[" + serviceId + "] method[" + method + "] not found.");
							}
							parameters = parseBody(methodDesc,jp);
							break;
						
						default:
							if(properties == null){
								properties = new HashMap<>();
							}
							jp.nextToken();
							properties.put(nm, JSONParseUtils.parseValue(Object.class, null, jp));
					}
				} //if
			}//while
			if(StringUtils.isEmpty(serviceId) || StringUtils.isEmpty(method)){
				throw new JSONParseException(JSONParseException.BODY_POSITION,"[serviceId] and [method] is required.");
			}
			return new JSONRequestBean(serviceId,method,parameters,properties);
		}
		catch(IOException e){
			throw new JSONParseException(JSONParseException.IO_ERROR,e);
		}
	}

	private static Object[] parseBody(MethodDesc methodDesc, JsonParser jp)  {
			try{
				if(jp.nextToken() != JsonToken.START_ARRAY){
					throw new JSONParseException(JSONParseException.JSON_OBJECT_NEEDED,"Expected [body] to start with an Array");
				}
				
				List<ParameterDesc> params =  methodDesc.getParameters();
				int n = params.size();
				if(n == 0){
					return null;
				}
				Object[] result = new Object[params.size()];
				int i = 0;
				for(ParameterDesc p : params){
					Class<?> type = p.typeClass();
					jp.nextToken();
					result[i] = JSONParseUtils.parseValue(type,p.actualTypeClass(),jp,true);
					i++;
				}
				return result;
			}
			catch(JsonParseException e){
				throw new JSONParseException("json parse error.",e);
			}
			catch(IOException e){
				throw new JSONParseException("json parse io error.",e);
			}	
	}
	
}
