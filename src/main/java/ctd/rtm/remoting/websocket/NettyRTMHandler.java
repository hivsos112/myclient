package ctd.rtm.remoting.websocket;

import com.google.common.collect.HashMultimap;
import com.google.common.collect.Multimap;
import ctd.rtm.RTMEndPoint;
import ctd.rtm.RTMMessage;
import ctd.rtm.RTMOutputMessage;
import ctd.rtm.bean.ClientRegisterBean;
import ctd.rtm.bean.RTMSimpleResponse;
import ctd.rtm.listener.RTMClientConnectListener;
import ctd.rtm.listener.RTMClientMessageListener;
import ctd.rtm.remoting.websocket.rtc.RTCSignalingHandler;
import ctd.util.BeanUtils;
import ctd.util.JSONUtils;
import io.netty.channel.Channel;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import io.netty.handler.codec.http.websocketx.CloseWebSocketFrame;
import io.netty.handler.codec.http.websocketx.PingWebSocketFrame;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import io.netty.handler.codec.http.websocketx.WebSocketFrame;
import io.netty.handler.timeout.IdleState;
import io.netty.handler.timeout.IdleStateEvent;
import io.netty.util.AttributeKey;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

public class NettyRTMHandler extends ChannelInboundHandlerAdapter{
	private static final Logger logger = LoggerFactory.getLogger(NettyRTMHandler.class);
	private final static Multimap<String,NettyRTMClientHolder> clients =  HashMultimap.create();
	private final static Multimap<String,NettyRTMClientHolder> topics = HashMultimap.create();
	private final static Map<Long,Channel> channels = new ConcurrentHashMap<>();
	private final static Map<String,RTMClientMessageListener> listeners = new ConcurrentHashMap<>();
	private final static AtomicLong ids = new AtomicLong(0);
	
	private final static int STATUS_NOT_REGISTER_CLIENT = 403;
	private final static int STATUS_REGISTER_VALIDATE_FALIED = 401;
	private final static String TOPIC_KEY = "topic";
	
	private static RTCSignalingHandler rtcSignalingHandler = new RTCSignalingHandler(channels);
	private static RTMClientConnectListener connectListener;
	private final AtomicBoolean isWriteIdled = new AtomicBoolean(false);
	
	
	@SuppressWarnings("unchecked")
	@Override  
    public void channelRead(final ChannelHandlerContext ctx,final Object msg) throws Exception {
		TextWebSocketFrame frame = (TextWebSocketFrame)msg;
		Map<String,Object> data = JSONUtils.parse(frame.text(), Map.class);
		try{
			if(data.containsKey(TOPIC_KEY)){
				String topic = (String) data.get(TOPIC_KEY);
				switch(topic){
					case "REG":
						ClientRegisterBean bean = BeanUtils.map(data, ClientRegisterBean.class);
						doRegister(ctx,bean);
						break;
						
					case "SUBSCRIBE":
						doSubscribe(ctx,data);
						break;
					
					case "DIRECT":
						doDirect(ctx,data);
						break;
					
					case "RTC":
						doRTC(ctx,data);
						break;
						
					default:
						doConsume(ctx,data);
	
				}
			}
		}
		finally{
			frame.release();
		}
		
	}
	
	private void doRTC(ChannelHandlerContext ctx, Map<String, Object> data) {
		Channel c  = ctx.channel();
		NettyRTMClientHolder holder = checkClientHolder(c);
		
		if(holder == null){
			return;
		}
		rtcSignalingHandler.consume(ctx, data, holder);
	}

	private void doDirect(ChannelHandlerContext ctx, Map<String, Object> data) {
		Channel c  = ctx.channel();
		RTMEndPoint endPoint = checkEndPoint(c);
		if(endPoint == null){
			return;
		}
		
		RTMMessage m = new RTMMessage((String)data.get("destTopic"), BeanUtils.map(data.get("endPoint"),RTMEndPoint.class),data.get("data"));

        publish(m);
	}

	private void doConsume(ChannelHandlerContext ctx, Map<String, Object> data) {
		String topic = (String) data.get(TOPIC_KEY);
		if(listeners.containsKey(topic)){
			RTMClientMessageListener ls = listeners.get(topic);
			RTMMessage res = ls.consume(data);
			if(res != null){
				publish(res);
			}
		}
		else{
			logger.warn("discard message for unregistered topic[{}],from client[{}]",topic,ctx.channel().remoteAddress());
		}
	}
	
