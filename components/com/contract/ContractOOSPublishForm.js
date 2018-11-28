
Ext.define('Application.components.ContractOOSPublisForm', {
  extend: 'Ext.panel.Panel',
  frame: true,
  border: false,
  bodyCssClass: 'subpanel',
  initComponent: function() {
    var component = this;
    var oos_fieldset_id = Ext.id(),
        name_id = Ext.id(),
        sum_info_id = Ext.id(), term_info_id = Ext.id();

    Ext.apply(this, {
      items: [{
        xtype: 'fieldset',
        title: 'Данные для осуществления публикации договора на zakupki.gov.ru',
        cls: 'spaced-fieldset',
        id: oos_fieldset_id,
        labelWidth:350,
        defaults: {
          bodyStyle: 'padding: 0px'
        },
        items: [
          {
            xtype: 'textfield',
            name: 'name',
            anchor: '100%',
            id: name_id,
            fieldLabel: 'Наименование договора'+REQUIRED_FIELD,
            allowBlank: false,
            blankText: 'Поле Наименование договора обязательно для заполнения'
          }, {
            xtype: 'textfield',
            name: 'sum_info',
            anchor: '100%',
            id: sum_info_id,
            fieldLabel: 'Сведения о сумме заключаемого договора',
            qtipConfig: {
              title: 'Сумма заключенного ' + t('контракта'),
              html: '<p>Если Вы не введете никаких данных в это поле, в ЕИС будет передана информация ' +
                     ' об окончательной цене лота, равная цене предложения участника-победителя.</p>',
              autoHide: false,
              applyTipTo: 'label'
            },
            plugins: [Ext.ux.plugins.ToolTip ]
          }, {
            xtype: 'textfield',
            name: 'term_info',
            anchor: '100%',
            id: term_info_id,
            fieldLabel: 'Сведения о сроках действия заключаемого договора',
            qtipConfig: {
              title: 'Срок действия заключаемого договора',
              html: '<p>Если Вы не введете никаких данных в это поле, в поле ' +
              '"Срок действия договора" в ЕИС будет передан текст &laquo;указан в приложенном документе&raquo;.</p>',
              autoHide: false,
              applyTipTo: 'label'
            },
            plugins: [Ext.ux.plugins.ToolTip ]
          }
        ]
      }],
      buttons: [{
        text: 'Отменить',
        handler: function() {
          if(component.winId) {
            Ext.getCmp(component.winId).close();
          }
        }
      }, {
        text: 'Передать на zakupki.gov.ru',
        handler: function() {
          var me = component;
          var values = {contract_id: component.contract_id};
          collectComponentValues(component, values, true);
          performRPCCall(RPC.Contract.oosqueue, [values], {wait_delay: 0, wait_text: t('Контракт') + ' ставится в очередь на публикацию...'}, function(result) {
            if(result.success) {
              echoResponseMessage(result);
              if(me.winId) {
                Ext.getCmp(me.winId).close();
                Ext.getCmp(me.buttonId).hide();
              }
            } else {
              echoResponseMessage(result);
            }
          });
        }
      }],
      listeners : {
        beforerender : function() {
          performRPCCall(RPC.Contract.oosdata, [{contract_id: component.contract_id}], {wait_delay: 0, wait_text: 'Загружаются данные ' + t('контракта') + '. Подождите...'}, function(result) {
            if(result.success && result.contract_data) {
              setComponentValues(component, result.contract_data, true);
            } else {
              echoResponseMessage(result);
            }
          });
        }
      }
    });

    Application.components.ContractOOSPublisForm.superclass.initComponent.call(this);
  }
});
