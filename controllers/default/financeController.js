Ext.ns('Application.controllers.defaultModule');

Application.controllers.defaultModule.FinanceController = Ext.extend(Application.controllers.Abstract, {
  title: 'Финансы',
  /**
   * Состояние лицевого счета
   */
  balanceAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.balancePanel',
      cmpParams: {
        contragent_id:(params.id)?params.id:0
      },
      title: 'Состояние счета'
    });
  },

  /**
   * История операций - кабинеты
   */
  historyAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.historyTabPanel',
      cmpParams: {
        contragent_id:(params.id)?params.id:Main.contragent.id
      },
      title: 'История операций по счету'
    });
  },

  /**
   * История операций - админка
   */
  finhistoryAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.historyTabPanel',
      cmpParams: {
        contragent_id:params.id
      },
      title: 'История операций по счету'
    });
  },

  /**
   * Выписка по счету - кабинет контрагента
   */
  receiptAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.generateReceiptForm',
      cmpParams: {
        contragent_id:(params.id)?params.id:Main.contragent.id
      },
      title: 'Выписка по счету'
    });
  },

  /**
   * Заявки на возврат - кабинет контрагента
   */
  applyreturnAction : function (params, app, panel) {
    //Временное отключение
    /*panel.add({
      xtype: 'Application.components.actionPanel',
      title: 'Доступ запрещен',
      cmpType: 'Application.components.nowayPanel',
      cmpParams: {
        html: '<p class="ext-mb-text">Эта функция в данный момент недоступна.</p>'
      }
    });*/
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.applyReturnPanel',
      cmpParams: {
        contragent_id:(params.id)?params.id:Main.contragent.id
      },
      title: 'Заявки на возврат средств'
    });
  },

  /**
   * Расходные документы - кабинет контрагента
   */
  docsAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.docsGrid',
      title: 'Расходные документы'
    });
  },

  /**
   * Журнал задолженностей
   */
  debtsAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.debtGrid',
      title: 'Учет задолженностей'
    });
  },

  /**
   * Поиск по актам и счетам - кабинет админа
   */
  docsearchAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.docsGrid',
      title: 'Поиск по актам и счетам'
    });
  },

  /**
   * Журнал почтовых отправлений
   */
  postmonitorAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.finmailTabPanel',
      title: 'Почтовые отправления'
    });
  },

  /**
   * Банк-клиент: Пополнение счетов
   */
  bankslipAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.bankSlipPanel',
      title: 'Загрузка выписки'
    });
  },

  /**
   * Проведение операций вручную - кабинет админа
   */
  operationsAction: function (params, app, panel) {
    panel.add({
      xtype       : 'Application.components.actionPanel',
      cmpType     : 'Application.components.financeOperationsPanel',
      title       : 'Операции со счетами',
      cmpParams   : {
        supplier    : (params.supplier) ? params.supplier : null,
        title       : 'Операции со счетами'
      }
    });
  },

  /**
   * Заявки на возврат - кабинет администратора
   */
  moneybacklistAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.moneybacklistPanel',
      title: 'Заявки на возврат средств',
      border: false
    });
  },

  moneyorderAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.moneyorderPanel',
      title: 'Банк-клиент - возвраты'
    });
  },

  exportAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.exportFinancePanel',
      title: 'Экспорт финансовых данных в 1С'
    });
  }

});
