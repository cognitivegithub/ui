Ext.ns('Application.controllers.defaultModule');

Application.controllers.defaultModule.AccreditationController = Ext.extend(Application.controllers.Abstract, {
  title: 'Аккредитация',
  indexAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.AccreditationGrid',
      title: 'Список организаций, подавших заявку на регистрацию',
      cmpParams: {
        type: params.type
      }
    });
  },
  reviewAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.AccreditationReviewForm',
      title: 'Рассмотрение заявки',
      cmpParams: {
        id: 'reviewPanel',
        params: params,
        border: false,
        cls: 'info'
      }
    });
  },
  usersAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.UsersAccreditationsGrid'
    })
  },
  declinedAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.AccreditationDeclinedGrid',
      title: 'Список организаций, кому отказано в аккредитации',
      cmpParams: {
        type: params.type
      }
    });
  },
  viewAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.AccreditationViewForm',
      title: 'Заявка на аккредитацию',
      cmpParams: {
        params: params
      }
    });
  }

});
