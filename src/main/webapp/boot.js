(function(g){
    "use strict";
	var ns = function(s){
		if(s === ""){
			return g;
		}
		var pkgs = s.split(".");
		var obj = g;
		for (var i = 0; i < pkgs.length; i++) {
			var p = pkgs[i];
			if(!obj[p]){
				obj[p] = {};
			}
			else{
				if(obj[p].$isClass ===  true){
					throw new Error(p + " is class,can't be package name.")
				}
			}
			obj = obj[p];
		}
		return obj
	};
	g.$package = ns;
	
	var findClass = function(s){
		var pkgs = s.split(".");
		var obj = g,p;
		
		for(var i = 0; i < pkgs.length; i ++){
			p = pkgs[i];
			if(obj[p]){
				obj = obj[p]
			}
			else{
				return null;
			}
		}
		
		if(obj.$isClass === true){
			return obj;
		}
		return null;
	};
	g.$findClass = findClass;
	
	var appRootOffsetPath = function() {
			if(window.location.protocol == "file:"){
				return "";
			}
			var pathname = window.location.pathname;
			if(pathname.slice(0,1) != "/"){
				pathname = "/" + pathname;
			}
			var fds = pathname.split("/");
			var tiers = fds.length - 3;
			var offset = "";
			for (var i = 0; i < tiers; i++) {
				offset += "../";
			}
			return offset;
		}();
	
	var emptyFunction = function(){};
	g.$emptyFunction = emptyFunction;
	
	var env = {
		appRootOffsetPath:appRootOffsetPath,
		resourcesHome:appRootOffsetPath + "resources/"
	};
	
	(function(){
		var ua = navigator.userAgent.toLowerCase();
		var check = function(r){               
			return r.test(ua);  
		};
		var version = function (is, regex) {
            var m;
            return (is && (m = regex.exec(ua))) ? parseFloat(m[1]) : 0;
        };
		var isOpera = check(/opera/);
		var isWebKit = check(/webkit/);
		var isChrome = check(/\bchrome\b/);
		var isSafari = !isChrome && check(/safari/);
		var isIE = !isOpera && check(/msie/);
		var isIE6 = isIE && check(/msie 6/);
		var isIE11 = check(/like gecko/) && !isWebKit;
		var isGecko = !isWebKit && check(/gecko/);
        var isFirefox = check(/\bfirefox/);
    	var isNodeWebkit = g.process && process.versions && process.versions['node-webkit'];
    	
        env.isWebKit = isWebKit;
		env.isOpera = isOpera;
		env.isChrome = isChrome;
		env.isSafari = isSafari;
		env.isIE = isIE || isIE11;
		env.isIE6 = isIE6;
		env.isGecko = isGecko;
		env.isFirefox=isFirefox;
		env.isNodeWebkit = isNodeWebkit;
        
        var chromeVersion = version(isChrome, /\bchrome\/(\d+\.\d+)/);
        var firefoxVersion = version(isFirefox, /\bfirefox\/(\d+\.\d+)/);
        var ieVersion = version(isIE&!isIE11, /msie (\d+\.\d+)/);
        var ie11Version = version(isIE11,/rv:([\d.]+)\) like gecko/);
        var safariVersion = version(isSafari, /version\/(\d+\.\d+)/);
        
        env.chromeVersion = chromeVersion;
        env.firefoxVersion = firefoxVersion;
        env.ieVersion = ieVersion || ie11Version;
        env.safariVersion = safariVersion;
        
        var defaultExpiresDate = (new Date("December 31, 2020")).toGMTString();
        env.setCookie = function(name,value){
        	var argv = arguments,
            argc = arguments.length,
            expires = (argc > 2) ? argv[2] : defaultExpiresDate,
            path = (argc > 3) ? argv[3] : '/',
            domain = (argc > 4) ? argv[4] : null,
            secure = (argc > 5) ? argv[5] : false;            
            document.cookie = name + "=" + encodeURI(value) + ((expires === null) ? defaultExpiresDate : ("; expires=" + expires)) + ((path === null) ? "" : ("; path=" + path)) + ((domain === null) ? "" : ("; domain=" + domain)) + ((secure === true) ? "; secure" : "");
        };
        
        env.setCookies = function(data){
        	if(is.Object(data)){
                var nm;
        		for(nm in data){
                    if(data.hasOwnProperty(nm)) {
                        env.setCookie(nm, data[nm])
                    }
        		}
        	}
        };
        
        env.getCookie = function(name){
        	var arg = name + "=",
            alen = arg.length,
            clen = document.cookie.length,
            i = 0,
            j = 0;
            
	        while(i < clen){
	            j = i + alen;
	            if(document.cookie.substring(i, j) == arg){
	                return getCookieVal(j);
	            }
	            i = document.cookie.indexOf(" ", i) + 1;
	            if(i === 0){
	                break;
	            }
	        }
	        return null;
        };
        
        env.clearCookie = function(name, path){
        	if(is.Array(name)){
        		for(var i = 0; i < name.length; i ++){
        			env.clearCookie(name[i],path)
        		}
        		return;
        	}
	        if(this.getCookie(name)){
	            path = path || '/';
	            document.cookie = name + '=' + '; expires=Thu, 01-Jan-70 00:00:01 GMT; path=' + path;
	        }
	    };
	    
	    var getCookieVal = function(offset){
	        var endstr = document.cookie.indexOf(";", offset);
	        if(endstr == -1){
	            endstr = document.cookie.length;
	        }
	        return decodeURI(document.cookie.substring(offset, endstr));
	    }
	})();
	g.$env = env;
	
	//console
	if (typeof console == "undefined") {
		g.console = {
			log:emptyFunction,
			debug:emptyFunction,
			info:emptyFunction,
			warn:emptyFunction,
			error:emptyFunction,
			trace:emptyFunction
		};
	}
	
	//function bind
	if (!Function.prototype.bind) {
		  Function.prototype.bind = function (o) {
		    if (typeof this !== "function") {
		      throw new TypeError("Function.prototype.bind - arg must be function");
		    }
		    var args = Array.prototype.slice.call(arguments, 1), 
		        fToBind = this, 
		        fNOP = function () {},
		        fBound = function () {
		          return fToBind.apply(this instanceof fNOP && o ? this : o, args.concat(Array.prototype.slice.call(arguments)));
		        };
		    fNOP.prototype = this.prototype;
		    fBound.prototype = new fNOP();
		    return fBound;
		  }
	  }
	
    //is
	var types = ["Array", "Boolean", "Date", "Number", "Object", "Function" , "RegExp", "String", "Window", "HTMLDocument","Undefined"];
	var is = {};
	for(var i = 0; i < types.length; i ++){
		var t = types[i];
		is[t] = (function(tp){
			return function(obj){
				return Object.prototype.toString.call(obj) == "[object " + tp + "]"; 
			}
		})(t);
	}
	is.Class = function(obj){
		return is.Function(obj) && obj.$isClass === true;
	};
	g.$is = is;
	
	//use native promise
    var Defer;

	if(is.Function(Promise)){
		Promise.prototype.fail = Promise.prototype["catch"];
		Promise.prototype.success = Promise.prototype.then;
		Defer = function(){
			var me = this;
			me.promise = new Promise(function(resolve,reject){
				me.resolve = resolve;
				me.reject = reject;
			});
		};

        //when
        var when = {};
        when.all = function(tasks) {
            return Promise.all(tasks);
        };
        when.any = function(tasks){
            return Promise.race(tasks);
        };
        g.$when = when;
	}
	else{
		//promise implements
        (function() {
            var STATES = {pending: void 0, resolved: 1, rejected: 2};
            var thenable = function (o) {
                return is.Object(o) && is.Function(o.then);
            };
            var Promise = function () {
                this.resolves = [];
                this.rejects = [];
                this.state = STATES.pending;
                this.value = void 0;
            };

            Promise.prototype = {
                then: function (resolve, reject) {
                    var deferred = new Defer();
                    var resolveWrapper = function (value) {
                        try {
                            var ret = is.Function(resolve) ? resolve(value) : value;
                            if (thenable(ret)) {
                                ret.then(function (newValue) {
                                    deferred.resolve(newValue);
                                }, function (newReason) {
                                    deferred.reject(newReason);
                                });
                            }
                            else {
                                deferred.resolve(ret);
                            }
                        }
                        catch (e) {
                            deferred.reject(e);
                        }
                    };
                    var rejectWrapper = function (reason) {
                        if (is.Function(reject)) {
                            try {
                                reject(reason);
                            }
                            catch (e) {
                                deferred.reject(e);
                            }
                        }
                        else {
                            deferred.reject(reason);
                        }
                    };

                    var me = this;
                    switch (me.state) {
                        case STATES.pending:
                            me.resolves.push(resolveWrapper);
                            me.rejects.push(rejectWrapper);
                            break;

                        case STATES.resolved:
                            setTimeout(function () {
                                resolveWrapper(me.value)
                            }, 0);
                            break;

                        case STATES.rejected:
                            setTimeout(function () {
                                rejectWrapper(me.value);
                            }, 0);
                    }
                    return deferred.promise;
                },
                success: function (resolve) {
                    return this.then(resolve, null);
                },
                fail: function (reject) {
                    return this.then(null, reject);
                }
            };

            Defer = function (promise) {
                if (promise) {
                    this.promise = promise;
                }
                else {
                    this.promise = new Promise();
                }
            };

            Defer.prototype = {
                resolve: function (value) {
                    var promise = this.promise;
                    if (promise.state != STATES.pending) {
                        return;
                    }
                    promise.state = STATES.resolved;
                    promise.value = value;
                    var timer = setTimeout(function () {
                        var resolves = promise.resolves;
                        for (var i = 0; i < resolves.length; i++) {
                            resolves[i](value)
                        }
                    }, 0);

                },
                reject: function (reason) {
                    var promise = this.promise;
                    if (promise.state != STATES.pending) {
                        return;
                    }
                    promise.state = STATES.rejected;
                    promise.value = reason;
                    var timer = setTimeout(function () {
                        var rejects = promise.rejects;
                        for (var i = 0; i < rejects.length; i++) {
                            rejects[i](reason)
                        }
                    }, 0);

                }
            };

            //when
            var when = {};

            when.all = Promise.prototype.all = function (tasks) {

                var defer = new Defer();
                var results = [];
                var count = 0;
                var n = tasks.length;
                var resolved = 0;

                var nextThen = function (i) {
                    return function (v) {
                        results[i] = v;
                        count++;
                        if (count == n) {
                            defer.resolve(results);
                        }
                    }
                };

                for (var i = 0; i < n; i++) {
                    var p = tasks[i];
                    if (thenable(p)) {
                        p.then(nextThen(i), function (e) {
                            defer.reject(e);
                        });
                    }
                    else {
                        nextThen(i)(p);
                    }
                }
                return defer.promise;
            };

            when.any = function (tasks) {
                var defer = new Defer();
                for (var i = 0; i < tasks.length; i++) {
                    var p = tasks[i];
                    if (thenable(p)) {
                        p.then(function (v) {
                            defer.resolve(v);
                        }, function (e) {
                            defer.reject(e);
                        });
                    }
                    else {
                        defer.resolve(v);
                    }
                }
                return defer.promise;
            };
            g.$when = when;
        })();

	}//promise
	
	g.$Defer = function(){
		return new Defer();
	};

    //ajax
    var APPLICATION_JSON_TYPE = "application/json";
    var JAVASCRIPT_TYPE = "text/javascript";
    var X_CODED_JSON_MESSAGE = "X-Coded-JSON-Message";
    var X_ACCESS_TOKEN = "X-Access-Token";
    var JSON_REQUREST_URL = "*.jsonRequest";
    var CONTENT_TYPE = "Content-Type";
    var CHARSET = "utf-8";

    var isJsonContentType = function(type){
        if(is.String(type)){
            return type.substring(0,16).toLowerCase() == APPLICATION_JSON_TYPE;
        }
    };

    var parseResponse = function(xhr,conf){
        var result = {code:200,msg:"Success"};
        var status = xhr.status;
        if(status == 0){
            result.code = 401;
            result.msg = "ConnectFailed"
        }
        else if(status < 400){
            var contentType = xhr.getResponseHeader(CONTENT_TYPE);

            if(isJsonContentType(contentType)){
                try{
                    var json;
                    if(xhr.responseType == 'json'){
                        json = xhr.response;
                    }
                    else{
                        json = $decode(xhr.responseText);
                    }
                    var isCodedMessage = xhr.getResponseHeader(X_CODED_JSON_MESSAGE);
                    if(isCodedMessage){
                        apply(result,json);
                    }
                    else{
                        result.body = json;
                    }
                }
                catch(e){
                    result.code = 509;
                    result.msg = "ParseResponseError";
                }
            }
            else if(conf.responseType == "blob"){
                result.body = new Blob([xhr.response],{type:contentType});
            }
            else if(conf.responseType == "arraybuffer"){
                result.body = xhr.response;
            }
            else{
                result.body = xhr.responseText;
            }
        }
        else if(status == 403){
            result.code = 403;
            result.msg = "AccessDenied";
        }
        else{
            result.code = status;
            result.msg = "ServerError"
        }
        return result;
    };

    var createAjaxUrl = function(conf){
        if(!conf.url){
            return JSON_REQUREST_URL;
        }
        var url = conf.url;
        var params = conf.params || {};
        var q= [];
        var nm;
        for(nm in params){
            if(params.hasOwnProperty(nm)){
                var v = params[nm];
                if(is.Undefined(v)){
                    v = "";
                }
                q.push(nm +"=" + encodeURIComponent(v));
            }
        }
        if(q.length){
            url += (url.indexOf('?') === -1 ? '?' : '&') + q.join("&");
        }
        return url;
    };

    var isRetry = false;
    var ajax = function(conf){
        var url = createAjaxUrl(conf);
        var method = conf.method || "POST";
        var xhr = createNewTransport();
        var async = !conf.sync;
        var defer = new Defer();
        try{
            xhr.open(method, url, async);
            if(conf.responseType){
                xhr.responseType = conf.responseType;
            }
            if(is.Function(conf.outboundProgress) && ('upload' in xhr)){
                xhr.upload.onprogress = conf.outboundProgress;
            }
            if(is.Function(conf.inboundProgress) && ('onprogress' in xhr)){
                xhr.onprogress = conf.inboundProgress
            }
            if(async){
                xhr.onreadystatechange = function(){
                    if(xhr.readyState == 4){
                        xhr.onreadystatechange = $emptyFunction;
                        var result = parseResponse(xhr,conf);
                        if(result.code == 403 && !isRetry){
                            var notLogonCall = $AppContext.notLogonCallback;
                            if(is.Function(notLogonCall)){
                                notLogonCall().then(function(){
                                    isRetry = true;
                                    ajax(conf).then(function(v){
                                        isRetry = false;
                                        defer.resolve(v)
                                    })
                                    .fail(function(v){
                                        isRetry = false;
                                        defer.reject(v);
                                    })
                                })
                                .fail(function(){
                                    defer.reject(result);
                                });
                            }
                            else{
                                defer.reject(result)
                            }
                        }
                        else if(result.code < 300){
                            defer.resolve(result);
                        }
                        else{
                            defer.reject(result)
                        }
                    }
                };
            }

            var jsonData = conf.jsonData;
            var formData = conf.formData;
            var headers = conf.headers;
            if(headers){
                var h;
                for(h in headers){
                    if(headers.hasOwnProperty(h)){
                        var hv = headers[h];
                        if(is.Undefined(hv))
                            continue;
                        xhr.setRequestHeader(h,hv);
                    }
                }
            }
            if(env.accessToken){
                xhr.setRequestHeader(X_ACCESS_TOKEN,env.accessToken);
            }
            if(jsonData){
                xhr.responseType = 'json';
                xhr.setRequestHeader('encoding',CHARSET);
                xhr.setRequestHeader("content-Type",APPLICATION_JSON_TYPE);
                xhr.send($encode(jsonData))
            }
            else if(formData){
                xhr.send(formData);
            }
            else{
                xhr.send();
            }
        }
        catch(e){
            result = {code:400,msg:"Unknow error",err:e};
            if(async){
                defer.reject(result)
            }
            else{
                return result;
            }
        }
        if(async){
            return defer.promise;
        }
        else{
            var result;
            if(xhr.readyState == 4){
                result = parseResponse(xhr,conf);
            }
            else{
                result = {code:401,msg:"ConnectFailed",readyState:xhr.readyState}
            }
            return result;
        }
    };
    g.$ajax = ajax;
	
	var htmlHead = document.getElementsByTagName("head")[0] || document.documentElement;
	
	var jsonpInvokeSeq = 0;
	var jsonp = function(conf){
		var deferred = new Defer();
		var count = ++jsonpInvokeSeq;
		var jsonpCallbackName = "jsonpCallback" + count;
		var url = conf.url;
		
		if(url.indexOf("?") == -1){
			url +=  "?callback=";
		}
		else{
			url += "&callback=";
		}
		url += jsonpCallbackName;
		
		var timeout = conf.timeout;
		
		var script = document.createElement('script');
		script.setAttribute("type", "text/javascript");
		script.setAttribute("language","javascript");
		script.setAttribute("src",encodeURI(url));
		script.async = true;
		
		if('onerror' in script){
			script.onerror = function(e){
				htmlHead.removeChild(script);
				window[jsonpCallbackName] = null;
				deferred.reject(null,e);
			}
		}
		
		window[jsonpCallbackName] = function(json){
			htmlHead.removeChild(script);
			window[jsonpCallbackName] = null;
			var callback = conf.callback;
			if(is.Function(callback)){
				callback.call(this || conf.scope,json)
			}
			deferred.resolve(json)
		};
		htmlHead.appendChild(script);
		if(timeout){
			setTimeout(function(){
				if(deffered.promise.state == STATES.pending){
					htmlHead.removeChild(script);
					window[jsonpCallbackName] = null;
					deffered.reject({code:509,msg:"Timeout"})
				}
			},timeout)
		}
		return deferred.promise;
	};
	g.$jsonp = jsonp;
	
	
	//script loader
	var loadedScripts = {};
	var markCache = function(cls) {
		if (is.Array(cls)) {
			for (var i = 0; i < cls.length; i++) {
				loadedScripts[cls[i]] = true;
			}
		} else {
			loadedScripts[cls] = true;
		}
	};
	var clearCache = function(cls) {
		if (is.Array(cls)) {
			for (var i = 0; i < cls.length; i++) {
				delete loadedScripts[cls[i]];
			}
		} 
		else {
			delete loadedScripts[cls];
		}
	};
	
	var evalEx = function(s,id) {
		if (window.execScript) {
			window.execScript(s);
		} 
		else {
			window.eval(s);
		}
	};
	var transportFactory = [
	    function() {
			return new XMLHttpRequest();
		}, function() {
			return new ActiveXObject('Msxml2.XMLHTTP');
		}, function() {
			return new ActiveXObject('Microsoft.XMLHTTP');
		}];
	
	var createNewTransport = function(xcros) {
		var factory = transportFactory;
		var transport = null;
		for (var i = 0, length = factory.length; i < length; i++) {
			var lambda = factory[i];
			try {
				transport = lambda();
				break;
			} 
			catch (e) {}
		}
		if(xcros){
			transport.withCredentials = true;
		}
		return transport;
	};

	
	var DOT_JSC = ".jsc";
	var jscRegex = /^(?:,?[a-zA-Z$_][\w$-_]*(?:\.[a-zA-Z$_][\w$-_]*)*)+$/;
	var loadScriptSync = function() {
		if (arguments.length == 0) {
			return;
		}
		var cls,url;
		if (arguments.length == 1) {
			cls = url = arguments[0];
			if (loadedScripts[cls] || findClass(cls)) {
				return
			}
		}
		else {
			cls = [];
			var j = 0;
			for (var i = 0; i < arguments.length; i++) {
				var c = arguments[i];
				if (!loadedScripts[c] && !findClass(c)) {
					cls[j] = c;
					j++;
				}
			}
			if (j == 0) {
				return;
			}
			url = cls.join(",");
		}

		if(jscRegex.test(url)){
			url += DOT_JSC;
		}

		var xhr = createNewTransport();
		var method = "GET";
		xhr.open(method, url, false);
		xhr.setRequestHeader('encoding', 'utf-8');
		try {
			xhr.send("");
		}
		catch(e) {
			if(config.debug){
				throw e;
			}
		}

		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				try {
					var file = xhr.responseText;
					if (file.length == 0) {
						if(config.debug){
							throw new Error("responseText is empty");
						}
						return;
					}
					markCache(cls);
					evalEx(file,cls);
				}
				catch (e) {
					clearCache(cls);
					if (config.debug) {
						throw e;
					}
				}

			}
			else {
				if (config.debug){
					throw "loadsscript[ " + cls + "] failed, responseStatus:" + xhr.status;
				}
				xhr.abort();
			}
		}
	};
    g.$import = loadScriptSync;

	var loadScriptAsync = function(cls,attrs) {
		var url = cls;
		var deferred = new Defer();
		if (is.String(cls)) {
			if (loadedScripts[cls] || findClass(cls)) {
				deferred.resolve();
				return deferred.promise;
			}
		} 
		else {
			if (is.Array(cls)) {
				var j = 0;
				var newClsName = [];
				for (var i = 0; i < cls.length; i++) {
					var c = cls[i];
					if (!loadedScripts[c] && !findClass(c)) {
						newClsName[j] = c;
						j++;
					}
				}
				if (j == 0) {
					deferred.resolve();
					return deferred.promise;
				}
				cls = newClsName;
				url = cls.join(",")
			} 
			else {
				deferred.reject(new Error("js class arguments is valid."));
				return deferred.promise;
			}
		}
		markCache(cls);

		if(jscRegex.test(url)){
			url += DOT_JSC;
		}
		
		var script = document.createElement('script');
		script.setAttribute("type", "text/javascript");
		script.setAttribute("language","javascript");
		script.setAttribute("src", url);
		
		if(is.Object(attrs)){
            var attr;
			for(attr in attrs){
				if(attrs.hasOwnProperty(attr)){
					script.setAttribute(attr,attrs[attr]);
				}
			}
		}
		
		var isLoaded  = false;
		script.onload = script.onreadystatechange = function(){
			if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete"){
				script.onload = script.onreadystatechange = emptyFunction;
				if(isLoaded){
					return;
				}
				isLoaded=true;
				deferred.resolve();
				htmlHead.removeChild(script)
			}
		};
		if('onerror' in script){
			script.onerror = function(e){
				clearCache(cls);
				htmlHead.removeChild(script);
				deferred.reject(e);
			}
		}
		htmlHead.appendChild(script);
		return deferred.promise;
	};
	g.$require = loadScriptAsync;
	
	var api = function(cls,alias){
		var deferred = new Defer();
		
		$require(cls).then(function(){
			var nm = alias || cls;
			var api = eval("(" + nm +")");
			if(api){
				deferred.resolve(api);
			}
			else{
				deferred.reject(null);
			}
		},function(data,e){
			deferred.reject(data,e);
		});
		return deferred.promise;
	};
	g.$api = api;
	
	var hts = function(cls){
     	var p = hts.lastIndexOf(".");
		if(p == -1){
			hts += ".hts";
		}
		else{
			var postfix = hts.substring(p,p + 4);
			if(postfix != ".hts"){
				hts += ".hts"
			}
		}
 		var re = ajax({
			method:"GET",
			url:hts,
			sync:true
		});
		return re.body;
     };
     g.$loadHts = hts;
	
	var create = function(cls,config){
		var deferred = new Defer();
		$require(cls).then(function(){
			var m = eval("new " + cls + "(config)");
			deferred.resolve(m);
		}).fail(function(data,e){
			deferred.reject(data,e);
		});
     	return deferred.promise;
     };
     g.$create = create;
	
	var destoryScript = function(cls) {
		try {
			if (is.Array(cls)) {
				for (var i = 0; i < cls.length; i++) {
					evalEx("delete " + cls[i]);
				}
			} 
			else {
				evalEx("delete " + cls)
			}
		} catch (e) {
			if (config.debug)
				throw e;
		}
		clearCache(cls)
	};
	g.$destory = destoryScript;
	
	var stylesheetRefCount = {};
	var newLoadNextStyleSheetFunc = function(ne){
		return function(){
			return loadStylesheet(ne);
		}
	};
	var loadStylesheet = function() {
		var i,count,deferred = new Defer();
		if(arguments.length == 0){
			deferred.reject();
			return deferred.promise;
		}
		var cls,url;
		if (arguments.length > 1) {
			var j = 0;
			cls = [];
			for (i = 0; i < arguments.length; i++) {
				var c = arguments[i];
				if (stylesheetRefCount[c]) {
					count = stylesheetRefCount[c];
					stylesheetRefCount[c] = ++count;
				}
				else{
					stylesheetRefCount[c] = 1;
					cls[j] = c;
					j++;
				}
			}
			if (j == 0) {
				deferred.resolve();
				return deferred.promise;
			}
			url = cls.join(",");
		}
		else{
			cls = arguments[0];
			if (stylesheetRefCount[cls]) {
				count = stylesheetRefCount[cls];
				stylesheetRefCount[cls] = ++count;
				deferred.resolve();
				return deferred.promise;
			}
			stylesheetRefCount[cls] = 1;
			url = cls
		}

		if(is.Array(cls)){
			var next = cls[0];
			stylesheetRefCount[next] = 0;
			var p = loadStylesheet(next);
			for (i = 1; i < cls.length; i++) {
				next = cls[i];
				p = p.then(p = p.then(newLoadNextStyleSheetFunc(next)))
			}
			p.then(function(){
				deferred.resolve();
			},function(e){
				deferred.reject(e);
			});
			return deferred.promise;
		}
		else{
			url = url.replace(/[.]/gi, "/");
			url = env.resourcesHome + url + ".css";
		}

		var ss = document.createElement("Link");
		ss.setAttribute("href", url);
		ss.setAttribute("rel", "stylesheet");
		ss.setAttribute("type", "text/css");

		ss.onload = function(){
			ss.onload = null;
			deferred.resolve();
		};
		ss.onerror = function(e){
			ss.onerror = null;
			deferred.reject(e);
		};

		document.getElementsByTagName("head")[0].appendChild(ss);
		return deferred.promise;
	};
	
	g.$styleSheet = loadStylesheet;
	
	//@Deprecated
	g.$resourcesHome = env.resourcesHome;
	
	var removeStylesheet = function(id) {
		if (stylesheetRefCount[id]) {
			var count = -- stylesheetRefCount[id];
			if (count > 0) {
				stylesheetRefCount[id] = count;
				return
			}
			delete stylesheetRefCount[id];
			var existing = document.getElementById(id);
			if (existing) {
				existing.parentNode.removeChild(existing);
			}
		}
	};
	g.$rStyleSheet = removeStylesheet;
	
	var listeners = {};
	var setGlobalCallback = function(id,func,scope){
		listeners[id] = {func:func,scope:scope};
	};
	g.$setGlobalCallback = setGlobalCallback;

	var removeGlobalCallback = function(id){
		delete listeners[id];
	};
	g.$removeGlobalCallback = removeGlobalCallback;
	var fireGlobalEvent = function(id){
		var context = listeners[id];
		if(context && typeof is.Function(context.func)){
			context.func.apply(context.scope, Array.prototype.slice.call(arguments, 1))
		}
	};
	g.$fireGlobalEvent = fireGlobalEvent;
	
	//for json
	var isNativeJson = window.JSON && JSON.toString() == '[object JSON]';
	var jsonDecode,jsonEncode;
	if(isNativeJson){
		jsonDecode = JSON.parse;
		jsonEncode = JSON.stringify;
	}
	else{
		jsonDecode = function(json) {
	        return eval("(" + json + ')');
	    };
	   
	    jsonEncode = function(){
	    	 var toString = Object.prototype.toString,
	         charToReplace = /[\\"\x00-\x1f\x7f-\uffff]/g,
    		 m = {"\b": '\\b',"\t": '\\t',"\n": '\\n',"\f": '\\f',"\r": '\\r','"': '\\"',"\\": '\\\\','\x0b': '\\u000b'},
   			 useHasOwn = !! {}.hasOwnProperty,
   			 isDate = is.Date,
			 isObject = (toString.call(null) === '[object Object]') ?
			 	function(value) {
		            return value !== null && value !== undefined && toString.call(value) === '[object Object]' && value.ownerDocument === undefined;
		        } :
		        is.Object,
		     isBoolean = is.Boolean,
		     isArray = is.Array,
   			 encodeString = function(s) {
			        return '"' + s.replace(charToReplace, function(a) {
			            var c = m[a];
			            return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
			        }) + '"';
			    },
			 pad = function(n) {
        			return n < 10 ? "0" + n : n;
    			},
			 encodeDate = function(o) {
			        return '"' + o.getFullYear() + "-"
			        + pad(o.getMonth() + 1) + "-"
			        + pad(o.getDate()) + "T"
			        + pad(o.getHours()) + ":"
			        + pad(o.getMinutes()) + ":"
			        + pad(o.getSeconds()) + '"';
			    },
			 encodeArray = function(o) {
			        var a = ["[", ""],
			            len = o.length,
			            i;
			        for (i = 0; i < len; i += 1) {
			            a.push(doEncode(o[i]), ',');
			        }
			       
			        a[a.length - 1] = ']';
			        return a.join("");
   				 },
   			encodeObject = function(o) {
			        var a = ["{", ""], i;
			        for (i in o) {
			            if (!useHasOwn || o.hasOwnProperty(i)) {
			                a.push(doEncode(i), ":", doEncode(o[i]), ',');
			            }
			        }
			        a[a.length - 1] = '}';
			        return a.join("");
			    },
		    doEncode = function(o){
		    	if (o === null || o === undefined) {
		            return "null";
		        }
		        else if (isDate(o)) {
		            return encodeDate(o);
		        } 
		        else if (typeof o === 'string') {
		            return encodeString(o);
		        } 
		        else if (typeof o === "number") {
		            return isFinite(o) ? String(o) : "null";
		        } 
		        else if (isBoolean(o)) {
		            return String(o);
		        }
		        else if (o.toJSON) {
		            return o.toJSON();
		        }
		        else if (isArray(o)) {
		            return encodeArray(o);
		        }
		        else if (isObject(o)) {
		            return encodeObject(o);
		        }
		        else if (typeof o === "function") {
		            return "null";
		        }
		        return 'undefined';
		    };
			return doEncode;  
	    }();
	}
	g.$decode = jsonDecode;
	g.$encode = jsonEncode;
	
	//for class extends system
	var TemplateClass = function() {};
	var chain = function(object) {
            TemplateClass.prototype = object;
            var result = new TemplateClass();
            TemplateClass.prototype = null;
            return result;
    };
    
	var enumerables = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString','constructor'];
	for (i in { toString: 1 }) {
		enumerables = null;
	}
	
	var noArgs = [];
	var apply = function(object, config,defaults) {
			if (defaults) {
	            apply(object, defaults);
	        }
	        
		    if (object && config && is.Object(config)) {
		        var i, j, k;
		        for (i in config) {
		            object[i] = config[i];
			     }
				if (enumerables) {
			        for (j = enumerables.length; j--;) {
		                k = enumerables[j];
		                if (config.hasOwnProperty(k)) {
		                    object[k] = config[k];
		                }
		            }
				}
			    return object;
	 		}
	};
	g.$apply = apply;
	var Base = function() {};
	apply(Base, {
	        $isClass: true,
	        getName: function(){
	        	return this.$classname;
	        },
	        addMembers: function(members) {
	            var me = this,prototype = me.prototype,
	                name, member,ln;

	            for (name in members) {
	                if (members.hasOwnProperty(name)) {
	                    member = members[name];
	                    if (is.Function(member) && !member.$isClass) {
	                    	if (prototype.hasOwnProperty(name)) {
	                           member.$previous = prototype[name];
	                        }
	                        member.$owner = me;
	                        member.$name = name;
	                    }
	                    prototype[name] = member;
	                }
	            }
	            
	            if (enumerables) {
	                for (i = 0, ln = enumerables.length; i < ln; ++i) {
	                	 if (members.hasOwnProperty(name = enumerables[i])) {
                        	member = members[name];
                        	if(!member.$isClass){
	                        	if (prototype.hasOwnProperty(name)) {
		                           member.$previous = prototype[name];
		                        }
                        		member.$owner = me;
                            	member.$name = name;
                        	}
                        	prototype[name] = member;	
	                	 }
	                }
                }
	            return this;
	        },
	        extend: function(superClass) {
	            var me = this,superPrototype = superClass.prototype,
	                basePrototype, prototype, name;
	
	            prototype = me.prototype = chain(superPrototype);
	            //prototype.self = me;
	            this.superclass = prototype.superclass = superPrototype;
				
	            if (!superClass.$isClass) {
	                basePrototype = Base.prototype;
	                for (name in basePrototype) {
	                    if (name in prototype) {
	                        prototype[name] = basePrototype[name];
	                    }
	                }
	            }
	        },
	        mixin: function(mixinClass){
	        	var me = this,
	        	prototype = me.prototype;
	        	
	        	if(typeof mixinClass == "string"){
	        		$import(mixinClass);
	        		mixinClass = findClass(mixinClass);
	        	}
	        	if(is.Array(mixinClass)){
	        		for(var  i = 0; i < mixinClass.length; i++){
	        			me.mixin(mixinClass[i])
	        		}
	        		return;
	        	}	        	
	        	var mixin = mixinClass.prototype;
            	for (var key in mixin) {
            		 prototype[key] = mixin[key];
            	}
	        }
	    });
	    
	 Base.addMembers({
        $isInstance: true,
        $className:"Base",
        callParent: function(args) {
            var method,
                superMethod = (method = this.callParent.caller) && (method.$previous ||
                  ((method = method.$owner ? method : method.caller) &&
                        method.$owner.superclass[method.$name]));
                        
            if(!superMethod){
            	throw "[" + method.$owner.superclass.$className + "] has no superMethod[ " + method.$name +"()]."
            }
            return superMethod.apply(this, args || noArgs);
        },
        constructor: function() {
            return this;
        }
    });
    
    var makeCtor = function() {
        function constructor() {
            return this.constructor.apply(this, arguments) || null;
        }
        return constructor;
    };
    
     var createCls = function(newClass, overrides, classname) {
        var basePrototype = Base.prototype,
            newClassExtend = overrides.extend,
            mixinClass = overrides.mixins, 
            superClass, superPrototype, name;

        delete overrides.extend;
        delete overrides.mixins;
        
        if (newClassExtend && newClassExtend !== Object) {
             if(is.String(newClassExtend)){
            	$import(newClassExtend);
            	superClass = findClass(newClassExtend);
            }
            else{
        		superClass = newClassExtend;
            }
        } 
        else {
            superClass = Base;
        }

        superPrototype = superClass.prototype;
        if (!superClass.$isClass) {
            for (name in basePrototype) {
                if (!superPrototype[name]) {
                    superPrototype[name] = basePrototype[name];
                }
            }
        }
        newClass.extend(superClass);
        
        if(mixinClass){
        	newClass.mixin(mixinClass)
        }
        if(classname){
        	var n = classname.lastIndexOf(".");
        	var pkgName = classname.substring(0,n);
        	var clz = classname.substring(n+1);

        	var pkg = ns(pkgName);
        	pkg[clz] = newClass;
        	newClass.prototype.$className = classname
        }
        newClass.addMembers(overrides);
     };
     
     var define = function() {
     	var n = arguments.length;
     	var classname,overrides;
     	
     	if(n == 0){
     		throw new Error("arguments must > 0");
     	}
     	
     	if(n == 1){
     		overrides = arguments[0] || {}
     	}
     	else {
            if (n > 1) {
                classname = arguments[0];
                overrides = arguments[1] || {};
            }
        }
     	
        var newClass, name;
        
        if(is.Function(overrides)){
        	overrides = overrides.apply(this);
        }
        
        if(!is.Object(overrides)){
        	throw new Error("define class overrides must be object.")
        }
        newClass = makeCtor();
        for (name in Base) {
            newClass[name] = Base[name];
        }
        
        createCls(newClass, overrides, classname);
       
        return newClass;
     };
     g.$class = define;
     
     //override
     var override =  function(cls, overrides) {
           cls.addMembers(overrides);
     };
     g.$override = override;
	 g.$AppContext = {};
	 
	  //load apps script
	  var loadAppScript = function() {
	 	 var path = window.location.pathname;
		
		if(path.slice(0,1) != "/"){ 
			path = "/" + path;
		}
		
		if(path.substr(path.length - 1,1) == "/"){
			path += "index.html";
		}
		var v = path.split("/");
		
		
		var n = v.length;
		if (v[n - 1].length > 0) {
			v[n - 1] = v[n - 1].split(".")[0];
		}
		
		if(v.length > 2)
			v = v.slice(2, v.length);
		
		
		if(v.length==2){
				
			if(v[1]==''){
				v[1]=('index');
			}
			console.log(v)
			if(v[0] == ''){
				v = v.splice(1,1);
			}
		}
		$require(v.join("."));
	};

    loadAppScript();
	
}(this));