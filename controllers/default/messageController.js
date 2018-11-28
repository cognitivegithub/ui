Ext.ns('Application.controllers.defaultModule');

Application.controllers.defaultModule.MessageController = Ext.extend(Application.controllers.Abstract, {
  /**
   * Администрирование/Контент/Сообщения
   */
  listAction: function (params, app, panel) {
    var title = t('Сообщения');
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.announcementGrid',
      title: title
    });
  },

  addAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.AdminAnnouncementForm',
      title: 'Добавление сообщения'
    });
  },

  editAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.AdminAnnouncementForm',
      title: 'Редактирование сообщения',
      cmpParams: {
        messageId: (params.id) ? params.id : null
      }
    });
  }

});