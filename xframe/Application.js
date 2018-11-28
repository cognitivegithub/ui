var Application = Ext.extend(Ext.util.Observable, {
    isReady: false,
    autoRun : false,

    constructor: function(cfg){
        Ext.apply(this, cfg);
        this.addEvents({
            'ready' : true,
            'beforeunload' : true,
            'beforeinit' : true,
            'rolechanged': true,
            'rpcerror': true
        });

        Ext.onReady(this.initApp, this);
    },

    initApp : function(){
        Ext.QuickTips.init();

        this.init();

        Ext.EventManager.on(window, 'beforeunload', this.onUnload, this);
        this.isReady = true;
        this.fireEvent('ready', this);
    },

    init : function () {
        Ext.BLANK_IMAGE_URL = '/css/images/default/s.gif';
        var href = window.location.href.split(/\/+/g);
        this.baseUrl = href[0]+'//' + href[1];
        /*if (Ext.isSecure) {
          Ext.SSL_SECURE_URL = href[0]+'//'+href[1]+'css/images/default/s.gif';
        }*/
        this.stateDomain = href[1];
        this.appUrl = window.location.href;
        this.fireEvent('beforeinit', this);
        this.initAjax();
        this.initViewport();
        this.initControllers();
        this.initModels();
        this.initComponents();
        this.initRouter();
        this.initDispatcher();
        this.initHistory();
        this.initAcl();
        this.initIdentity();
        if (this.autoRun) this.run();
    },

    initControllers : function () {
      if (!Ext.isArray(this.controllers)) this.controllers = {};
      for (var module in Application.controllers) {
        if(module && module!='Abstract') {         
          for (var controller in Application.controllers[module]) {
            if (controller && controller != 'Abstract') {
              var name = controller.match(/(\w+)Controller/);
              name = name[1].toLowerCase();
              this.addController(new Application.controllers[module][controller]({app: this}), name, module);
            }
          }
        }
      }
    },

    initModels : function () {
      if (!Ext.isArray(this.models)) this.models = {};
      for (var model in Application.models) {
        Ext.apply(Application.models[model], {
          createStore : function (cfg) {
            return Ext.apply({
              xtype: 'jsonstore',
              recordType : this,
              root: null,
              idProperty: 'id'
            }, cfg || {});
          }.createDelegate(Application.models[model], [], true),
          createOne : function (data) {
            var toRead = {
              success: true,
              'data': [data]
            },  reader = this.dataReader || new Ext.data.JsonReader({
              "idProperty": "id",
              "root": "data",
              "successProperty": "success"
            }, this),
            o = null;
            if (!this.dataReader) this.dataReader = reader;
            reader.buildExtractors();
            o = reader.readRecords(toRead);
            if (o.success)
              return o.records[0]
            else
              return false;
          }.createDelegate(Application.models[model], [], true)
        });
      }
    },

    initComponents : function () {
      if (!Ext.isArray(this.components)) this.components = {};
      for (var component in Application.components) {
        Ext.reg('Application.components.'+component, Application.components[component]);
        if (Ext.ClassManager) {
          Ext.ClassManager.setAlias('Application.components.'+component, 'widget.Application.components.'+component)
        }
      }
    },

    addController : function(controller, name, module) {
      if (!name) {
        name = controller.getName();
      }
      if(!module) {
        module='defaultModule';
      }
      if (!this.controllers[module]) this.controllers[module] = {};
      this.controllers[module][name] = controller;
    },

    initRouter : function () {
      this.router = new Application.Router({app: this});
      this.route = this.router.route.createDelegate(this.router, [], true);
    },

    initDispatcher : function () {
    	this.dispatcher = new Application.Dispatcher({app: this});
    },

    initHistory : function () {
        if (window.HistoryManager) {
           this.historyManager = HistoryManager;
           this.historyManager.addEvent('change', this.dispatcher.dispatch.createDelegate(this.dispatcher));
        } else {
           Ext.getBody().createChild({
                tag:    'form',
                action: '#',
                cls:    'x-hidden',
                id:     Ext.id(),
                children: [{
                     tag: 'div',
                     children: [{
                          tag:  'input',
                          id:   Ext.History.fieldId,
                          type: 'hidden'
                     },
                     {
                          tag:  'iframe',
                          id:   Ext.History.iframeId
                     }]
                }]
           });
           Ext.History.init();
           this.historyManager = Ext.History;
           this.historyManager.on("change", this.dispatcher.dispatch, this.dispatcher);
        }
    },

    initAcl : function () {
        this.acl = new Application.Acl();
    },

    initIdentity : function () {
      var provider;
      if (window.ssw) {
        provider = new Ext.ux.state.SSWProvider();
      } else if (Ext.ux.state.WebStorageProvider && Ext.ux.state.WebStorageProvider.isSupported()) {
        provider = new Ext.ux.state.WebStorageProvider();
      } else {
        provider = new Ext.state.CookieProvider({
            expires: new Date(new Date().getTime()+(1000*60*60*24*7)), //7 days from now
            domain: this.stateDomain
        });
      }
      Ext.state.Manager.setProvider(provider);
      this.sessionManager = Ext.state.Manager;
      this.auth = new Application.Identity({sessionManager : this.sessionManager});
    },

    initAjax : function () {
      this.serverUrl = '';
      Ext.Ajax.on('requestcomplete', function (conn, response, options) {
        try {
          response.responseJSON = Ext.util.JSON.decode(response.responseText);
        }
        catch (e) {
          response.responseJSON = false;
        }
      });
    },

    request : function (params, cb, scope, url) {
        Ext.Ajax.request({
            url : url || this.serverUrl,
            params : params,
           	disableCaching: true,
            method : 'POST',
            'scope' : scope || this,
            success : function (response) {
                var succ = true;
                if (response.responseJSON  && !response.responseJSON.success) {
                    succ = false;
                }
                cb.call(scope || this, succ, response.responseJSON);
            },
            failure : cb.createDelegate(scope || this, [false,{success:false,errors:[]}])
        });
    },

    log : function() {
        if (Ext.isDefined(window.console) && Ext.isDefined(window.console.firebug) && Ext.isFunction(window.loadFirebugConsole) && Ext.isFunction(console.log)) {
            console.log.apply(console, arguments);
        }
    },

    initViewport : function () {
        if (this.viewport) return;
        this.viewport = new Ext.Panel({
            app: this,
            unstyled: true,
            //layout: 'auto',
            renderTo : this.renderTo,
            autoHeight: true
            //height: Ext.get(this.renderTo).getHeight()
        });
    },

    onReady : function(fn, scope){
        if(!this.isReady){
            this.on('ready', fn, scope);
        }else{
            fn.call(scope, this);
        }
    },

    onUnload : function(e){
        if(this.fireEvent('beforeunload', this) === false){
            e.stopEvent();
        }
    },

    getViewport : function () {
        if (!this.viewport) this.initViewport();
        return this.viewport;
    },

    redirect : function (token) {
      this.historyManager.add(token);
    },

    forward : function (token) {
      this.dispatcher.dispatch(token);
    },

    run : function () {
      if (!this.isReady) this.onReady(this.run, this);
      else {
        Application.Locale.setLang('en');
        this.forward(this.historyManager.getToken());
      }
    },

    getCurrentLocation: function() {
      return this.historyManager.getToken();
    }

});

Application.controllers = {};
Application.models = {};
Application.components = {};
