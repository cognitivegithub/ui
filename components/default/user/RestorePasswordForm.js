Ext.define('Application.components.restorePasswordForm', {
  extend: 'Ext.form.Panel',
  frame : false,
  border : false,
  initComponent : function () {
    var component = this, signature_cmp=Ext.id(), captcha_cmp=Ext.id();
    var restoreEDS = function() {
      if (!component.getForm().isValid()) {
        return;
      }
      var values = component.getForm().getValues();
      var signatureValue = getSignature('Прошу выслать новый пароль для пользователя '+values.login+'\n'+gettime());
      if (!signatureValue) {
        return;
      }
      Ext.getCmp(signature_cmp).setValue(signatureValue);
      performRPCCall(RPC.Authentication.restorePassword, [values], {wait_text: 'Идет восстановление пароля. Подождите...'}, function(result) {
        if (result.success) {
          echoResponseMessage(result);
          redirect_to('auth/login');
        } else {
          echoResponseMessage(result);
          var cap = Ext.getCmp(captcha_cmp);
          if (cap) {
            cap.fireEvent('reload');
          }
        }
      });
    };

    var restoreNoEDS = function() {
      Ext.getCmp(signature_cmp).setValue('0');
      if (component.getForm().isValid()) {
        performRPCCall(RPC.Authentication.restorePassword, [component.getForm().getValues()], {wait_text: 'Идет восстановление пароля. Подождите...'}, function(result) {
          if (result.success) {
            echoResponseMessage(result);
            redirect_to('auth/login');
          } else {
            echoResponseMessage(result);
            var cap = Ext.getCmp(captcha_cmp);
            if (cap) {
              cap.fireEvent('reload');
            }
          }
        });
      }
    };
    Ext.apply(this, {
      width: 650,
      frame: true,
      title: 'Восстановление пароля',
      bodyStyle: 'padding: 6px; margin: 0px;',
      items: new Ext.form.FieldSet({
        labelWidth: 200,
        style: 'padding: 0px 12px 0px 12px; margin: 0px;',
        bodyStyle: 'padding-top: 6px;',
        title: 'Введите данные для восстановления пароля',
        defaults: {
          blankText: 'Поле обязательно для заполнения',
          allowBlank: false,
          xtype: 'textfield',
          anchor: '100%'
        },
        items: [{
          name:'login',
          fieldLabel:'Логин'+REQUIRED_FIELD,
          allowBlank: false,
          blankText: 'Введите ваш логин, который указывали при регистрации'
        }, {
          name: 'checkphrase',
          fieldLabel: 'Кодовая фраза'+REQUIRED_FIELD,
          allowBlank: false,
          id: 'checkphrase'
        }, {
          xtype: 'Application.components.captchaPanel',
          frame: true,
          id: captcha_cmp,
          labelWidth: 200
        }, {
          id: signature_cmp,
          name: 'signature',
          xtype: 'hidden',
          value: ''
        }],
        buttons: [{
          text: 'Восстановить пароль по ЭП',
          hidden: 'none'==Main.eds.mode,
          handler: restoreEDS
        }, {
          text: 'Восстановить пароль',
          handler: restoreNoEDS
        }]
      })
    });
    Application.components.LoginForm.superclass.initComponent.call(this);
  }
});