	private void doRegister(ChannelHandlerContext ctx, ClientRegisterBean bean) {
		
		if(connectListener != null){
			if(!connectListener.validate(bean)){
				CloseWebSocketFrame frame = new CloseWebSocketFrame(STATUS_REGISTER_VALIDATE_FALIED,"validateFailed");
				ctx.writeAndFlush(frame);
				return;
			}
		}
		Channel c = ctx.channel();
		RTMEndPoint endPoint = bean.getEndPoint();
		
		long chid = getChannelId(c);
		
		NettyRTMClientHolder holder = new NettyRTMClientHolder(endPoint , chid);
		setClientHolder(c,holder);
		
		synchronized(clients){
			clients.put(endPoint.getUserId(), holder);
		}
        List<String> tps = bean.getTopics();
        if(tps != null && !tps.isEmpty()){
            synchronized (topics) {
                for (String tp : tps) {
                    holder.addTopic(tp);
                    topics.put(tp,holder);
                }
            }
        }
		channelWrite(c,new RTMSimpleResponse("REG_SUCCESS", chid));
		
		logger.info("client[{}] registered for user[{}].",c.remoteAddress(),endPoint.getUserId());
	}
	
	private RTMEndPoint getEndPoint(Channel c){
		NettyRTMClientHolder holder =  getClientHolder(c);
		if(holder == null){
			return null;
		}
		else{
			return holder.getEndPoint();
		}
	}
	
	private NettyRTMClientHolder getClientHolder(Channel c){
		AttributeKey<NettyRTMClientHolder> holderKey = AttributeKey.valueOf("holder");
		return  c.attr(holderKey).get();
	}
	
	private void setClientHolder(Channel c,NettyRTMClientHolder holder){
		AttributeKey<NettyRTMClientHolder> holderKey = AttributeKey.valueOf("holder");
		c.attr(holderKey).set(holder);
	}
	
	private Long getChannelId(Channel c){
		AttributeKey<Long> cidKey = AttributeKey.valueOf("chid");
		return c.attr(cidKey).get();
	}
	
	private Long setChannelId(Channel c){
		AttributeKey<Long> cidKey = AttributeKey.valueOf("chid");
		long cid = ids.incrementAndGet();
		c.attr(cidKey).set(cid);
		return cid;
	}
	
	private NettyRTMClientHolder checkClientHolder(Channel c){
		NettyRTMClientHolder holder = getClientHolder(c);
		if(holder == null || !clients.containsKey(holder.getEndPoint().getUserId())){
			writeNotRegisterCloseFrame(c);
			return null;
		}
		return holder;
	}
	
	private RTMEndPoint checkEndPoint(Channel c){
		RTMEndPoint endPoint = getEndPoint(c);
		
		if(endPoint == null || !clients.containsKey(endPoint.getUserId())){
			writeNotRegisterCloseFrame(c);
			return null;
		}
		return endPoint;
	}
	
	private void writeNotRegisterCloseFrame(Channel c){
		CloseWebSocketFrame frame = new CloseWebSocketFrame(STATUS_NOT_REGISTER_CLIENT,"NotRegisterClient");
		c.writeAndFlush(frame);
	}
	
	private void doSubscribe(ChannelHandlerContext ctx, Map<String, Object> data) {

		Channel c  = ctx.channel();
		RTMEndPoint endPoint = checkEndPoint(c);
		if(endPoint == null){
			return;
		}
		
		long chid = getChannelId(c);
		
		Collection<NettyRTMClientHolder>  holders =  clients.get(endPoint.getUserId());
		for(NettyRTMClientHolder holder : holders){
			if(holder.getChid() == chid){
				String topic = (String) data.get("value");
				holder.addTopic(topic);
				synchronized(topics){
					if(topics.put(topic, holder)){
						logger.info("topic[{}] subscribe by user[{}]",topic,endPoint.getUserId());
					}
				}
				break;
			}
		}
		
	}
	
