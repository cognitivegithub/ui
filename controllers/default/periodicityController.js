Ext.ns('Application.controllers.defaultModule');

Application.controllers.defaultModule.periodicityController = Ext.extend(Application.controllers.Abstract, {
  listAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.VocabSupplyPeriodicityGrid',
      title: 'Управление справочником периодов поставки'
    });
  }
});