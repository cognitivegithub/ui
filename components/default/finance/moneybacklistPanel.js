/*  Контейнер для грида заявок на возврат у админа и форму поиска по заявкам */
 
Ext.define('Application.components.moneybacklistPanel', {
  extend: 'Ext.Panel',
  frame: false,
  
  searchParams : {},
  initComponent: function() {
  var component = this;
  var app_panel_id = Ext.id();
  var form_panel_id = Ext.id();
  var grid_panel_id = Ext.id();
  var generate_form_id = Ext.id();

  var applicSearchForm = {
    xtype: 'Application.components.applicSearchForm',
    parent: component,
    id: form_panel_id
  };
  var applicReturnGrid = {
    xtype: 'Application.components.moneybackGrid',
    parent: component,
    title: 'Заявки на возврат',
    id: grid_panel_id
  };

  Ext.apply(this, {
    id: app_panel_id,
    enableTabScroll:false,
    border: false,
    defaults: {
      border: false,
      frame: true
    },
    autoHeight: true,
    items: [
      applicSearchForm,
      applicReturnGrid
    ],
    listeners: {
      beforerender: function() {
        Ext.getCmp(grid_panel_id).relayEvents(Ext.getCmp(form_panel_id), ['search_started']);
      }
    }
  });
  Application.components.moneybacklistPanel.superclass.initComponent.call(this);
  }
});