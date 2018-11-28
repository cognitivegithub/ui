
Ext.define('Application.components.finmailTabPanel', {
  extend: 'Ext.TabPanel',
  initComponent: function() {
  var component = this;
  var finmail_panel_id = Ext.id();

  var finPackagesPanel = {
    xtype: 'Application.components.finpackagesGrid',
    parent: component,
    title: 'Списки (пакеты)',
    closable: false
  };

  var finMailPanel = {
    xtype: 'Application.components.finmailGrid',
    parent: component,
    closable: false,
    title: 'Письма'
  };

  Ext.apply(this, {
    activeTab: 0,
    id: finmail_panel_id,
    enableTabScroll:false,
    border: false,
    items: [
      finPackagesPanel,
      finMailPanel
    ]
  });
  Application.components.finmailTabPanel.superclass.initComponent.call(this);
  }
});