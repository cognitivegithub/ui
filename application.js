Ext.ns('Main');
Ext.ns('Main.layout');
Ext.ns('Main.user');
Ext.ns('Main.contragent');
Ext.ns('Main.direct');
Ext.ns('Main.initializers');

function defaultErrorHandler(e, url, lineNumber) {
  if (url) {
    e += ' at '+url;
    if (lineNumber) {
      e += ':'+lineNumber;
    }
  }
  if (typeof Ext != undefined) {
    if (Ext.debug) {
      Ext.log('Произошла ошибка: '+e);
    } else {
      Ext.Msg.alert('Ошибка', 'Произошла непредвиденная ошибка. Текст ошибки:<br/>'+e);
    }
  } else {
    alert(e);
  }
  return false;
}

Main.ajaxPull = [];
Ext.Ajax.on('beforerequest', function(conn, option) {
  if (option.ts != undefined && option.ts.tid) {
    Main.ajaxPull.push({
      conn: conn,
      tId: option.ts.tid - 1
    });
  }
});

//window.onerror = defaultErrorHandler;

Main.apply_acl = function() {
  var top_toolbar = null;
  switch(Main.user.role) {
    case 'user':
      Main.layout.north_panel.show();
      Main.layout.south_panel.show();
      Main.layout.north_panel_for_login.hide();
      Main.layout.south_panel_for_login.hide();
      Main.layout.root.doLayout();
        //console.log(Main.config.my);
      var user_menues = Main.user.menues;
      if (isAdmin()) {
        var restricted_menus = ['company/view', 'company/viewShort', 'user/registerexpert'];
        for(var prop in user_menues) {
          if (user_menues.hasOwnProperty(prop)
              && user_menues[prop] && user_menues[prop].url && restricted_menus.indexOf(user_menues[prop].url)>=0) {
            user_menues[prop].url = '';
          }
        }
      }
      top_toolbar = buildUserMenuBar(Main.user.mandates, user_menues, Main.user.mandatesMenu);
      break;
    case 'guest':
      //top_toolbar = new Application.components.guestTopmenuToolbar();
      Main.layout.north_panel.hide();
      Main.layout.south_panel.hide();
      Main.layout.north_panel_for_login.show();
      Main.layout.south_panel_for_login.show();
      Main.layout.root.doLayout();
      break;
  }
  if ( Main.layout.top_toolbar ) {
    Main.layout.north_panel.remove(Main.layout.top_toolbar);
    Ext.destroy(Main.layout.top_toolbar);
    Main.layout.top_toolbar = null;
    if (!top_toolbar) {
      Main.layout.north_panel.doLayout();
    }
  }
  if (top_toolbar) {
    Main.layout.top_toolbar = top_toolbar;
    if (Main.layout.north_panel && Main.layout.north_panel.items) {
      Main.layout.north_panel.insert(Main.layout.north_panel.items.getCount(), top_toolbar);
      Main.layout.north_panel.doLayout();
    }
  }

  if ('guest' != Main.user.role) {
    //Main.layout.north_panel.doLayout();
    //Main.layout.north_panel.show();
    /*Main.layout.west_panel.add(new Application.components.westReferencePanel());
    Main.layout.west_panel.doLayout();
    Main.layout.west_panel.show();*/
    //Main.layout.top_toolbar.show();
    Main.layout.root.doLayout();
    if (this.auth) {
      this.auth.login({login: Main.user.login});
    } else if (!this.isReady) {
      this.onReady(function(){this.auth.login({login: Main.user.login});}, this);
    }
    this.acl.setErrorRedirect(null, null, {controller:'auth',action:'noaccess'});
  } else {
    //Main.layout.south_panel.hide();
    //Main.layout.west_panel.hide();
    //Main.layout.top_toolbar.hide();
    //Main.layout.root.doLayout();
    if (top_toolbar) {
      Main.layout.root.doLayout();
    }
    if (this.auth) {
      this.auth.logout();
    }
    this.acl.setErrorRedirect(null, null, {controller:'auth',action:'login'});
  }
  if (Main.user.mandates && Main.user.mandates.length) {
    var type = 'user';
    if ('guest' == Main.user.role) {
      type = 'guest';
    }
    for (var i=0; i<Main.user.mandates.length; i++) {
      this.acl.allow(type, Main.user.mandates[i].url);
    }
  }
};