	public static void publish(RTMMessage msg){
		String topic = msg.getTopic();
		RTMEndPoint ep = msg.getEndPoint();
		
		List<Channel> destChannels = new ArrayList<>();
		
		if(ep != null){
			String uid = ep.getUserId();
			if(clients.containsKey(uid)){
				Collection<NettyRTMClientHolder> holders =  clients.get(uid);
				for(NettyRTMClientHolder holder : holders){
					if(StringUtils.isEmpty(topic) || holder.containsTopic(topic)){
						Long chid = holder.getChid();
						if(channels.containsKey(chid)){
							RTMEndPoint hep = holder.getEndPoint();
							if(ep.getTokenId() != null && !hep.getTokenId().equals(ep.getTokenId())){
								continue;
							}
							if(StringUtils.isNotEmpty(ep.getRoleId()) && hep.getRoleId().equals(ep.getRoleId())){
								continue;
							}
							Channel c = channels.get(chid);
							destChannels.add(c);
						}
					}
				}
			}
		}
		else{
			if(!StringUtils.isEmpty(topic) && topics.containsKey(topic)){
				Collection<NettyRTMClientHolder> holders =  topics.get(topic);
				
				for(NettyRTMClientHolder holder : holders){
					Long chid = holder.getChid();
					if(channels.containsKey(chid)){
						Channel c = channels.get(chid);
						destChannels.add(c);
					}
				}
			}
		}
		
		if(!destChannels.isEmpty()){
			String msgStr = JSONUtils.toString(msg, RTMOutputMessage.class);
			TextWebSocketFrame frame = new TextWebSocketFrame(msgStr);
			
			for(Channel c : destChannels){
				channelWrite(c,frame.duplicate().retain());
			}
			
			frame.release();
		}
		else{
            logger.info("empty");
        }
		
	}
	
	private static void channelWrite(Channel c,WebSocketFrame frame){
		c.writeAndFlush(frame);
		((NettyRTMHandler)c.pipeline().last()).isWriteIdled.compareAndSet(true, false);
	}
	
	private void channelWrite(Channel c,RTMSimpleResponse msg){
		TextWebSocketFrame frame = new TextWebSocketFrame(JSONUtils.toString(msg));
		c.writeAndFlush(frame);
		((NettyRTMHandler)c.pipeline().last()).isWriteIdled.compareAndSet(true, false);
	}
	
	@Override
	public void channelActive(ChannelHandlerContext ctx) throws Exception {
		Channel c = ctx.channel();
		Long cid = setChannelId(c);
		channels.put(cid,c);
	}
	
	@Override
	public void channelInactive(ChannelHandlerContext ctx) throws Exception{
		AttributeKey<Long> cidKey = AttributeKey.valueOf("chid");
		Channel c = ctx.channel();
		Long cid = c.attr(cidKey).get();
		if(cid != null){
			channels.remove(cid);
		}
		
		NettyRTMClientHolder holder = getClientHolder(c);
		if(c != null){
			RTMEndPoint ep = holder.getEndPoint();
			synchronized(clients){
				clients.get(ep.getUserId()).remove(holder);
			}
			Set<String> tpks = holder.getTopics();
			synchronized(topics){
				for(String s : tpks){
					topics.get(s).remove(holder);
				}
			}
			logger.info("client[{}] closed for user[{}]",c.remoteAddress(),ep.getUserId());
		}
		
	}
	
	@Override
    public void userEventTriggered(ChannelHandlerContext ctx, Object evt) throws Exception {
        if (evt instanceof IdleStateEvent) {
            IdleStateEvent e = (IdleStateEvent) evt;
            if (e.state() == IdleState.READER_IDLE && isWriteIdled.get()) {
            	ctx.close();
            } 
            else if (e.state() == IdleState.WRITER_IDLE) {
            	 RTMEndPoint ep = getEndPoint(ctx.channel());
            	 if(ep == null){
            		writeNotRegisterCloseFrame(ctx.channel());
            	 }
            	 else{
            		 ctx.writeAndFlush(new PingWebSocketFrame());
            		 isWriteIdled.set(true);
            	 }
            }
        }
    }

	public static void setConnectListener(RTMClientConnectListener connectListener) {
		NettyRTMHandler.connectListener = connectListener;
	}
	
	public static void setClientMessageListeners(List<RTMClientMessageListener> ls){
		for(RTMClientMessageListener l : ls){
			listeners.put(l.getTopic(),l);
		}
	} 
	
	public static void clean(){
		listeners.clear();
		channels.clear();
		topics.clear();
		clients.clear();
	}

}
