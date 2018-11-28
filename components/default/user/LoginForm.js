Ext.define('Application.components.LoginForm', {
  extend: 'Ext.form.Panel',
  frame : false,
  border : false,
  initComponent : function () {
    var login_button_id = Ext.id();
    var login_button_id_noep = Ext.id();
    var login_input_id = Ext.id();
    var pass_id = Ext.id();
    this.addEvents('dologin');

    var component = this;
    var login_dparams = {
      scope: this,
      wait_text: 'Входим в систему'
    };

    Ext.apply(this, {
      autoHeight: true,
      width: 250,
      title: 'Вход',
      labelWidth: 60,
      frame: true,
      defaults: {
        anchor: '100%',
        stateful: true,
        allowBlank: false,
        stateEvents: ['change'],
        getState: function() {
          return {
            value: this.getValue()
          };
        }
      },
      monitorValid : true,
      items : [{
        xtype: 'textfield',
        name: 'username',
        id: login_input_id,
        stateId: 'login_username',
        hideLabel : true,
        fieldLabel: '<b>Логин</b>',
        enableKeyEvents : true,
        style: {
          marginBottom: '10px',
          padding: '5px',
          textAlign: 'center',
          fontWeight: 'bold'
        },
        emptyText : 'Логин',
        listeners : {
          keydown : function (field, e) {
            if (e.getKey() == e.ENTER) {
              var pass = Ext.getCmp(pass_id);
              if (pass.getValue()) {
                Ext.getCmp(login_button_id).handler.call(this);
              } else {
                pass.focus();
              }
            }
          },
          scope: this
        }
      },
      {
        hideLabel : true,
        fieldLabel : '<b>Пароль</b>',
        name: 'pass',
        xtype: 'textfield',
        inputType: 'password',
        id: pass_id,
        stateful: false,
        enableKeyEvents : true,
        style: {
          padding: '5px',
          textAlign: 'center'
        },
        emptyText: 'Пароль',
        listeners : {
          keydown : function (field, e) {
            if (e.getKey() == e.ENTER) {
              Ext.getCmp(login_button_id).handler.call(this);
            }
          },
          scope: this
        }
      }, {
        xtype: 'checkbox',
        //hidden: !Main.config.sessions_lock_ip,
        hidden: true,
        hideLabel: true,
        boxLabel: 'Привязывать сессию к IP. Отключайте эту опцию только если имеются проблемы со входом',
        name: 'lock_ip',
        checked: true
      },        
        {
          xtype: 'container',
          layout: 'column',
          items: [
            {
              xtype: 'container',
              columnWidth: 1,
              layout: 'column',
              width: '100%',
              id: 'login-form-buttons-row',
              hidden: !(Main && Main.eds && 'none'==Main.eds.mode),
              items: [
                {
                  columnWidth : 0.5,
                  xtype: 'button',
                  text: 'Вход',
                  scope: this,
                  id: login_button_id_noep,
                  formBind : true,
                  cls : 'btn-custom-login-fontsize fixed-noep-enter-button',
                  style: {
                    height: '30px',
                    marginRight: '15px'
                  },
                  handler: function(){
                    var parameters = this.getForm().getValues();
                    var params = [parameters['username'], parameters['pass'], {'lock_ip': parameters.lock_ip}];
                    performRPCCall(RPC.Authentication.login, params, login_dparams, this.loginHandler);
                  }
                }
              ]
            },
            {
              xtype: 'container',
              columnWidth: 1,
              layout: 'column',
              width: '100%',
              id: 'login-form-buttons-row-ep',
              hidden: Main && Main.eds && 'none'==Main.eds.mode,
              items: [
                {
                  columnWidth : 0.4,
                  xtype: 'button',
                  text: 'Вход',
                  scope: this,
                  id: login_button_id,
                  formBind : true,
                  cls : 'btn-custom-login-fontsize',
                  style: {
                    height: '30px',
                    marginRight: '15px'
                  },
                  handler: function(){
                    var parameters = this.getForm().getValues();
                    var params = [parameters['username'], parameters['pass'], {'lock_ip': parameters.lock_ip}];
                    performRPCCall(RPC.Authentication.login, params, login_dparams, this.loginHandler);
                  }
                },
                {
                  columnWidth : 0.60,
                  xtype: 'button',
                  text: 'Вход по ЭП',
                  scope: this,
                  cls : ' btn-custom-login-fontsize',
                  width: 150,
                  style: {
                    height: '30px'
                  },
                  //hidden: Main && Main.eds && 'none'==Main.eds.mode,
                  handler: function() {
                    var parameters = this.getForm().getValues();
                    var login_data = {
                      eds_login: true,
                      username: parameters['username'],
                      time: Math.round((new Date()).getTime()/1000),
                      stime: Math.round(getServerTime().getTime()/1000)
                    };
                    if (Main.signaturePlugin == 'capicom') {
                        login_data = signData(Ext.encode(login_data), 1, 1);
                        if (!checkSignatureResult(login_data)) {
                            return;
                        }
                        var params = [login_data, false, {'lock_ip': parameters.lock_ip}];
                        performRPCCall(RPC.Authentication.login, params, login_dparams, this.loginHandler);
                    } else if (Main.signaturePlugin == 'cryptopro') {
                        CryptoPlugin.signMessage({
                            message: Ext.encode(login_data),
                            success: function (result) {
                                var params = [result.message_signed, false, {'lock_ip': parameters.lock_ip}];
                                performRPCCall(RPC.Authentication.login, params, login_dparams, component.loginHandler);
                            },
                            failure: function () {
                            }
                        });
                    }
                  }
                },
                {
                    text: 'Выбор плагина для ЭЦП',
                    scope: this,
                    hidden: Main && Main.eds && 'none'==Main.eds.mode && 'none' == Main.eds.user_mode,
                    handler: function() {
                        var popup = new Application.components.PluginSelector();
                        popup.show();
                    }
                },
                  {
                  xtype: 'button',
                  columnWidth : 1,
                  text: 'Регистрация',
                  scope: this,
                  cls : 'btn-custom-login-fontsize',
                  style: {
                    height: '30px'
                  },
                  hidden: true,
                  //formBind : true,
                  handler: function(){
                    if (Main.config.disable_registration) {
                      Ext.Msg.confirm('Перейти на площадку госзаказа?',
                        'Регистрация возможна только через <a href="https://etp.roseltorg.ru/">систему для государственных заказчиков (СГЗ)</a>, '+
                        'вам следует подать заявку на аккредитацию в СГЗ, и, после аккредитации, вам будет открыт вход на эту площадку '+
                        'с использованием того же логина и пароля.<br/>\n'+
                        'Если ваша организация уже зарегистрирована на данной площадке, то администратор организации имеет возможность добавить '+
                        'пользователя в личном кабинете организации.<br/>\n'+
                        'Перейти на страницу регистрации СГЗ?',
                        function(b) {
                          if ('yes'==b) {
                            document.location.href='/index/go?'+Ext.urlEncode({'to':'https://etp.roseltorg.ru/authentication/register'});
                          }
                        }
                      );
                      return;
                      }
                      redirect_to('front/register');
                    }
                  }
              ]
            },
            {
              xtype: 'label',
              columnWidth: 1,
              html: 'Восстановить пароль',
              scope: this,
              hidden: true,
              cls : 'loginform-restorebutton',
              listeners: {
                render: function(label, eOpts) {
                  this.getEl().on("click", this.onClick);
                }
              },
              onClick: function(e, htmlElement, eOpts) {
                // TODO handler
              }
            },
            {
              xtype: 'container',
              columnWidth: 1,
              id: 'login-combo-container',
              hidden: true,
              items: [
                {
                  xtype: 'combo',
                  mode: 'local',
                  store : new Ext.data.ArrayStore({
                    id: 0,
                    fields: [
                      'id',
                      'name'
                    ],
                    data: [
                      [0, 'Руководства'],
                      [1, 'Подчиненные']
                    ]
                  }),
                  editable: false,
                  valueField: 'id',
                  displayField: 'name',
                  triggerAction: 'all',
                  value: 0,
                  width: 120
                }
              ]
            }
          ]
        }],
      buttons: []
    });

   if (!Main.config.login_form_disable_back) {
     var html = link_to('auth/restorepassword', 'Восстановить пароль', {attrs: {'class': 'small-note x-align-right'}});
     html += '<a href="' + Main.config.site_url + '" class="small-note">Вернуться на главную</a>';
    }
    this.items.push(
      {
        html: html
      }
    );

    Application.components.LoginForm.superclass.initComponent.call(this);
  },
  loginHandler: function(result) {
    if (result.success) {
      this.fireEvent('dologin', this, result);
    } else {
      echoResponseMessage(result);
    }
  }
});