Main.init_acl = function() {
  if (this.constructor.superclass) {
    this.constructor.superclass.initAcl.call(this);
  } else {
    this.superclass.initAcl.call(this);
  }

  //this.acl.addRole(new Application.Acl.Role("guest"));
  this.acl.addRole(new Application.Acl.Role("user", "guest"));
  this.acl.deny(null);
  this.acl.deny("guest");
  this.acl.deny("user");
  this.acl.allow("guest","front/index");
  this.acl.allow("user","front/index");
  this.acl.allow("guest","auth/noaccess");
  this.acl.allow("user","auth/noaccess");
  this.acl.allow("guest","auth/login");
  this.acl.allow("user","auth/logout");
  Main.apply_acl.call(this);
};

Main.init_router = function() {
  this.constructor.superclass.initRouter.call(this);
  this.router.addRoute(
    new Application.Router.Route(
      "module",
      ":module/:controller/:action/*",
      { "module" : '\\w*', "controller" : '\\w*', "action": '\\w*' },
      'high'
    )
  );
};

Main.reloadPrivileges = function() {
  var dparams = {mask:true, wait_text:'Загрузка привилегий...'};
  performRPCCall(RPC.Index.index, [], dparams, function(resp){
    if (resp.success && resp.user) {
      Main.eds = resp.eds;
      Main.user = resp.user;
      Main.contragent = resp.contragent;
    } else {
      Main.user.role = 'guest';
      Main.user.landing = 'auth/login';
    }
    if (resp && resp.auth_token) {
      Main.requestToken = resp.auth_token;
    }
    Main.apply_acl.call(Main.app);
    var announcement_data = resp.announcement;
    if (Main.config.guarantee_required_alert && isSupplierAccred() && !isCustomerAccred() && resp.contragent && resp.contragent.available_sum <= 0) {
      announcement_data.push({id: 'guarantee_required_alert', content: Main.config.guarantee_required_alert});
    }
    setAnnouncement(announcement_data); // Задание объявления. Показываем его для пользователей.
    if (resp.success && resp.contragent) {
      Main.app.fireEvent('update_account_info', resp.contragent.available_sum);
    } else {
      Main.app.fireEvent('update_account_info');
    }
    redirect_to('/');
  });
};

