Application.components.ActivateForm = Ext.extend(Ext.form.FormPanel, {
  border : false,
  height: 100,
  width: 250,
  hideTitle: false,
  title: '*',
  frame: true,
  labelWidth: 150,
  initComponent : function () {
    var component = this;
    Ext.apply(this, {
      width: 550,
      bodyCssClass: 'subpanel',
      bodyStyle: 'padding-top: 10px',
      items: new Ext.form.FieldSet({
        style: 'padding: 12px 10px 10px 10px; margin-bottom: 4px;',
        labelWidth: 200,
        defaults: {
          blankText: 'Поле обязательно для заполнения',
          allowBlank: false,
          xtype: 'textfield',
          anchor: '100%'
        },
        items: [
          {
            xtype: 'textfield',
            name: 'key',
            id: 'key',
            fieldLabel: 'Введите ключ из письма'
          },
          {
            xtype: 'hidden',
            name: 'id',
            value: (Main.user) ? Main.user.id : null
          }
        ]
      }),
      buttons: [
        {
          text: 'Активировать',
          handler: function() {
            var values = component.getForm().getValues();
            component.activate(values);
          }
        },
        {
          text: 'Указать другой email',
          handler: function() {
            Ext.Msg.prompt('Активация нового email', 'Введите новый email', (function(k, data) {
              if ('ok'==k) {
                if (!Ext.form.VTypes.email(data)) {
                  Ext.Msg.alert('Ошибка', 'Вы указали неверный e-mail');
                }else{
                  var params = {
                    id: Main.user.id,
                    email: data
                  };
                  component.resend(params);
                }
              }
            }).createDelegate(this));
          }
        }
      ],
      listeners: {
        beforeRender: function() {
          if (this.activationParams && this.activationParams.key) {
            this.activate(this.activationParams);
          }
        }
      }
    });
    Application.components.ActivateForm.superclass.initComponent.call(this);
  },
  activate: function(params) {
    RPC.Authentication.activate(params, (function(response){
      /*this.setTitle(response.title);
      this.update(response.message);*/
      if (response.success) {
        Ext.Msg.alert('Активация', 'Ваша учетная запись активирована', function() {
          Main.reloadPrivileges();
          redirect_to(response.message);
        });
      } else {
        echoResponseMessage(response);
      }
    }).createDelegate(this));
  },
  resend: function(params) {
    RPC.Authentication.activate(params, (function(response){
      echoResponseMessage(response);
    }).createDelegate(this));
  }
});
