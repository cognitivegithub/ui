Ext.ns('Application.controllers.defaultModule');

Application.controllers.defaultModule.AuthController = Ext.extend(Application.controllers.Abstract, {
  loginAction: function (params, app, panel) {
    if ( 0!=app.historyManager.getToken().indexOf('auth/') ) {
      Main.temporary_landing = app.historyManager.getToken();
    }

    if (Main.user && Main.user.login && 'guest'!=Main.user.role && Main.user.landing) {
      redirect_to(Main.user.landing);
      return;
    }

    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.LoginForm',
      title: 'Вход в систему',
      cmpParams: {
        buttonAlign: 'center',
        padding: '30px 30px 0px 30px',
        preventBodyReset: true,
        unstyled: true,
        style: {
          margin: '80px auto 0px'
        },
        id: 'alter_login_form',
        header : false,
        footerCfg: {
          cls: 'custom-login-buttons-footer'
        },
        listeners: {
          dologin: function (event, result) {
            if (result.success) {
              Main.reloadPrivileges();
            } else {
              Ext.Msg.alert('Ошибка', result.message||'Пользователя с указанными данными в нашей базе нет');
            }
          },
          render: function (comp) {
            comp.reCalcLoginWallpaperHeight();
            Ext.EventManager.onWindowResize(comp.reCalcLoginWallpaperHeight, comp);
          },
          scope: this
        },
        reCalcLoginWallpaperHeight: function() {
          var tmpParent = this.findParentByType(Ext.Panel);
          var layoutSouthPanelForLogin = Ext.getCmp('layout_south_panel_for_login');
          var layoutNorthPanelForLogin = Ext.getCmp('layout_north_panel_for_login');
          if(Ext.isObject(tmpParent)){
            tmpParent.addClass('no-login-padding-top');
            tmpParent.body.setHeight(Ext.getBody().getViewSize().height - (layoutSouthPanelForLogin.getHeight() + layoutNorthPanelForLogin.getHeight()));
            tmpParent.body.applyStyles({
              background: 'url("/images/login_background.jpg") no-repeat 50% 100%'
            });
          }
        }
      }
    });
  },

  logoutAction: function(params, app, panel) {
    logout();
  },


  activateAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.ActivateForm',
      title: 'Активация адреса электронной почты',
      cmpParams: {
        activationParams: params
      }
    });
  },

  noaccessAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.nowayPanel',
      title: 'Доступ запрещен',
      cmpParams: {
        html: 'У вас нет доступа к данной операции. <a href="/#auth/logout">Выйти из системы</a>'
      }
    })
  },

  restorepasswordAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.restorePasswordForm'
    })
  }
});
