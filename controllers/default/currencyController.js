Ext.ns('Application.controllers.defaultModule');

Application.controllers.defaultModule.CurrencyController = Ext.extend(Application.controllers.Abstract, {
  title: 'Курсы валют',
  viewAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.currencyViewForm',
      title: 'Курсы валют',
      cmpParams:{
        type: params.type
      }
    });
  }
});
