/**
 * Компонент выводит филдсет с информацией о конторе (в заявку, к примеру).
 *
 * Параметры: cmp_data - данные процедуры
 */

Ext.define('Application.components.cmpDataView', {
  extend: 'Ext.form.FieldSet',
  title: 'Сведения о заявителе',
  autoHeight: true,
  initComponent: function() {
    var component = this;
    
     this.ids = {
      supplier_type_title: Ext.id(),
      profile_id: Ext.id()
    };
    
    Ext.apply(this, {
      labelWidth: 300,
      layout: 'form',
      defaults: {
        anchor: '100%',
        style: 'background: transparent; border: none;',
        allowBlank: false,
        defaults: {
          allowBlank: false,
          style: 'background: transparent; border: none;'
        }
      },
      items: [          
        {
          xtype: 'textfield',
          name: 'full_name',
          readOnly: true,
          value: component.cmpData.full_name,
          fieldLabel: 'Полное наименование организации'
        }, {
          xtype: 'textfield',
          readOnly: true,
          name: 'inn',
          value: component.cmpData.inn,
          fieldLabel: 'ИНН'
        }, {
          xtype: 'textfield',
          readOnly: true,
          name: 'kpp',
          value: component.cmpData.kpp,
          fieldLabel: 'КПП'
        },{
          xtype: 'textfield',
          fieldLabel: 'Тип организации',
          allowBlank: false,
          value: component.cmpData.supplier_profile_id,
          id: this.ids.supplier_type_title,
          name: 'supplier_type_title'
        }, {
          xtype: 'textfield',
          hidden: true,
          fieldLabel: 'Тип организации',
          allowBlank: false,
          value: component.cmpData.profile_id,
          id: this.ids.profile_id,
          name: 'profile_id'
        }, {
          xtype: 'checkbox',
          readOnly: true,
          fieldLabel: 'Субъект малого и среднего предпринимательства',
          value: component.cmpData.small_biz,
          name: 'small_biz',
          disabled: true
        }, {
          xtype: 'textfield',
          readOnly: true,
          name: 'legal_address',
          value: component.cmpData.legal_address,
          fieldLabel: 'Юридический адрес'
        },
        {
          xtype: 'textfield',
          readOnly: true,
          name: 'postal_address',
          value: component.cmpData.postal_address,
          fieldLabel: 'Почтовый адрес'
        }, {
          xtype: 'textfield',
          name: 'phone',
          readOnly: true,
          id: 'phone',
          value: '+'+component.cmpData.phone,
          hidden: !component.cmpData.phone ? true : false,
          fieldLabel: 'Контактный телефон'
        }, {
          xtype: 'hidden',
          name: 'contragent_id',
          value: component.cmpData.id
        }       
      ],
      listeners: {
        beforerender: function() {
          RPC.Company.loadprofiles('supplier', function(result) {
            var data_array = result.profiles;
            var r_length = data_array.length;
            var profile_id = Ext.getCmp(component.ids.profile_id);
            
            for(var i=0;i<r_length;i++) {
              if(data_array[i][0] && data_array[i][0] == profile_id.getValue()){
                var supplier_type_title = Ext.getCmp(component.ids.supplier_type_title);
                supplier_type_title.setValue(data_array[i][1]);
              }
            }
            
        });
        
      }
      }
    });
    Application.components.cmpDataView.superclass.initComponent.call(this);
  }
});
