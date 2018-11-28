
Ext.define('Application.components.historyTabPanel', {
  extend: 'Ext.TabPanel',
  initComponent: function() {
  var component = this;
  var history_panel_id = Ext.id();

  var historyDepositPanel = {
    xtype: 'Application.components.historyGrid',
    parent: component,
    title: 'История списаний/пополнений',
    closable: false,
    contragent_id: component.contragent_id,
    optype: 'service_fee'
  };

  var historyBlockPanel = {
    xtype: 'Application.components.historyGrid',
    parent: component,
    closable: false,
    title: 'История блокировок',
    contragent_id: component.contragent_id,
    optype: 'deposit_blocked'
  };

  Ext.apply(this, {
    activeTab: 0,
    id: history_panel_id,
    enableTabScroll:false,
    border: false,
    defaults: {
      border: false,
      frame: true
    },
    items: [
      historyDepositPanel,
      historyBlockPanel
    ]
  });
  Application.components.historyTabPanel.superclass.initComponent.call(this);
  }
});