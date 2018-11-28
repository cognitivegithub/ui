Application.Dispatcher = Ext.extend(Ext.util.Observable, {
  constructor : function (config) {
    Ext.apply(this, config);
    Application.Dispatcher.superclass.constructor.call(this, config);
  },
  dispatch : function (token) {
    var params = this.app.router.parse(token);
    var moduleName = 'defaultModule';
    if(params.module) {
      moduleName = params.module+'Module';
    }
    
    if(!this.app.controllers[moduleName]) {
      moduleName = 'defaultModule';
      params.action=params.controller;
      params.controller=params.module;
      params.module='default';
    } 
    
    if (params && moduleName!='' && params.controller && params.action
      && this.app.controllers[moduleName][params.controller])
    {
      var role = this.app.auth.data.role,
      resource = String.format('{0}/{1}', params.controller, params.action);
      if(moduleName!='defaultModule') {
        resource = String.format('{0}/{1}/{2}', params.module, params.controller, params.action)
      }
      if (this.app.acl.hasAccess(role, resource)) {
        Ext.each(Main.ajaxPull, function(conn) {
          Ext.Ajax.abort(conn);
        });
        Main.ajaxPull = [];

        this.app.controllers[moduleName][params.controller].dispatch(params.action, params, this.lastResource === resource);
        this.lastResource = resource;
      } else {
        this.app.forward(this.app.acl.getErrorRedirect(role,resource, this.app))
      }
    }
  }
});