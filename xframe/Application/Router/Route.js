 Application.Router.Route = Ext.extend(Object, {
	constructor : function (name, path, params, priority) {
		this.name = name;
		this.path = path;
		this.params = params;
		this.priority = priority || 'high';
	},
	getName:function() {
	   return this.name;
	},
    parse:function(token) {
       var params = {}, pathRe = this.path, param,
           reMasks = {}, i = 0, m = null, addParams = null;
       for (param in this.params) {
           if (this.path.indexOf(':'+param) != -1) {
                i++;
                reMasks[param] = i;
                pathRe = pathRe.replace(':'+param, String.format('({0})', this.params[param]));
           }
       }
       pathRe = '^' + pathRe.replace('/*','(.*)') + "$";
       //App.log(pathRe);
       if (m = (new RegExp(pathRe)).exec(token)) {
           Ext.apply(params, this.params);
           for (param in reMasks) {
                params[param] = m[reMasks[param]];
           }
           if (m[i+1]) {
               addParams = m[i+1].replace(/^\//,'').replace(/\/$/,'').split('/');
               if (addParams) {
                  var len=0;
               	  for (i=0,len=Math.floor(addParams.length/2);i<len;i++) {
               	  	params[addParams[2*i]] = addParams[2*i+1];
               	  }
               }
           }
           if(!Application.controllers[params.module+'Module']) {
             return this.parse('default/'+token);
           }
           
           if (!params.controller || params.controller == 'null') params.controller = 'front';
           if (!params.action || params.action == 'null') params.action = 'index';
           return params;
       } else {
           return false;
       }
    },
    route:function(params) {
    	var path = this.path, addParams = [], param;
    	for (param in this.params) {
    		if (params[param]) {
    		       path = path.replace(':'+param,  params[param]);
    		}
    	}
    	for (param in params) {
    		if (!this.params[param])
    		   addParams.push(param + '/' + params[param]);
    	}
    	path = path.replace('/*',addParams.length==0?'':'/'+addParams.join('/'));
    	return path;
    }
});