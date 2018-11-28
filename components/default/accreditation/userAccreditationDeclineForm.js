/**
 * Формочка для отказа регистрации доверенности.
 * Параметры:
 * accr_id - номер заявки
 * user_id - номер пользователя
 */

Application.components.userAccreditationDeclineForm = Ext.extend(Ext.form.FormPanel, {
  frame : false,
  border : false,
  initComponent : function () {
    var component = this;

    Ext.apply(this, {
      xtype: 'form',
      labelWidth: 200,
      defaults: {
        anchor: '100%'
      },
      items: [{
        xtype: 'textfield',
        name: 'decline_reason',
        fieldLabel: 'Причина отказа в регистрации доверенности'
      }, {
        xtype: 'hidden',
        name: 'id',
        value: component.accr_id
      }, {
        xtype: 'hidden',
        name: 'action',
        value: 'decline'
      }],
      buttonAlign: 'left',
      buttons: [{
        text: 'Сформировать текст отказа в регистрации',
        handler: function() {
          RPC.User.signatureWarrantyText({
            choise: 'decline_warranty',
            user_id: component.user_id,
            decline_reason: component.getForm().findField('decline_reason').getValue()
          }, function(provider, resp) {
            if(resp.result.success) {
              var win = new Application.components.promptWindow({
                title: 'Заявка на регистрацию доверенности отклонена',
                cmpType: 'Application.components.SignatureForm',
                parentCmp: this,
                cmpParams: {
                  api: RPC.User.signUserWarranty,
                  signatureText : resp.result.message,
                  signatureTextHeight: 170,
                  useFormHandler: true,
                  success_fn : function() {
                    win.close();
                  },
                  items: [
                    {
                      xtype: 'hidden',
                      name: 'id',
                      value: component.accr_id
                    }, {
                      xtype: 'hidden',
                      name: 'action',
                      value: 'decline'
                    }, {
                      xtype: 'hidden',
                      name: 'decline_reason',
                      value: component.getForm().findField('decline_reason').getValue()
                    }
                  ]
                }
              });
              win.show();
              /*component.getForm().findField('signature_text').setValue(resp.result.message);
              Ext.getCmp('sign_decline_button').enable();*/
            } else {
              Ext.MessageBox.alert('Ошибка', resp.result.message);
            }
          });
        }
      }/*, {
        text: 'Подписать и отправить',
        id: 'sign_decline_button',
        disabled: true,
        scope: this,
        handler: function() {
          signForm(this, 'signature_text');
        }
      }*/]
    });
    Application.components.userAccreditationDeclineForm.superclass.initComponent.call(this);
  }
});
