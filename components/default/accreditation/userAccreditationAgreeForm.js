/**
 * Формочка для принятия регистрации доверенности.
 * Параметры:
 * accr_id - номер заявки
 * user_id - номер пользователя
 */

Application.components.userAccreditationAgreeForm = Ext.extend(Ext.form.FormPanel, {
  frame : false,
  border : false,
  initComponent : function () {
    var component = this;

    var roles_grid_id = Ext.id();
    var sign_accept_button = Ext.id();
    
    var form_items = [{
            xtype: 'Application.components.UserRights',
            user_id: component.user_id,
            grid_only: true,
            id: roles_grid_id
          }];
    if (!component.is_admin) {
      form_items.push({
        xtype: 'datefield',
        fieldLabel: 'Срок действия доверенности',
        name: 'valid_for',
        format: 'd.m.Y'
      }, {
        xtype: 'checkbox',
        name: 'without_valid_for',
        fieldLabel: 'Без срока действия'
      });
    }
    form_items.push({
        xtype: 'hidden',
        name: 'id',
        value: component.accr_id
      }, {
        xtype: 'hidden',
        name: 'action',
        value: 'accept'
      }, {
        xtype: 'hidden',
        name: 'signature'
      });

    Ext.apply(this, {
      xtype: 'form',
      labelWidth: 200,
      items: form_items,
      buttonAlign: 'left',
      buttons: [{
          text: 'Сформировать текст на разрешение регистрации',
          handler: function() {
            if (!component.is_admin) {
              var date = component.getForm().findField('valid_for').getValue();
              var without_valid_for = component.getForm().findField('without_valid_for').getValue();
              if (!date && !without_valid_for) {
                Ext.MessageBox.alert('Сообщение системы', 'Укажите срок действия доверенности');
                return false;
              }
            }
            Ext.getCmp(roles_grid_id).getStore().save();
            if (date) date = date.format('d.m.Y');
            RPC.User.signatureWarrantyText({
              choise: 'accept_warranty',
              user_id: component.user_id,
              valid_for: date,
              without_valid_for: without_valid_for
            }, function(provider, resp) {
              if(resp.result.success) {
                var win = new Application.components.promptWindow({
                  title: 'Заявка на регистрацию доверенности принята',
                  cmpType: 'Application.components.SignatureForm',
                  parentCmp: this,
                  cmpParams: {
                    api: RPC.User.signUserWarranty,
                    signatureText : resp.result.message,
                    signatureTextHeight: 250,
                    useFormHandler: true,
                    success_fn : function(resp) {
                      win.close();
                      redirect_to(resp.result.redirect_url);
                    },
                    items: [
                      {
                        xtype: 'hidden',
                        name: 'id',
                        value: component.accr_id
                      }, {
                        xtype: 'hidden',
                        name: 'action',
                        value: 'accept'
                      }, {
                        xtype: 'hidden',
                        name: 'valid_for',
                        value: component.is_admin ? '' : Ext.util.Format.date(component.getForm().findField('valid_for').getValue(), 'd.m.Y')
                      }, {
                        xtype: 'hidden',
                        name: 'without_valid_for',
                        value: component.is_admin ? '' : Ext.util.Format.date(component.getForm().findField('without_valid_for').getValue(), 'd.m.Y')
                      }
                    ]
                  }
                });
                win.show();
                /*component.getForm().findField('signature_text').setValue(resp.result.message);
                Ext.getCmp(sign_accept_button).enable();*/
              } else {
                Ext.MessageBox.alert('Ошибка', resp.result.message);
              }
            });
          }
        }/*, {
          text: 'Подписать и отправить',
          id: sign_accept_button,
          disabled: true,
          scope: this,
          handler: function() {
            if (!component.hide_roles) {
              Ext.getCmp(roles_grid_id).getStore().save();
            }
            signForm(this, 'signature_text');
          }
        }*/]
    });
    Application.components.userAccreditationAgreeForm.superclass.initComponent.call(this);
  }
});
