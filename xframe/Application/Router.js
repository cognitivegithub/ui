Application.Router = Ext.extend(Ext.util.Observable, {
	routes : {},
	constructor : function (config) {
        Ext.apply(this, config);
		Application.Router.superclass.constructor.call(this, config);
		this.initRoutes();
	},
	initRoutes : function () {
		this.addRoute(new Application.Router.Route("default", ":controller/:action/*", { "module": 'default', "controller" : '\\w*', "action" : '\\w*' }, 'low'));
		this.addRoute(new Application.Router.Route("index", "", { "module": 'default', "controller" : 'front', "action" : 'index' }, 'low'));
		this.addRoute(new Application.Router.Route("default-nocontroller", ":action/*", { "module": 'default', "controller" : 'front', "action" : '\\w*' }, 'low'));

	},
	addRoute : function (router) {
		this.routes[router.getName()] = router;
	},
    parse : function (token) {
      var params = false,
          eachFn = function(priority) {
      	      for (var route in this.routes) {
		      	   if (this.routes[route].priority == priority)
		           params = this.routes[route].parse(token);
		           if (params) break;
		      }
          }.createDelegate(this, [], true);
      eachFn('high');
      if (!params) eachFn('low');
      return params;
    },
    route : function (params, route) {
      if (!route) route = "default";
      if (this.routes[route])
         return this.routes[route].route(params);
      else
         return '';
    }
});