Ext.ns('Application.controllers.defaultModule');

Application.controllers.defaultModule.FrontController = Ext.extend(Application.controllers.Abstract, {
  indexAction : function (params, app, panel) {
    panel.add({
      xtype: 'panel',
      bodyStyle: 'height: '+panel.getOuterSize().height+'px;',
      border: false,
      frame: false,
      listeners: {
        render: function() {
          if (Main.temporary_landing) {
            redirect_to(Main.temporary_landing);
            delete Main.temporary_landing;
          } else if (Main.user && Main.user.landing) {
            redirect_to(Main.user.landing);
          } else {
            redirect_to('auth/login');
          }
        }
      }
    });
  },

  registerAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.NewUserForm',
      title: 'Добавление нового пользователя',
      cmpParams: {
        act: 'register'
      }
    });
  },

  nowayAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      title: 'Доступ запрещен',
      cmpType: 'Application.components.nowayPanel',
      cmpParams: {
        html: '<p class="ext-mb-text">Хотя Вы и зарегистрированы в системе, Вы не являетесь в данный момент ее авторизованным пользователем. Возможно, Ваш аккаунт был заблокирован. <br /><br /><a href="/#auth/logout">Выйти из системы</a></p>'
      }
    })
  },

  deletedAction: function (params, app, panel) {
    if (Main.user.role !== 'user') redirect_to('auth/login');
    panel.add({
      xtype: 'Application.components.actionPanel',
      title: 'Доступ запрещен',
      cmpType: 'Application.components.nowayPanel',
      cmpParams: {
        html: '<p class="ext-mb-text">Данный аккаунт был удален. <br /><br /><a href="/#auth/logout">Выйти из системы</a></p>'
      }
    })
  },

  notimplementedAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      title: 'Доступ запрещен',
      cmpType: 'Application.components.nowayPanel',
      cmpParams: {
        html: '<p class="ext-mb-text">Эта функция еще не реализована</p>'
      }
    })
  },

  notimplementedadminAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      title: 'Доступ запрещен',
      cmpType: 'Application.components.nowayPanel',
      cmpParams: {
        html: '<p class="ext-mb-text">Эта функция еще не реализована</p>'
      }
    })
  },

  waitconfirmAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.nowayPanel',
      title: 'Ваша заявка на аккредитацию/регистрацию находится на рассмотрении',
      cmpParams: {
        html: '<p class="ext-mb-text">Ваша заявка на аккредитацию находится в стадии рассмотрения. Пожалуйста, дождитесь уведомления о результатах ее рассмотрения на указанный вами адрес электронной почты.</p>'
      }
    })
  },

  devAction: function(params, app, panel) {
    Ext.Msg.alert('Раздел в разработке', 'Раздел еще не готов');
    redirect_to('/');
  },

  cleancacheAction: function(params, app, panel) {

    var syscleaner = function(params) {
      var dparams = {
        handle_failure: true,
        wait_text: 'Чистим кэш'
      };
      performRPCCall(RPC.Index.cleancache, params, dparams, function(resp) {
        Ext.Msg.alert('Кэш очищен',
                        '<p>Нода: '+resp.node+'</p>'+
                        '<p>'+resp.count+' файлов удалено</p>'+
                        '<p>Кэш: '+resp.zend_cache_type+' '+(resp.zend_cache?'очищен':'не очищен')+'</p>'
                     );
      });
    };

    if (typeof params['type'] == 'undefined') {
      params['type'] = '';
    }

    switch (params['type']) {
      // Очистить хранилище временных данных
      case 'store':
        app.sessionManager.getProvider().clear();
        Ext.Msg.alert('Успешно', 'Хранилище очищено');
        break;
      // Перезагрузить страницу с отключенным кэшем
      case 'reload':
        redirect_to('/');
        window.location.reload(true);
        return false;
      // Очистить кэш системы
      case 'system':
        if (!isUserAdmin()) {
          Ext.Msg.alert('Ошибка', 'Нет доступа');
        }
        syscleaner([{fast: true}]);
        break;
      // Очистить кэш временных файлов системы
      case 'tmp':
        if (!isUserAdmin()) {
          Ext.Msg.alert('Ошибка', 'Нет доступа');
        }
        syscleaner([null]);
        break;
      default:
        Ext.Msg.alert('Ошибка', 'Некорректный запрос');
    }
    redirect_to('/');
  }
});
