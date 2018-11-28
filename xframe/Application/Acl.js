Application.Acl = Ext.extend(Object, {
   constructor : function () {
      Ext.apply(this, {
           roles : [],
           resources : []
      });
      this.rulesStore = new Ext.data.JsonStore({
      	  fields: ['resource','role','action']
      });
      this.redirectsStore = new Ext.data.JsonStore({
      	  fields: ['resource','role',{name:'params',type:'auto'},'router']
      });
      for (var controller in this.controllers) {
           for (var method in this.controllers[controller]) {
                var m = null;
                if (Ext.isFunction(App.controllers[controller][method]) && (m = /(\w+)Action/.exec(method))) {
                     this.add(new Application.Acl.Resource(String.format('{0}/{1}', controller, m[1]), { isAction : true, controller : controller, action: m[1] }));
                }
           }
      }
   },
   add : function (resource) {
      this.resources.push(resource);
   },
   addRole : function (role) {
      this.roles.push(role);
   },
   findRole : function (role) {
   	  return Application.Utils.arraySearch(this.roles, function (r) { return r.name == role; }, this);
   },
   findResource : function (resource) {
   	  return Application.Utils.arraySearch(this.resources, function (r) { return r.name == resource; }, this);
   },
   setErrorRedirect : function (role, resource, params, route) {
      var n = this.redirectsStore.findBy(function(r){
        var t = (r.data.resource==(resource?resource:'') && r.data.role==(role?role:''));
        return t;
      });
      if (n>=0) {
        var rec = this.redirectsStore.getAt(n);
        rec.set('params', params?params:{});
        rec.set('route', route?route:'default');
      } else {
        this.redirectsStore.add((new this.redirectsStore.recordType({
           'resource' : resource?resource:'',
           'role':role?role:'',
           'params':params?params:{},
           'route':route?route:'default'
        })));
      }
   },
   getErrorRedirect : function (role, resource, app) {
      var r = this.findRole(role),
          baseRole = r?r.baseRole:null,
          // helper fn for search on rules
          findFn = function (r, res) {
          	if (!r) r = '';
            if (!res) res = '';
          	var idx = this.redirectsStore.findBy(function (rec) {
          	   return rec.get('resource') == res && rec.get('role') == r;
          	});
          	if (idx!=-1) return this.redirectsStore.getAt(idx); else return false;
          }.createDelegate(this, [], true),
          routeFn = function (redir) {
            if (!app) {
              app = Main.app;
            }
          	return app.route(redir.get("params"), redir.get("router"));
          },
          redir = null;

      // searching in resources rules
      redir = findFn(role, resource);
      if (!redir && baseRole) redir = findFn(baseRole, resource);

      if (redir) {
      	return routeFn(redir);
      } else {
      	  // no match - searching in global role rules
          redir = findFn(role);
          if (!redir && baseRole) redir = findFn(baseRole);

          if (redir) {
      	  	return routeFn(redir);
      	  } else {
      	  	  // no match = searchin in global rules
	          redir = findFn();
      	  	  if (redir) {
      	  	     return routeFn(redir);
      	  	  } else {
      	  	  	return '';
      	  	  }
      	  }
      }
   },
   hasAccess : function (role, resource) {

      var r = this.findRole(role),
          baseRole = r?r.baseRole:null,
          // helper fn for search on rules
          findFn = function (r, res) {
          	if (!r) r = '';
            if (!res) res = '';
          	var idx = this.rulesStore.findBy(function (rec) {
          	   return rec.get('resource') == res && rec.get('role') == r;
          	});
          	if (idx!=-1) return this.rulesStore.getAt(idx); else return false;
          }.createDelegate(this, [], true),
          rule = null;
      // searching in resources rules
      rule = findFn(role, resource);
      if (!rule && baseRole) {
      	 rule = findFn(baseRole, resource);
      }
      if (rule) {
      	return rule.get('action') == 'allow';
      } else {
      	  // no match - searching in global role rules
          rule = findFn(role);
          if (!rule && baseRole) rule = findFn(baseRole);

      	  if (rule) {
      	  	return rule.get('action') == 'allow';
      	  } else {
      	  	  // no match = searchin in global rules
	          rule = findFn();
      	  	  if (rule) {
      	  	     return rule.get('action') == 'allow';
      	  	  } else {
      	  	  	return true;
      	  	  }
      	  }
      }

   },
   allow : function (role, resource) {
      this.rulesStore.add((new this.rulesStore.recordType({
         'resource' : resource?resource:'',
         'role':role?role:'',
         'action':'allow'
      })));
   },
   deny : function (role, resource) {
      this.rulesStore.add((new this.rulesStore.recordType({
         'resource' : resource?resource:'',
         'role':role?role:'',
         'action':'deny'
      })));
   }
});