
Application.components.BankAccountForm = Ext.extend(Ext.form.FormPanel, {
  frame : false,
  border : false,
  initComponent : function () {
    var component = this;

    this.ids = {
      bank_contragent_id: Ext.id(),
      bank_name_id: Ext.id(),
      bank_inn_id: Ext.id(),
      bank_kpp_id: Ext.id(),
      bank_ogrn_id: Ext.id(),
      bank_bik_id: Ext.id(),
      bank_account_kor_id: Ext.id(),
      bank_account_id: Ext.id(),
      bank_account_lic_id: Ext.id(),
      bank_addr_id: Ext.id(),
      bank_receiver_id: Ext.id(),
      bank_actual_id: Ext.id()
    };

    var contragentStore = getContragentStore();

    Ext.apply(this,
    {
      layout : 'form',
      title: component.title,
      bodyCssClass: 'subpanel-top-padding',
      labelWidth: 200,
      defaults: {
        anchor: '100%'
      },
      border: true,
      frame: true,
      items: [
        {
          xtype: 'combo',
          name: 'contragent_id',
          fieldLabel: 'Контрагент',
          mode: 'local',
          store: contragentStore,
          id: this.ids.bank_contragent_id,
          editable: false,
          valueField: 'rowid',
          displayField: 'full_name',
          allowBlank: false,
          forceSelection: true,
          triggerAction: 'all',

          listeners: {
            show: {
              fn: function (fielset) {
                fielset.doLayout();
              },
              scope:this
            },
            select: function () {
              var combo = Ext.getCmp(component.ids.bank_contragent_id);
              var value = combo.getStore().getById(combo.getValue());

              if (typeof value != 'undefined') {
                Ext.getCmp(component.ids.bank_inn_id).setValue(value.data.inn);
                Ext.getCmp(component.ids.bank_kpp_id).setValue(value.data.kpp);
                Ext.getCmp(component.ids.bank_ogrn_id).setValue(value.data.ogrn);
              }
            },
            afterrender: {
              fn: function (combo) {
                if (combo.getStore().loaded) {
                  combo.fireEvent('select');
                } else {
                  combo.getStore().addListener('load', function () {
                    contragentId = Ext.getCmp(component.ids.bank_contragent_id).getValue();
                    combo.setValue(contragentId);
                    combo.fireEvent('select');
                  });
                }
              },
              scope: this
            }
          }
        }, {
          xtype: 'textfield',
          fieldLabel: 'Наименование банка' + REQUIRED_FIELD,
          name: 'bank',
          id: this.ids.bank_name_id,
          allowBlank: false
        }, {
          xtype: 'textfield',
          fieldLabel: 'ИНН' + REQUIRED_FIELD,
          name: 'inn',
          id: this.ids.bank_inn_id,
          minLength: 10,
          maxLength: 12,
          emptyText: '10 - 12 цифр',
          allowBlank: false,
          disabled: true
        }, {
          xtype: 'textfield',
          fieldLabel: 'КПП' + REQUIRED_FIELD,
          name: 'kpp',
          id: this.ids.bank_kpp_id,
          vtype: 'digits',
          minLength: 9,
          maxLength: 9,
          emptyText: '9 цифр',
          allowBlank: false,
          disabled: true
        }, {
          xtype: 'textfield',
          fieldLabel: 'ОГРН' + REQUIRED_FIELD,
          name: 'ogrn',
          id: this.ids.bank_ogrn_id,
          vtype: 'digits',
          minLength: 10,
          maxLength: 15,
          emptyText: '10 - 15 цифр',
          allowBlank: false,
          disabled: true
        }, {
          xtype: 'textfield',
          fieldLabel: 'БИК' + REQUIRED_FIELD,
          name: 'bik',
          id: this.ids.bank_bik_id,
          vtype: 'digits',
          minLength: 9,
          maxLength: 9,
          emptyText: '9 цифр',
          allowBlank: false
        }, {
          xtype: 'textfield',
          fieldLabel: 'Корреспондентский счет' + REQUIRED_FIELD,
          name: 'account_kor',
          id: this.ids.bank_account_kor_id,
          vtype: 'digits',
          minLength: 20,
          maxLength: 20,
          emptyText: '20 цифр',
          allowBlank: false
        }, {
          xtype: 'textfield',
          fieldLabel: 'Расчетный счет' + REQUIRED_FIELD,
          name: 'account',
          id: this.ids.bank_account_id,
          vtype: 'digits',
          minLength: 20,
          maxLength: 23,
          emptyText: '20 - 23 цифр',
          allowBlank: false
        }, {
          xtype: 'textfield',
          fieldLabel: 'Лицевой счет',
          name: 'account_lic',
          id: this.ids.bank_account_lic_id,
          minLength: 0,
          maxLength: 40,
          emptyText: 'не более 40 цифр'
        }, {
          xtype: 'textfield',
          fieldLabel: 'Адрес банка',
          name: 'bank_addr',
          id: this.ids.bank_addr_id
        }, {
          xtype: 'textfield',
          fieldLabel: 'Получатель',
          name: 'receiver',
          id: this.ids.bank_receiver_id
        }, {
          xtype: 'checkbox',
          name: 'actual',
          fieldLabel: 'Активен',
          id: this.ids.bank_actual_id,
          checked: true
        }
      ],
      buttons: [
        {
          text: 'Закрыть',
          handler: function() {
            history.back(1);
          }
        },
        {
          text: 'Сохранить',
          scope: this,
          formBind: true,
          handler: function () {
            if (!Ext.getCmp(component.ids.bank_contragent_id).getValue()) {
              Ext.MessageBox.alert('Ошибка', 'Выберите контрагента');
              return;
            }
            component.performSave(function (result) {
              redirect_to(result.redirect_url);
            });
          }
        }
      ],
      getValues : function() {
        var v = {};
        collectComponentValues(this, v, false);
        return v;
      },
      performSave: function(cb) {
        var component = this;
        var values = component.getValues();
        values.id = component.bankId;

        performRPCCall(RPC.Bankaccount.save, [values], null, function(result) {
          if (result.success) {
            component.customer_profile_id = result.customer_profile_id;
            component.supplier_profile_id = result.supplier_profile_id;
            echoResponseMessage(result);

            if (cb) {
              cb(result);
            }
          } else {
            echoResponseMessage(result);
          }
        });
      }
    });
    component.doLayout();

    performRPCCall(RPC.Bankaccount.view, [{id: component.bankId}], null, function(resp) {
      if (resp.success && typeof resp.data != 'undefined') {
        component.cmp_data = resp.data;
        setComponentValues(component, resp.data, true);
      }
      component.doLayout();
    });

    Application.components.BankAccountForm.superclass.initComponent.call(this);
  }
});
