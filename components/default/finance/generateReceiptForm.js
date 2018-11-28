
Ext.define('Application.components.generateReceiptForm', {
  extend: 'Ext.form.FormPanel',
  initComponent : function () {
    var component = this;
        
    Ext.apply(this, {
      width: 500,
      frame: true,
      bodyCssClass: 'subpanel',
      bodyStyle: 'padding-top: 5px',
      items: [{
        xtype: 'fieldset',
        title: 'Введите диапазон дат',
        style: 'margin-bottom: 5px;',
        items: [{
          xtype: 'panel',
          border: false,
          layout: 'hbox',
          items: [{
            xtype: 'panel',
            layout: 'form',
            labelWidth: 10,
            items: [{
              xtype: 'datefield',
              name: 'start_from',
              fieldLabel: 'c',
              labelSeparator: '',
              width: 100,
              format:'d.m.Y'
            }]
          }, {
            xtype: 'panel',
            layout: 'form',
            labelWidth: 20,
            style: 'padding-left: 7px',
            items: [{
              xtype: 'datefield',
              name: 'start_till',
              fieldLabel: 'по',
              labelSeparator: '',
              width: 100,
              format:'d.m.Y'
            }]
          }, {
            xtype: 'button',
            style: 'padding-left: 7px',
            text: 'Сформировать и загрузить',
            scope: this,
            formBind : true,
            handler: function() {
              var params = this.getForm().getValues();
              var href = String.format('finance/receipt/start_from/{0}/start_till/{1}', params['start_from'], params['start_till']);
              window.location = href;
            }
          }, {
            xtype: 'button',
            style: 'padding-left: 7px',
            text: 'Отмена',
            handler: function() {
              history.back(1);
            }
          }]
        }]
      }]
    });
    
    Application.components.generateReceiptForm.superclass.initComponent.call(this);
  }
});
