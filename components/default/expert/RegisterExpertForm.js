
Ext.define('Application.components.RegisterExpertForm', {
  extend: 'Ext.form.Panel',
  frame : false,
  border : false,
  initComponent : function () {
    var component = this;

    var company_fields_ids = {
      full_name: Ext.id(),
      address: Ext.id()
    };

    var field_valid_for_id = Ext.id();
    Ext.apply(this, {
      autoHeight: true,
      frame: true,
      layout : 'form',
      bodyCssClass: 'subpanel-top-padding',
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
      items : [{
        title: 'Данные об организации',
        items: [{
          xtype: 'textfield',
          name: 'full_name',
          anchor: '100%',
          id: company_fields_ids.full_name,
          fieldLabel: 'Наименование организации'+REQUIRED_FIELD,
          minLength: 3,
          maxLength: 1000
        }, {
          xtype: 'textfield',
          name: 'inn',
          anchor: '100%',
          fieldLabel: 'ИНН',
          disabled: true
        }, {
          title: 'Адрес местонахождения',
          labelWidth: 200,
          border: true,
          frame: true,
          bodyStyle: 'padding: 10px',
          id: company_fields_ids.address,
          items:[{
            xtype: 'Application.components.addressPanel',
            name: 'postal',
            id: 'postal',
            getValues : function() {
              var v = {};
              collectComponentValues(this, v,true);
              return v;
            }
          }]
        }]
      }, {
        xtype: 'Application.components.CommonUserForm',
        act: 'register'
      }, {
        title: 'Данные регистрации',
        items: [{
          xtype: 'checkbox',
          fieldLabel: 'Действует до',
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
        }, {
          xtype: 'datefield',
          format: 'd.m.Y',
          hideLabel: false,
          id: field_valid_for_id,
          name: 'valid_for',
          anchor: 0
        }],
        style: 'margin: 10px 0 0'
      }],
      buttons: [{
        text: 'Отмена',
        handler: function() {
          history.back(1);
        }
      }, {
        text: 'Регистрация',
        scope: this,
        formBind : true,
        handler: function(){
          var parameters = {};
          collectComponentValues(component, parameters);
          performRPCCall(RPC.User.registerexpert, [parameters], {wait_text: 'Регистрируемся'}, function(result) {
            if(result.success) {
              Ext.Msg.alert('Успешно', 'Эксперт успешно зарегистрирован. Данные переданы на рассмотрение оператору.', function() {redirect_to('user/view');});
            } else {
              echoResponseMessage(result);
            }
          });

        }
      }],
      listeners: {
        render: function() {
          performRPCCall(RPC.Company.load,[{id: Main.contragent.id}], null, function(resp){
            if(resp.success) {
              if (true === resp.data.is_expert) {
                Ext.Msg.alert('Ошибка', 'Ваша организация уже является экспертной.', function() {
                  redirect_to('/');
                });
              } else if (false === resp.data.is_expert && resp.data.expert_user) {
                Ext.Msg.alert('Ошибка', 'Вы уже подали заявку на регистрацию в качестве экспертной организации.', function() {
                  redirect_to('/');
                });
              }
              // если организация неавторизована, можем менять название и месторасположение
              if (resp.data.status != 1) {
                for(var prop in company_fields_ids) {
                  if (company_fields_ids.hasOwnProperty(prop)) {
                    Ext.getCmp(company_fields_ids[prop]).setDisabled(true);
                  }
                }
              }
              setComponentValues(component, resp.data);
            } else {
              echoResponseMessage(resp);
            }
          });
        }
      }
    });
    Application.components.RegisterExpertForm.superclass.initComponent.call(this);
  }
});
