Application.components.CredentialsEditForm = Ext.extend(Ext.form.FormPanel, {
  frame : true,
  labelWidth: 250,
  initComponent : function () {
    var component = this, fieldset_cmp = Ext.id();
    Ext.apply(this, {
      bodyCssClass: 'subpanel',
      width: 500,
      items: [
        {
          xtype: 'hidden',
          name: 'user_id',
          value: this.user_id
        },
        {
          xtype: 'fieldset',
          title: 'Введите новые аккредитационные данные',
          layout: 'form',
          id: fieldset_cmp,
          style: 'margin: 0px',
          labelWidth: 170,
          defaults: {
            xtype: 'textfield',
            allowBlank: false,
            anchor: '100%'
          }
        }
      ],
      listeners : {
        beforerender: function() {
          var cmp = Ext.getCmp(fieldset_cmp);
          if(component.type=='email') {
            cmp.add (
              {
                name: 'email',
                vtype: 'email',
                value: Main.user.user_email,
                fieldLabel: 'Адрес электронной почты'+REQUIRED_FIELD
              });
            cmp.add (
              {
                fieldLabel : 'Пароль'+REQUIRED_FIELD,
                name: 'password',
                inputType: 'password'
              });
          }
          else if (component.type=='password') {
            cmp.add({
              name: 'old_password',
              fieldLabel : 'Прежний пароль'+REQUIRED_FIELD
            });

            cmp.add({
              name: 'password',
              fieldLabel : 'Новый пароль'+REQUIRED_FIELD,
              vtype: 'password',
              id: 'password'
            });

            cmp.add({
              name: 'confpwd',
              fieldLabel : 'Подтверждение пароля'+REQUIRED_FIELD,
              initialPasswordField: 'password',
              vtype: 'password'
            });
          }
        }
      },
      buttonAlign: 'right',
      buttons: [
      {
        text: 'Сохранить',
        handler: function() {
          var stringToSign = gettime();
          var values = {};
          collectComponentValues(component, values, false);
          if(component.type=='email') {
            stringToSign=values.email;
          } else if (component.type=='password') {
            stringToSign=values.password;
          }
          var signatureValue = getSignature(stringToSign);
          if (!Main.user.withoutECS && !checkSignatureResult(signatureValue)) {
            return false;
          }
          values.signature = signatureValue;
          performRPCCall(RPC.User.credentials, [values], null, function(resp) {
            echoResponseMessage(resp);
          });
          return false;
        }
      }
      ]
    });
    Application.components.CredentialsEditForm.superclass.initComponent.call(this);
  }
});