Main.direct.postData = function(provider, event) {
  var msg;
  if (event && event.result && false == event.result.success && true == event.result.no_access) {
    if (event.result.no_session) {
      Main.reloadPrivileges();
    } else {
      msg = event.result.message || event.result.msg || 'Доступ запрещен.';
      Ext.Msg.alert('Ошибка', msg);
      if (Main && Main.app) {
        Main.app.fireEvent('rpcerror', event);
      }
    }
  }
  if (event && 'exception'==event.type) {
    msg = event.message || event.msg || 'Внутренняя ошибка.';
    var trace = event.where;
    var traceinfo = 'стек вызовов';
    if ('parse'==event.code && event.data) {
      msg = event.data.name?(event.data.name+': '):'';
      msg += event.data.message;
      if (event.xhr && event.xhr.responseText) {
        trace = event.xhr.responseText;
        traceinfo = 'ответ сервера';
      } else if (event.data.stack) {
        trace = event.data.stack;
        traceinfo = 'ответ сервера';
      }
    }
    var time = new Date();
    var details = '<div>['+formatDate(time)+'] '+(event.action||'')+'.'+(event.method||'')+'</div>';
    if (trace) {
      trace = (trace||'').escapeHtml();//'<i>[empty]</i>');
      trace = trace.replace(/\n/g, '<br/>\n');
      details += '<div id="server_response_link"><a href="javascript:;" onclick="Ext.get(\'server_response_link\').hide();Ext.get(\'server_response_text\').show();">Показать '+traceinfo+'</a></div>';
      details += '<div id="server_response_text" style="display:none;">'+trace+'</div>';
    }
    //event.result.message = msg.toString()+details;
    Ext.MessageBox.show({
      buttons: Ext.MessageBox.OK,
      closable: true,
      width: trace?750:600,
      maxWidth: 750,
      title: 'Ошибка',
      msg: '<div class="ext-mb-icon ext-mb-error"></div>'+msg.toString()+details
    });
    if (Main && Main.app) {
      Main.app.fireEvent('rpcerror', event);
    }
  }
  if (event && event.warnings && Ext.debug) {
    (function() {
      var codes_map = {
        '1': 'ERROR',
        '2': 'WARNING',
        '4': 'PARSE',
        '8': 'NOTICE',
        '16': 'CORE_ERROR',
        '32': 'CORE_WARNING',
        '64': 'COMPILE_ERROR',
        '128': 'COMPILE_WARNING',
        '256': 'USER_ERROR',
        '512': 'USER_WARNING',
        '1024': 'USER_NOTICE',
        '2048': 'STRICT',
        '4096': 'RECOVERABLE_ERROR',
        '8192': 'DEPRECATED',
        '16384': 'USER_DEPRECATED'
      };
      var warnings = ['Warnings in '+event.action+'.'+event.method+':'];
      for (var i=0; i<event.warnings.length; i++) {
        var w = event.warnings[i];
        // Игнорируем варнинги вылезшие после перехода на более новую версию PHP
        var hideDeprecatesMsgs = [
          'DEPRECATED mktime(): You should be using the time() function instead',
          'USER_DEPRECATED The Twig_Autoloader class is deprecated and will be removed in 2.0. Use Composer instead.',
          'USER_DEPRECATED Using Twig_Autoloader is deprecated. Use Composer instead.',
          'WARNING Declaration of Model_ListPurchasemethods::create($data, $model_name) should be compatible ' +
            'with Model_ListNsi::create($data = Array, $model_name = NULL)',
          'WARNING Declaration of Model_ListPurchasemethods::delete($code = NULL) should be compatible ' +
            'with Core_Mapper::delete($from_draft = false, $recursive = true)',
          'WARNING Declaration of Model_UserAccreditation::submit($params, Model_User $user) should be compatible ' +
            'with Model_Accreditation::submit($params, Model_Contragent $contragent, Model_User $user)',
          'WARNING Declaration of Model_UserAccreditation::create($data) should be compatible ' +
            'with Model_Accreditation::create($data, $type)',
          'WARNING Declaration of Model_UserAccreditation::load($id) should be compatible ' +
            'with Model_Accreditation::load($id, $type)',
          'WARNING Declaration of Model_UserAccreditation::getList($params) should be compatible ' +
            'with Model_Accreditation::getList($type, $params)'
        ];
        var warningMsg = (codes_map['' + w.code] || w.code) + ' ' + w.message;
        // Пропускаем ошибки переопределения Core_Mapper::create.
        if (warningMsg.indexOf('should be compatible with Core_Mapper::create($params = Array)') != INDEX_NOT_FOUND) {
          continue;
        }
        // Пропускаем остальные варнинги, которые в ближайшее время не будут правиться.
        if (hideDeprecatesMsgs.indexOf(warningMsg) != INDEX_NOT_FOUND) {
          continue;
        }
        warnings.push('  ' + warningMsg + ' at ' + w.location);
      }
      if (warnings.length > NO_MAGIC_NUMBER_ONE) {
        Ext.dump(warnings.join('\n'));
      }
    })();
  }
};

Main.direct.exception = function() {
  alert('exception');
};

Main.direct.getSecurityToken = function() {
  return Main.requestToken||'';
  //return Ext.util.Cookies.get(Main.session_name||'etpsid');
}

Ext.override(Ext.direct.RemotingProvider, {
  getCallData: function(t){
    return {
      action: t.action,
      method: t.method,
      data: t.data,
      type: 'rpc',
      tid: t.tid,
      token: Main.direct.getSecurityToken()
    };
  },
  doForm : function(c, m, form, callback, scope){
    var t = new Ext.Direct.Transaction({
      provider: this,
      action: c,
      method: m.name,
      args:[form, callback, scope],
      cb: scope && Ext.isFunction(callback) ? callback.createDelegate(scope) : callback,
      isForm: true
    });
    if(this.fireEvent('beforecall', this, t, m) !== false){
      Ext.Direct.addTransaction(t);
      var isUpload = String(form.getAttribute("enctype")).toLowerCase() == 'multipart/form-data',
      params = {
        extTID: t.tid,
        extAction: c,
        extMethod: m.name,
        extType: 'rpc',
        extUpload: String(isUpload),
        extToken: Main.direct.getSecurityToken()
      };
      Ext.apply(t, {
        form: Ext.getDom(form),
        isUpload: isUpload,
        params: callback && Ext.isObject(callback.params) ? Ext.apply(params, callback.params) : params
      });
      this.fireEvent('call', this, t, m);
      this.processForm(t);
    }
  }
});

/*Main.direct.beforeCall = function(provider, transaction, meta) {
  return true;
};*/

