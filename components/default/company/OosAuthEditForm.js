Application.components.OosAuthEditForm = Ext.extend(Ext.form.FormPanel, {
  frame : true,
  labelWidth: 250,
  initComponent : function () {
    var component = this, fieldset_cmp = Ext.id();
    Ext.apply(this, {
      bodyCssClass: 'subpanel',
      width: 800,
      items: [
        {
          xtype: 'hidden',
          name: 'contragent_id',
          value: Main.contragent.id
        },
        {
          xtype: 'fieldset',
          title: 'Введите аккредитационные данные',
          layout: 'form',
          id: fieldset_cmp,
          style: 'margin: 0px',
          labelWidth: 280,
          defaults: {
            xtype: 'textfield',
            allowBlank: false,
            anchor: '100%'
          },
          items:[
             {
              xtype: 'combo',
              store: new Ext.data.ArrayStore({
                  fields: ['id','type'],
                  data: [[1, 'Организация, попадающая под действие 223-ФЗ'], [2, 'Коммерческая организация']]
              }),
              displayField: 'type',
              valueField: 'id',
              editable: false,
              triggerAction: 'all',
              forceSelection: true,
              mode: 'local',
              value: Main.contragent.customer_type,
              emptyText: 'Выберите тип организации',
              fieldLabel: 'Тип организации',
              name: 'customer_type'
             }, {
              name: 'oos_login',
              value: Main.contragent.oos_login,
              fieldLabel: 'Логин пользователя в ЛК в ЕИС' + REQUIRED_FIELD
             }, {
              fieldLabel : 'Пароль пользователя в ЛК в ЕИС' + REQUIRED_FIELD,
              name: 'oos_password',
              value: Main.contragent.oos_password,
              inputType: 'password'
            }, {
              xtype: 'textfield',
              name: 'oos_inn',
              fieldLabel: 'ИНН в ЛК в ЕИС (если отличается от ЛК на площадке)',
              value: (Main.contragent.oos_inn) ? Main.contragent.oos_inn : Main.contragent.inn
            }, {
              xtype: 'textfield',
              name: 'oos_ogrn',
              fieldLabel: 'ОГРН в ЛК в ЕИС (если отличается от ЛК на площадке)',
              value: (Main.contragent.oos_ogrn) ? Main.contragent.oos_ogrn : Main.contragent.ogrn
            }, {
              xtype: 'textfield',
              name: 'oos_kpp',
              fieldLabel: 'КПП в ЛК в ЕИС (если отличается от ЛК на площадке)',
              value: (Main.contragent.oos_kpp) ? Main.contragent.oos_kpp : Main.contragent.kpp
            }, {
              xtype: 'checkbox',
              name: 'oos_is_filial',
              checked: Main.contragent.oos_is_filial,
              fieldLabel: 'Является филиалом другой организации, имеющей отдельный ЛК в ЕИС'
            }
          ]
        }
      ],
      buttonAlign: 'right',
      buttons: [
      {
        text: 'Сохранить',
        handler: function() {
          var values = {};
          collectComponentValues(component, values, false);
          performRPCCall(RPC.Company.oosAuth, [values], null, function(resp) {
            Main.contragent.customer_type = values.customer_type;
            Main.contragent.oos_login = values.oos_login;
            Main.contragent.oos_password = values.oos_password;
            Main.contragent.oos_inn = values.oos_inn;
            Main.contragent.oos_kpp = values.oos_kpp;
            Main.contragent.oos_ogrn = values.oos_ogrn;
            if(values.oos_is_filial) {
              Main.contragent.oos_is_filial = true;
            } else {
              Main.contragent.oos_is_filial = false;
            }
            echoResponseMessage(resp);
          });
          return false;
        }
      }
      ]
    });
    Application.components.OosAuthEditForm.superclass.initComponent.call(this);
  }
});