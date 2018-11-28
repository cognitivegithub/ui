/**
 *
 */
Ext.define('Application.components.financeOperationsPanel', {
  extend        : 'Ext.panel.Panel',
  frame         : true,
  border        : false,
  autoHeight    : true,

  initComponent : function () {

    if (!this.supplier) {
      throw("Не задан идентификатор организации");
    }

    var component = this;
    var balance_panel_id = Ext.id();

    var supplierId = this.supplier;

    var comboSelectHandler = function(combo, record, index) {
      var formPanel = combo.findParentByType('form');
      var form = formPanel.getForm();
      form.setValues(
        Ext.apply(form.getValues(), {
          application   : record.get('id'),
          procedureId   : record.get('procedureId'),
          lotId         : record.get('lotId'),
          regNum        : record.get('regNum')
        })
      );
      //console.debug( form.getValues() );
    } // comboSelectHandler

    var comboCfg = {
      xtype       : 'Application.components.comboApplicationsList',
      name        : 'application',
      supplier    : supplierId,
      store       : createContragentApplicationsListStore(supplierId),
      width       : 450,
      ref         : '../comboAppList',
      listeners   : {
        'select'    : comboSelectHandler,
        beforerender: function() {
          this.relayEvents(component, ['optype_selected']);
        },
        optype_selected: function(optype) {
          this.setDisabled((optype == 1 ? false : true));
        }
      }
    } // comboCfg

    function getSignText(params) {
      var operation = '';
      if (params.request == 'DEPOSIT') {
        operation = 'пополнение денежных средств';
      } else if (params.request == 'CHARGE') {
        operation = 'списание денежных средств за участие в процедуре';
      } else if (params.request == 'BLOCK') {
        operation = 'блокирование обеспечения заявки';
      } else if (params.request == 'UNBLOCK') {
        operation = 'разблокирование обеспечения заявки';
      }
      return 'Я, ' + Main.user.full_name + ', осуществляю '
              +operation+' на лицевом счете заявителя ' + params.supplier
              + (params.amount ? ' на сумму '+Ext.util.Format.price(params.amount)+' рублей. ' : '. ')
              + 'Дата и время: ' + params.date_time
              + (params.log_msg ? '. Основание: '+params.log_msg : '.');
    }

    var actionButtonCfg = {
      xtype       : 'button',
      type        : 'submit',
      ref         : '../submitButton',
      text        : 'Подписать транзакцию',
      handler     : function(button) {

        var formPanel = button.findParentByType('form');
        var form = formPanel.getForm();
        var params = {
          request     : formPanel.request,
          supplier    : supplierId
        }
        params = Ext.apply(form.getValues(), params);
        params.date_time = Ext.util.Format.localDateRenderer(new Date()).replace('&nbsp;', '');

        var sign_action_items = [];
        for(var params_prop in params) {
          sign_action_items.push({
            xtype: 'hidden',
            name: params_prop,
            value: params[params_prop]
          });
        }
        var win = new Application.components.promptWindow({
          title: 'Подписание ручной финансовой операции',
          modal: true,
          cmpType: 'Application.components.SignatureForm',
          cmpParams: {
            api: RPC.Finance.operations,
            signatureText : getSignText(Ext.apply(params, {supplier: component.supplier_full_name})),
            signatureTextHeight: 250,
            useFormHandler: false,
            items: sign_action_items,
            success_fn: function(resp) {
              update_balance_data();
              win.close();
            }
          }
        });
        win.show();
      }
    } // actionButtonCfg

    var logMsgCfg = {
      xtype       : 'textfield',
      name        : 'log_msg',
      fieldLabel  : 'Основание',
      width       : '90%'
    };

    var amountCfg = {
      xtype       : 'Application.components.priceField',
      name        : 'amount',
      allowNegative : false,
      fieldLabel  : 'Сумма (в рублях)'
    };

    var update_balance_data = function() {
      performRPCCall(RPC.Finance.balance, [supplierId], null, function(resp) {
        if (resp && resp.success) {
          var balance_panel = Ext.getCmp(balance_panel_id);

          var balanceTpl = getBalanceTemplate();

          if (resp.balance.full_name) {
            component.supplier_full_name = resp.balance.full_name;
            component.setTitle('Операции со счетами ' + resp.balance.full_name);
          }

          var balanceSubpanel = {
            xtype: 'panel',
            frame: false,
            border: false,
            tpl: balanceTpl,
            data: resp.balance
          };

          balance_panel.removeAll();
          balance_panel.add(balanceSubpanel);
          balance_panel.doLayout();
        } else if(resp) {
          echoResponseMessage(resp);
        }
      });
    }

    var ops_items = [];
    if (Main.config.finance_operations_deposit) {
      ops_items.push({
        title   : 'Пополнить',
        request : 'DEPOSIT',
        items   : [
          amountCfg,
          logMsgCfg
        ]
      });
    }
    ops_items.push(
        {
          title   : 'Блокировать',
          request : 'BLOCK',
          items   : [
            comboCfg,
            amountCfg,
            logMsgCfg
          ]
        },
        {
          title   : 'Разблокировать',
          request : 'UNBLOCK',
          items   : [
            comboCfg,
            logMsgCfg
          ]
        },
        {
          title   : 'Списать плату за участие',
          request : 'CHARGE',
          items   : [
            comboCfg,
            amountCfg,
            {xtype: 'hidden', name: 'procedureId'},
            {xtype: 'hidden', name: 'lotId'},
            {xtype: 'hidden', name: 'regNum'}
          ]
        });

    this.items = [{
      xtype: 'fieldset',
      id: balance_panel_id,
      autoHeight: true,
      title: 'Состояние лицевого счета контрагента',
      items: []
    }, {
      xtype           : 'tabpanel',
      bodyCssClass    : 'x-panel-body',
      border          : false,
      autoHeight      : true,
      activeTab       : 1,

      defaults: {
        xtype         : 'form',
        bodyCssClass  : 'form-finances-operations',
        labelWidth    : 300,
        autoHeight    : true,
        monitorValid  : true,
        buttons       : [actionButtonCfg]
      },

      items: ops_items
    }];

    this.on('beforerender', function() {
      update_balance_data();
    });


    Application.components.financeOperationsPanel.superclass.initComponent.call(this);
  } // initComponent


}); // Application.components.operationsForm