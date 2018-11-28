Ext.define('Application.components.exportFinancePanel', {
  extend: 'Ext.Panel',
  frame: true,
  initComponent: function() {
    this.ids = {
      dates: Ext.id()
    };
    Ext.apply(this, {
      title: 'Экспорт данных',
      autoHeight: true,
      defaults: {
        anchor: '100%',
        border: true,
        defaults: {
          border: false,
          anchor: '100%',
          labelWidth: 300,
          allowBlank: false
        }
      },
      bodyCssClass: 'deepsubpanel',
      items: [{
        xtype: 'fieldset',
        //title: 'Экспорт актов в 1С',
        items: [{
          fieldLabel: 'Интервал дат',
          xtype: 'dateinterval',
          id: this.ids.dates,
          width: 500
        }],
        buttonAlign: 'left',
        buttons: [{
          text: 'Экспорт актов',
          handler: function() {
            this.performExport({type: 'acts'});
          },
          scope: this
        }, {
          text: 'Экспорт счетов',
          handler: function() {
            this.performExport({type: 'invoices'});
          },
          scope: this
        }]
      }]
    });
    Application.components.exportFinancePanel.superclass.initComponent.call(this);
  },
  performExport: function(params) {
    collectComponentValues(Ext.getCmp(this.ids.dates), params);
    params.format = 'htmljson';
    performAjaxRPCCall('/finance/export', params, {download: true, wait_disable: true}, echoResponseMessage);
  }
});