Main.init_application_core = function() {
  window.onerror = defaultErrorHandler;
  Main.config = {};

  Main.signaturePlugin = 'cryptopro'; // by default
  Main.signaturePluginByDefault = true;
  var pluginFromCookie = Ext.util.Cookies.get('ext-current-plugin');
  if (pluginFromCookie) {
      Main.signaturePlugin = pluginFromCookie;
      Main.signaturePluginByDefault = false;
  }

  Ext.getBody().mask('Соединяемся с сервером', 'x-mask-loading');
  Ext.Ajax.request({
    url: '/api.php',
    method: 'GET',
    success: function(resp) {
      Ext.getBody().unmask();
      Main.modules = [];
      var obj = Ext.decode(resp.responseText);
      if (obj.success && (obj.api_data||obj.modules)) {
        for (var i in obj.modules) {
          if (obj.modules[i].type) {
            var id = Ext.id();
            obj.modules[i].id = id;
            Ext.Direct.addProvider(obj.modules[i]);
            Main.modules.push(obj.modules[i].namespace);
            Ext.Direct.getProvider(id).on('data', Main.direct.postData);
            Ext.Direct.getProvider(id).on('exception', Main.direct.exception);
            //Ext.Direct.getProvider(id).on('beforecall', Main.direct.beforeCall);
          }
        }
        var dparams = {mask:true, wait_text:'Авторизация...'};
        performRPCCall(RPC.Index.index, [], dparams, function(resp){
          if (resp&&resp.session_name) {
            Main.session_name = resp.session_name;
          }
          if (resp && resp.auth_token) {
            Main.requestToken = resp.auth_token;
          }
          var cmp = Ext.get('site-title');
          if (cmp) {
            cmp.update(resp.site_title||'');
          }
          cmp = Ext.getCmp('site-copyright');
          if (cmp) {
            cmp.setText(resp.site_copyright||'');
          }
          Main.siteTitle = resp.site_title;
          if (resp.config) {
            Main.initConfig(resp);
          }
          Main.eds = resp.eds;
          eds(); // инициализируем плагин для КриптоПро
          if (resp.success && resp.user) {
            Main.user = resp.user;
            Main.contragent = resp.contragent;
            Main.available_sum = null; // чтобы потом сработал штатный евент
          } else {
            Main.user.role = 'guest';
            Main.user.landing = 'auth/login';
          }

          /*
           * Выполнение дополнительных инициализаторов из модулей.
           * Предполагается, что инициализаторы регистрируются в файлах вида
           * /public/js/lib/moduleN/initializer.js следующим образом:
           *
           * Ext.ns('Main.initializers');
           *
           * Main.initializers.moduleN = function() {
           *     ...
           * };
           *
           * Загрузка .js-файлов модулей в браузер происходит до загрузки
           * данного файла, поэтому к моменту выполнения следующих строк
           * объект Main.initializers уже заполнен.
           *
           * Порядок вызова инициализаторов неопределен. Если когда-то
           * потребуется отрабатывать инициализаторы в порядке, определяемом
           * зависимостями между модулями, то код нужно будет доработать.
           */
          for(funcKey in Main.initializers) {
            func = Main.initializers[funcKey];
            func();
          }

          Main.app = new (Ext.extend(Application, {
            viewport: Main.layout.center_panel,
            autoRun: false,
            autoScroll: true,
            initAcl: Main.init_acl,
            initRouter: Main.init_router,
            listeners: {
              beforeinit: function(app) {
                app.addEvents({
                  'timeoffsetwarn':true,
                  'timeupdated': true,
                  'announcement': true,
                  'available_sum_changed': true,
                  'deposit_changed': true,
                  'getupdate': true,
                  'update_account_info': true
                });
              }
            }
          }));
          Main.app.run();
          // Задание объявления. Показываем его для пользователей.
          /*if (resp.announcement && resp.user) {
            Main.app.onReady( function(){setAnnouncement(resp.announcement);} );
          }*/

          Main.detect_browser_issues();

          var skip_iteration = true;
          Main.app.on('timeoffsetwarn', function(diff){
            diff = Math.round(diff/60000);
            var msg = 'Поправьте часы компьютера (в том числе проверьте правильность указания часового пояса на этих часах), '+
               'иначе вы можете сами себя ввести в заблуждение и некорректно учесть сроки, '+
               'а при слишком большом расхождении вы не сможете даже авторизоваться в системе!';
            Ext.Msg.alert('Предупреждение',
             'Часы вашего компьютера показывают неправильное время и ошибаются примерно на '+
               diff+' '+Ext.util.Format.declencionRus(diff, 'минуту', 'минуты', 'минут')+'.<br/>\n'+msg
            );
            Main.app.viewport.fireEvent('clock_warning', 'Похоже, что часы вашего компьютера показывают неправильное время. '+msg);
          }, Main.app, {once: true});
          Main.app.on('getupdate', function() {
            skip_iteration = false;
            Ext.TaskMgr.stop(Main.pingtask);
            Ext.TaskMgr.start(Main.pingtask);
          });
          Main.app.on('announcement', function(announcement){
            // Перерисовка объявления, если оно было задано.
            setAnnouncement(announcement);
          });

          //updateServerTimeOffset(resp.server_tz, resp.server_time);
          var serverUpdate = function(resp) {
            if (resp && resp.auth_token) {
              Main.requestToken = resp.auth_token;
            }
            Main.app.fireEvent('timeupdated', resp.server_time, resp.server_tz);
            if (!Ext.getCmp('layout_account_data_panel')) {
              Main.layout.north_panel.insert(1, new Application.components.accountDataPanel({id: 'layout_account_data_panel'}));
              Main.layout.north_panel.doLayout();
            }
            if (resp.contragent) {
              var c = resp.contragent;
              var deposit_changed = false;
              var avail_changed = false;
              if (c && Main.contragent && Main.contragent.available_sum != c.available_sum) {
                Main.contragent.available_sum = parsePrice(c.available_sum);
                avail_changed = true;
              }
              var deposit_fields = ['deposit', 'deposit_blocked', 'toreturn'];
              for (var i=0; i<deposit_fields.length; i++) {
                var f = deposit_fields[i];
                var v = parsePrice(c[f])||0;
                if (Main.contragent[f]!=v) {
                  deposit_changed = true;
                  Main.contragent[f] = v;
                }
              }

              if (avail_changed || Main.contragent.tariff_validity_period!= c.tariff_validity_period) {
                if(!avail_changed) {
                  Main.contragent.tariff_validity_period = c.tariff_validity_period;
                  Main.contragent.tariff_id = c.tariff_id;
                  Main.contragent.tariff_name = c.tariff_name;
                }
                Main.app.fireEvent('available_sum_changed', Main.contragent.available_sum);
              }
              if (deposit_changed) {
                Main.app.fireEvent('deposit_changed', Main.contragent);
              }
              var announcement_data = resp.announcement;
              if (Main.config.guarantee_required_alert && isSupplierAccred() && !isCustomerAccred() && Main.contragent.available_sum <= 0) {
                announcement_data.push({id: 'guarantee_required_alert', content: Main.config.guarantee_required_alert});
              }
              Main.app.fireEvent('announcement', announcement_data);
            }
          };
          Main.app.viewport.fireEvent('application_ready');
          if (resp.success) {
            serverUpdate(resp);
          }

          Main.pingtask = {
            interval: 1000*60*5, // каждые 5 минут
            run: function() {
              if (skip_iteration) {
                skip_iteration = false;
                return;
              }
              RPC.Index.serverinfo(function(resp) {
                if (resp && resp.success) {
                  serverUpdate(resp);
                }
              });
            },
            scope: Main
          };
          Ext.TaskMgr.start(Main.pingtask);

          if (resp.config.inactive_period)
          {
            Main.inactivetask = {
              add_interval: resp.config.inactive_period*60*1000,
              finish_time: null,
              interval: 1000*60,
              run: function() {
                var current_time = new Date().getTime();
                if (current_time>this.finish_time)
                {
                  this.finish_time = current_time + this.add_interval;
                  if (Main.user.role!='guest')
                  {
                    redirect_to('auth/logout');
                  }
                }
              }
            };
            Main.inactivetask.finish_time = new Date().getTime()+Main.inactivetask.add_interval;
            document.documentElement.onkeypress=document.documentElement.onmousemove=document.documentElement.onclick=function() {Main.inactivetask.finish_time=(new Date).getTime()+Main.inactivetask.add_interval;}
            Ext.TaskMgr.start(Main.inactivetask);
          }
        });
      } else {
        Ext.Msg.alert('Ошибка', 'Не удалось установить связь с сервером, сервер вернул следующую ошибку: '+obj.msg, Main.init_application_core);
      }
    },
    failure: function(){
      Ext.getBody().unmask();
      Ext.Msg.alert('Ошибка', 'Не удалось установить связь с сервером', Main.init_application_core);
    }
  });
};

