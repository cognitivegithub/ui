Ext.ns('Application.controllers.comModule');

Application.controllers.comModule.ContractController = Ext.extend(Application.controllers.Abstract, {
  title: function() {return t('Договоры')},
  indexAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.ContractListPanel',
      title: 'Договоры по лоту',
      cmpParams: {
        lot_id: params.lot,
        customer_id: params.customer,
        supplier_id: params.supplier
      }
    });
  },
  edsAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.ContractEdsPanel',
      title: 'Договоры по лоту',
      cmpParams: {
        lot_id: params.lot,
        customer_id: params.customer,
        supplier_id: params.supplier
      }
    });
  },
  listAction: function(params, app, panel) {
    var panel_title = 'Договоры';
    if (params.type == 'contractarchivecust') {
      panel_title = 'Мои договоры заключенные в качестве заказчика';
    } else if (params.type == 'contractarchivesuppl') {
      panel_title = 'Мои договоры заключенные в качестве заявителя';
    } else if (params.type == 'contractarchive') {
      panel_title = 'Все мои заключенные договоры';
    }
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.ProcedureGrid',
      title: panel_title,
      cmpParams: {
        filter: params.type
      }
    });
  }
});