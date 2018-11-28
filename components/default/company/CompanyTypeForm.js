
Application.components.CompanyTypeForm = Ext.extend(Ext.Panel, {
  frame : false,
  border : false,
  initComponent : function () {
    function loadProfiles(user_group) {
      var radioItems = [];
      RPC.Company.loadprofiles(user_group, function(result) {
        radioItems.push({boxLabel: result.name, name:'cmptype',inputValue:result.id});
      });
    }

    var supplieRadioGroup = {
      xtype: 'radiogroup',
      fieldLabel: 'Тип аккредитации'+REQUIRED_FIELD,
      itemCls: 'x-check-group-alt',
      columns: 1,
      id: 'supplier_type',
      items: loadProfiles(1)
    };

    var customeRadioGroup = {
      xtype: 'radiogroup',
      fieldLabel: 'Тип регистрации'+REQUIRED_FIELD,
      itemCls: 'x-check-group-alt',
      columns: 1,
      id: 'customer_type',
      items: loadProfiles(2)
    };

    Ext.apply(this,
      {
        xtype: 'panel',
        border: false,
        frame: true,
        layout : 'form',
        defaults: {
          anchor: '100%',
          allowBlank: false,
          minLengthText: 'Слишком короткое значение',
          maxLengthText: 'Слишком длинное значение'
        },
        monitorValid : true,
        layout: 'column',
        title: 'Выбор типа аккредитации/регистрации',
        items: [
        {
          xtype: 'panel',
          columnWidth: .45,
          frame: false,
          border: false,
          title: 'Получить аккредитацию как заявитель',
          items: [
            supplieRadioGroup
          ]
        }, {
          columnWidth: .1
        }, {
          xtype: 'panel',
          columnWidth: .45,
          frame: false,
          border: false,
          title: 'Получить аккредитацию как заказчик',
          items: [
            customeRadioGroup
          ]
        }

        ],
        buttons: [
          {
            text: 'Продолжить'
          }
        ]
    });
    Application.components.CompanyTypeForm.superclass.initComponent.call(this);

    this.form.api = {
        submit: RPC.Company.save
    };
    this.form.waitMsgTarget = true;
  }
});