Main.initConfig = function(resp) {
  Ext.apply(Main.config, resp.config);
  if (!Main.config.warranty_guarantee_type) {
    Main.config.warranty_guarantee_type = Main.config.warranty_guarantee_sum?'sum':'percent';
  }
  ACCEPTED_FILES = (new Ext.Template(ACCEPTED_FILES)).apply(resp.config);
  MAX_UPLOAD_SIZE = 1024*1024*Number(resp.config.upload_file_size||10);
  Application.models.Procedure.init(resp.config);
};

Main.init_application = function() {
  //window.onerror = defaultErrorHandler;
  var href = window.location.href.split(/\/+/g);
  href = href[0]+'//' + window.location.href.split(/\/+/g)[1];
  Ext.Ajax.timeout = 600000;
  Ext.USE_NATIVE_JSON = true;
  if (Ext.isIE && (Ext.isIE8||Ext.isIE7||Ext.isIE6)) {
    // http://stackoverflow.com/questions/1543791/json-empty-string
    // ИЕ до версии 8.0.7 косячит при нативном енкодинге данных, полученных из DOM
    // Но т.к. минорную версию никак не получить, а тесткейз весьма шаманистый,
    // то лучше просто отключить
    Ext.USE_NATIVE_JSON = false;
  }
  Ext.chart.Chart.CHART_URL = href + '/resources/charts.swf';
  Ext.FlashComponent.EXPRESS_INSTALL_URL = href + '/resources/expressinstall.swf';
  Ext.MessageBox.minWidth = 400;
  Main.init_application_core();
};

