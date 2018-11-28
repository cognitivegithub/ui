Ext.ns('Application.controllers.defaultModule');

Application.controllers.defaultModule.LogController = Ext.extend(Application.controllers.Abstract, {
  title: 'Журналы',
  indexAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.LogGrid',
      title: 'Список событий',
      cmpParams: {logtype: 'main'}
    });
  },
  erlogAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.LogGrid',
      cmpParams: {logtype: 'error'},
      title: 'Список ошибок'
    });
  },
  synclogAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.LogGrid',
      cmpParams: {logtype: 'sync'},
      title: 'Обмен информации со смежными системами'
    });
  },
  soaplogAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.SoapLogGrid',
      title: 'Журнал интеграции'
    });
  },
  edslogAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.LogGrid',
      cmpParams: {logtype: 'eds'},
      title: 'События ЭП'
    });
  },
  // пункт меню "Входящие уведомления"
  maillistAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.MailLogGrid',
      title: 'Входящие уведомления'
    });
  },
  // пункт меню "Администрирование > Журналы > Почтовые уведомления"
  maillogAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.MailLogGrid',
      title: 'Почтовые уведомления'
    });
  },
  // пункт меню "Администрирование > Журналы > Взаимодействие с ЕИС"
  ooslogAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.OosGrid',
      title: 'Взаимодействие с ЕИС'
    });
  }
});
