
Ext.define('Application.components.AdminProfilesTabPanel', {
  extend: 'Ext.TabPanel',
  initComponent: function() {
    var component = this;
    var admin_profiles_panel_id = Ext.id();

    var CustomerProfilesReqsPanel = {
      xtype: 'Application.components.AdminProfilesGrid',
      parent: component,      
      title: 'Профили заказчика',
      optype: 'customer',
      closable: false
    };

    var SupplierProfilesReqsPanel = {
      xtype: 'Application.components.AdminProfilesGrid',
      parent: component,
      title: 'Профили поставщика',
      optype: 'supplier',
      closable: false
    };

    Ext.apply(this, {
      activeTab: 0,
      id: admin_profiles_panel_id,
      enableTabScroll:false,
      border: false,
      items: [
        CustomerProfilesReqsPanel,
        SupplierProfilesReqsPanel
      ]
    });
    Application.components.AdminProfilesTabPanel.superclass.initComponent.call(this);
  }
});