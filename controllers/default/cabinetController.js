Ext.ns('Application.controllers.defaultModule');

Application.controllers.defaultModule.CabinetController = Ext.extend(Application.controllers.Abstract, {
  dashboardAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType:'Application.components.DashboardPanel',
      title: 'Панель управления',
      header: false,
      border: false
    });
  }
});
