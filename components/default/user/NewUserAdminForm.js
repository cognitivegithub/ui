
Application.components.NewUserAdminForm = Ext.extend(Ext.form.FormPanel, {
  frame : false,
  border : false,
  fileUpload: true,
  initComponent : function () {
    this.addEvents('doRegister');
    var component = this;
    var capid = Ext.id();

    var action = (component.act)?component.act : 'register';

    Ext.apply(this, {
      autoHeight: true,
      width: 650,
      layout : 'form',
      bodyCssClass: 'subpanel-top-padding',
      title: component.title,
      labelWidth: 200,
      frame: true,
      defaults: {
        anchor: '100%',
        stateful: true,
        autoHeight: true,
        allowBlank: false,
        xtype: 'fieldset',
        layout: 'form',
        stateEvents: ['change'],
        getState: function() {
          return {
            value: this.getValue()
          };
        },
        defaults: {
          anchor: '100%',
          msgTarget: 'under',
          allowBlank: false
        }
      },
      monitorValid : true,
      items : [
      {
        xtype: 'Application.components.CommonUserForm',
        act: action,
        listeners: {
          beforerender: function() {
            var component = this;
            if(component.act=='register') {
              var captcha = {
                xtype:'Application.components.captchaPanel',
                id: capid,
                labelWidth: 200
              };
              component.add(captcha);
            }
          }
        }
      },
      {
        xtype: 'hidden',
        name: 'signature'
      }
      ],
      buttons: [
      {
        text: 'Отмена',
        handler: function() {
          redirect_to('auth/login');
        }
      },
      {
        text: 'Регистрация',
        scope: this,
        formBind : true,
        handler: function(){
          var curTimestamp = new Date();
          var signatureValue;
          if ('none' == Main.eds.mode) {
            signatureValue = 'a';
          } else {
            signatureValue = signData(curTimestamp.format('Y-m-d H:i:s'), 1);
          }
          if (signatureValue.charAt(0)!='!') {
            this.getForm().findField('signature').setValue(signatureValue);

            var parameters = this.getForm().getValues();
            //var form = this;
            performRPCCall(RPC.Admin.register, [parameters], {wait_text: 'Регистрируемся'}, function(result) {
              if(result.success) {
                Ext.Msg.alert('Успешно', 'Пользователь создан успешно. Перед тем как продолжить работу, пожалуйста, подтвердите свой email, пройдя по ссылке из письма, которое только что было Вам отправлено', function() {redirect_to('auth/login');});
              } else {
                echoResponseMessage(result);
                Ext.getCmp(capid).fireEvent('reload');
              }
            });
          } else {
            Ext.Msg.alert('Ошибка', signatureValue);
          }
        }
      }
      ]
    });
    Application.components.NewUserForm.superclass.initComponent.call(this);
  }
});
