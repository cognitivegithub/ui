Ext.ns('Application.controllers.referenceController');

Application.controllers.defaultModule.referenceController = Ext.extend(Application.controllers.Abstract, {
  documentTypesAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.DocumentTypesGrid',
      title: 'Типы документов для загрузки',
      cmpParams: {
      }
    });
  }
});