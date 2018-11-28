
Ext.define('Application.components.NewNoedsUserForm', {
  extend: 'Ext.form.Panel',
  frame : false,
  border : false,
  departmentId : null,
  initComponent : function () {
    var component = this;
    var field_valid_for_id = Ext.id();
    var customer_roles_id = Ext.id();
    var supplier_roles_id = Ext.id();

    var action = (component.act)?component.act : 'register';

    var adv_items = [];
    if (component.type == 'user' && Main.contragent.length > 0 && Main.contragent.customer_accreditations.length > 0 && Main.contragent.supplier_accreditations.length) {
      adv_items.push({
        xtype: 'checkbox',
        fieldLabel: 'Права пользователя',
        boxLabel: 'Пользователь заказчика без ЭП',
        name: 'fl_customer_roles',
        id: customer_roles_id,
        allowBlank: true
      });
      adv_items.push({
        xtype: 'checkbox',
        fieldLabel: '',
        boxLabel: 'Пользователь заявителя без ЭП',
        name: 'fl_supplier_roles',
        id: supplier_roles_id,
        allowBlank: true
      });
    }
    adv_items.push({
      xtype: 'checkbox',
      fieldLabel: 'Действует до' + REQUIRED_FIELD,
      name: 'fl_valid_for',
      boxLabel: 'Без срока',
      allowBlank: true,
      scope: this,
      listeners: {
        check: function(field, status) {
          var field_valid_for = Ext.getCmp(field_valid_for_id);
          if (status) {
            field_valid_for.reset();
            field_valid_for.disable();
          } else {
            field_valid_for.enable();
          }
        }
      }
    });
    adv_items.push({
      xtype: 'datefield',
      format: 'd.m.Y',
      hideLabel: false,
      id: field_valid_for_id,
      name: 'valid_for',
      anchor: 0
    });

    Ext.apply(this, {
      autoHeight: true,
      frame: true,
      layout : 'form',
      title: component.title,
      defaults: {
        anchor: '100%',
        autoHeight: true,
        allowBlank: false,
        labelWidth: 200,
        xtype: 'fieldset',
        layout: 'form',
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
          departmentSelectedId: component.departmentId,
          isFrAdd: component.isFrAdd,
          act: action
        }, {
          title: 'Данные регистрации',
          items: adv_items,
          style: 'margin: 10px 0 0'
        }
      ],
      buttons: [
      {
        text: 'Отмена',
        handler: function() {
          history.back(1);
        }
      },
      {
        text: 'Регистрация',
        scope: this,
        formBind : true,
        handler: function(){

          var parameters = this.getForm().getValues();
          var parametersCorrect = this.getForm().getFieldValues();
          parameters.department_id = parametersCorrect.department_id;
          if (component.isFrAdd) {
            parameters.roleIds = parameters.rolesArr;
            parameters.department_id = DEPARTMENT_MANAGEMENT;
          }
          var customer_rights = Ext.getCmp(customer_roles_id);
          var supplier_rights = Ext.getCmp(supplier_roles_id);
          if (customer_rights && supplier_rights 
              && customer_rights.getValue() == false && supplier_rights.getValue() == false) {
            Ext.Msg.alert('Ошибка', 'Права пользователя не указаны');
            return;
          }
          performRPCCall(component.api, [parameters], {wait_text: 'Регистрируемся'}, function(result) {
            if(result.success) {
              var title = component.isFrAdd ?
                'Функциональный руководитель создан успешно.' :
                'Пользователь создан успешно.';
              Ext.Msg.alert('Успешно', title, function() {
                if (component.isFrAdd) {
                  redirect_to('admin/frList');
                } else {
                  redirect_to('admin/users');
                }
              });
            } else {
              echoResponseMessage(result);
            }
          });

        }
      }
      ]
    });
    Application.components.NewNoedsUserForm.superclass.initComponent.call(this);
  }
});
