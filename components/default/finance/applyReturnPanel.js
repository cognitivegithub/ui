
Ext.define('Application.components.applyReturnPanel', {
  extend: 'Ext.Panel',
  frame: true,
  initComponent: function() {
  var component = this;
  var app_panel_id = Ext.id();
  var form_panel_id = Ext.id();
  var grid_panel_id = Ext.id();
  
  var applicReturnForm = {
    xtype: 'Application.components.applicReturnForm',
    parent: component,
    id: form_panel_id,
    title: 'Подать заявку на возврат денежных средств',
    contragent_id: component.contragent_id
  };

  var applicReturnGrid = {
    xtype: 'Application.components.applicReturnGrid',
    parent: component,
    contragent_id: component.contragent_id,
    id: grid_panel_id,
    title: 'Заявки на возврат'
  };

  Ext.apply(this, {
    id: app_panel_id,
    enableTabScroll:false,
    bodyCssClass: 'subpanel-top-padding',
    border: false,
    autoHeight: true,
    items: [
      applicReturnForm,
      applicReturnGrid
    ],
    listeners: {
      beforerender: function() {
        Ext.getCmp(grid_panel_id).relayEvents(Ext.getCmp(form_panel_id), ['applic_added']);
      }
    }
  });
  Application.components.applyReturnPanel.superclass.initComponent.call(this);
  }
});