Main.detect_browser_issues = function() {
  var warnings = []

  if ( !Main.requestToken && this.session_name && null === Ext.util.Cookies.get(this.session_name) ) {
    clearCookies();
    warnings.push('У вас отключены cookies, без этого вы не сможете авторизироваться и работать в системе.',
                  'Включите cookies и/или добавьте сайт в доверенные узлы!');
  }

  var engine = null;
  if (window.navigator.appName == "Microsoft Internet Explorer")
  {
     // This is an IE browser. What mode is the engine in?
     if (document.documentMode) // IE8 or later
        engine = document.documentMode;
     else // IE 5-7
     {
        engine = 5; // Assume quirks mode unless proven otherwise
        if (document.compatMode)
        {
           if (document.compatMode == "CSS1Compat")
              engine = 7; // standards mode
        }
        // There is no test for IE6 standards mode because that mode
        // was replaced by IE7 standards mode; there is no emulation.
     }
     // the engine variable now contains the document compatibility mode.
     if (engine<8) {
       warnings.push(
         'Вы пользуетесь устаревшим браузером, или в вашем браузере включено представление совместимости отображения веб-узлов.',
         'Пожалуйста, отключите представление совместимости, или <a href="http://windows.microsoft.com/ru-RU/internet-explorer/products/ie/home" target="_blank">обновите Internet Explorer</a> как минимум до 8й версии, в противном случае сайт может работать некорректно.',
         'Подробнее можно прочитать на <a href="#help/index/id/279" onclick="javascript:redirect_to(\'help/index/id/279\', true);return false;">странице справки</a>.'
         /*'Также вы можете установить другой браузер (однако полноценная поддержка операций с ЭП на данный момент есть исключительно у Internet Explorer): \n'+
         '<div class="browsers">'+
           '<a href="http://www.mozilla-europe.org/" target="_blank" style="background: url(/images/browsers/firefox.gif) no-repeat 50% 7px;">Mozilla Firefox</a>'+
           '<a href="http://www.apple.com/safari/" target="_blank" style="background: url(/images/browsers/safari.gif) no-repeat 50% 0px;">Safari</a>'+
           '<a href="http://www.google.com/chrome/" target="_blank" style="background: url(/images/browsers/chrome.gif) no-repeat 50% 6px;">Google Chrome</a>'+
           '<a href="http://www.opera.com/" target="_blank" style="background: url(/images/browsers/opera.gif) no-repeat 50% 7px;">Opera</a></div>'
         */
       );
     }
  }

  if (warnings.length) {
    Ext.Msg.alert('Предупреждение', warnings.join('<br/>\n'));
  }
};

Ext.override(Ext.form.TimeField, {
  initDate: '2/1/2008'
});