Application.components.bankdataPanel = Ext.extend(Ext.Panel, {
  initComponent: function() {
    var component=this;
    if(component.numIndex===undefined)
      component.numIndex = 0;
    Ext.apply(this, {
      defaults: {
        anchor: '100%',
        allowBlank: false,
        cls: this.itemsCssClass,
        readOnly: this.readOnly
      },
      labelWidth: 200,
      layout: 'form',
      name: 'bank_data',
      id: 'bank_data',
      items:[
        {
          xtype: 'textfield',
          name: 'account',
          vtype: 'digits',
          minLength: 20,
          maxLength: 23,
          emptyText: '20 - 23 цифр',
          fieldLabel: 'Расчетный счет'+REQUIRED_FIELD
        },
        {
          xtype: 'textfield',
          name: 'account_lic',
          allowBlank: true,
          fieldLabel: 'Лицевой счет',
          minLength: 0,
          maxLength: 40,
          emptyText: 'не более 40 цифр'
        },
        {
          xtype: 'textfield',
          name: 'bik',
          vtype: 'digits',
          minLength: 9,
          maxLength: 9,
          id: 'bank_data_bik_'+component.numIndex,
          emptyText: '9 цифр',
          fieldLabel: 'БИК'+REQUIRED_FIELD,
          listeners: {
            change : function() {
              if (this.getValue().length == 9) {
                RPC.Reference.bik(this.getValue(), function(result,e) {
                  if(result.success) {
                    var bank_data = result.bank_data;
                    Ext.getCmp('bank_data_account_kor_'+component.numIndex).setValue(bank_data.kor);
                    Ext.getCmp('bank_data_bank_'+component.numIndex).setValue(bank_data.bank);
                    Ext.getCmp('bank_data_bank_addr_'+component.numIndex).setValue(bank_data.bank_addr);
                  } else {
                    Ext.MessageBox.alert("Сообщение системы", "Указанный вами БИК отсутствует в базе БИКов. Возможно, вы указали его некорректно.");
                  }
                });
              }
            }
          }
        },
        {
          xtype: 'textfield',
          name: 'account_kor',
          vtype: 'digits',
          minLength: 20,
          maxLength: 20,
          id: 'bank_data_account_kor_'+component.numIndex,
          allowBlank: true,
          emptyText: '20 цифр',
          fieldLabel: 'Корреспондентский счет'
        },
        {
          xtype: 'textfield',
          name: 'bank',
          id: 'bank_data_bank_'+component.numIndex,
          fieldLabel: 'Наименование банка'+REQUIRED_FIELD
        },
        {
          xtype: 'textfield',
          name: 'bank_addr',
          id: 'bank_data_bank_addr_'+component.numIndex,
          fieldLabel: 'Адрес банка'+REQUIRED_FIELD
        }, {
          xtype: 'hidden',
          name: 'entry_id'
        }
      ],
      getValues : function() {
        var v = {};
        collectComponentValues(component, v,true);
        return v;
      },
      setValues : function(v) {
        setComponentValues(component, v, false);
      }
    });
    Application.components.bankdataPanel.superclass.initComponent.call(this);
  }
});

