/**
 * Компонент выводит филдсет с информацией о конторе (в заявку, к примеру).
 *
 * Параметры: cmp_data - данные о организации
 */

Ext.define('Application.components.cmpDataPanel', {
  extend: 'Ext.form.FieldSet',
  title: 'Сведения о заявителе',
  autoHeight: true,
  initComponent: function() {
    var component = this;
    Ext.apply(this, {
      labelWidth: 300,
      layout: 'form',
      defaults: {
        anchor: '100%',
        defaults: {
          border: false,
          anchor: '100%',
          allowBlank: false
        }
      },
      items: [          
        {
          xtype: 'textfield',
          name: 'full_name',
          readOnly: true,
          style: 'background: transparent; border: none;',
          value: component.cmpData.full_name,
          fieldLabel: 'Полное наименование организации'
        },
        {
          xtype: 'textfield',
          readOnly: true,
          name: 'inn',
          style: 'background: transparent; border: none;',
          value: component.cmpData.inn,
          fieldLabel: 'ИНН'
        },
        {
          xtype: 'textfield',
          readOnly: true,
          name: 'kpp',
          style: 'background: transparent; border: none;',
          value: component.cmpData.kpp,
          fieldLabel: 'КПП'
        },
        {
          xtype: 'textfield',
          readOnly: true,
          name: 'legal_address',
          style: 'background: transparent; border: none;',
          value: component.cmpData.legal_address,
          fieldLabel: 'Юридический адрес'
        },
        {
          xtype: 'textfield',
          readOnly: true,
          name: 'postal_address',
          style: 'background: transparent; border: none;',
          value: component.cmpData.postal_address,
          fieldLabel: 'Почтовый адрес'
        }, {
          xtype: this.noneditable ? 'textfield' : 'Application.components.phonePanel',
          noneditable: this.noneditable,
          readOnly: (this.noneditable ? true : false),
          style: (this.noneditable ? 'background: transparent; border: none;' : ''),
          name: 'phone',
          id: 'phone',
          value: component.cmpData.phone,
          allowBlank: true,
          fieldLabel: 'Контактный телефон'
        }, {
          xtype: 'hidden',
          name: 'contragent_id',
          value: component.cmpData.id
        }
      ]
    });
    Application.components.cmpDataPanel.superclass.initComponent.call(this);
  }
});
