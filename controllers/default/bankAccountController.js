Ext.ns('Application.controllers.defaultModule');

Application.controllers.defaultModule.BankAccountController = Ext.extend(Application.controllers.Abstract, {
  listAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.BankAccountGrid',
      title: 'Список банков',
      cmpParams: {
        storeParams: {
          showAll: true
        },
        drawOperations: ['Просмотреть', 'Редактировать', 'Удалить'],
        drawSearch: ['query', 'inn', 'kpp', 'ogrn', 'status', 'account'],
        drawColumns: ['id', 'account', 'full_name', 'inn', 'kpp', 'drawOperations']
      }
    });
  },
  addAction: function (params, app, panel) {
    title = 'Добавление банка';
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.BankAccountForm',
      title: title,
      cmpParams: {
        showAll: true,
        title: title
      }
    });
  },
  editAction: function (params, app, panel) {
    title = 'Редактирование банка'
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.BankAccountForm',
      title: title,
      cmpParams: {
        showAll: true,
        title: title,
        bankId: params.id
      }
    });
  }
});
