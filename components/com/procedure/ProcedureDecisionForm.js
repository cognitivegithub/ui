Ext.define('Application.components.ProcedureDecisionForm', {
  extend: 'Ext.panel.Panel',
  border: false,
  frame: true,
  autoHeight: true,
  layout : 'form',
  labelWidth: 350,
  initComponent : function () {
    var component = this;
    this.ids = {
      button_confirm: Ext.id(),
      contract_confirm_fieldset: Ext.id()
    };

    this.forms = {
      nothing_to_confirm: {
        xtype: 'fieldset',
        style: 'margin: 10px 5px 0px;',
        bodyCssClass: 'subpanel',
        items: [{
          html: 'Нет лотов для подтверждения'
        }]
      },
      contract_confirm: {
        xtype: 'fieldset',
        style: 'margin: 10px 5px 0px;',
        bodyCssClass: 'subpanel',
        title: 'Заключение договора',
        id: this.ids.contract_confirm_fieldset,
        items: [{
          //html: 'В случае выбора письменной формы заключения договора, Вам необходимо опубликовать подписанный договор, тем самым подтвердить его заключение, после чего процедура будет направлена в архив и денежные средства у участников разблокируются. В случае уклонение участника от заключения договора, Вам необходимо отказаться от данного участника и выбрать основание отказа в отношении данного участника "Уклонился от заключения договора", денежные средства уклониста останутся заблокированными.',
          html: 'В случае выбора письменной формы заключения договора, Вам необходимо подтвердить заключение договора, после чего процедура будет направлена в архив и денежные средства у участников разблокируются. В случае уклонения участника от заключения договора, Вам необходимо отказаться от данного участника и выбрать основание отказа в отношении данного участника "Уклонился от заключения договора", денежные средства уклониста останутся заблокированными. В случае отказа от заключения договора с основанием «Иное», денежные средства у победителя разблокируются.',//vplashykhin ETPSUPA-190
          style: 'padding-bottom: 20px; font-size: 12px;'
        }]
      }
    };

    this.items = [];
    if (!this.hideButtons) {
      this.buttons = [{
        text: 'Подтвердить',
        id: this.ids.button_confirm,
        handler: function() {
          var dparams = {
            mask:true,
            wait_text: 'Сохраняем подтверждение',
            handle_failure: true
          };
          performRPCCall(RPC.Procedure.makedecision, [component.getValues()], dparams, function(resp) {
            Ext.Msg.alert('Информация', resp.new_status, function() {
              window.location = '/';
            });
          });
        }
      }, {
        text: 'Закрыть',
        handler: function() {
          window.location = '/';
        }
      }];
    }
    Application.components.ProcedureDecisionForm.superclass.initComponent.call(this);

    this.on('render', function() {
      if (this.values) {
        this.setData(this.values);
      } else {
        performRPCCall(RPC.Procedure.decisionProcedureLoad, [], {mask:true, wait_text: 'Загружается лот для подтверждения итогов'}, function(resp) {
          if (resp.success) {
            component.setData(resp.decision_info);
          } else {
            echoResponseMessage(resp);
          }
        });
      }
    }, this, {single: true});

  },
  setData: function(data) {
    if (!data) {
      Ext.getCmp(this.ids.button_confirm).setVisible(false);
      this.add(this.forms.nothing_to_confirm);
    } else {
      var lot_data = {
        'lot': data.lot,
        'suppliers': data.suppliers,
        'customers': data.customers,
        'current_customer': data.currentCustomer,
        'current_supplier': data.currentSupplier,
        'currency': data.currency
      };
      this.add(Application.models.Contract.renderLotInfo(lot_data));
      this.add(this.forms.contract_confirm);
      this.add({
        xtype: 'hidden',
        name: 'lot_id',
        value: data.lot.id
      });
      var contract_confirm_fieldset = Ext.getCmp(this.ids.contract_confirm_fieldset);
      for (var jj in data.customers) {
        if (data.customers.hasOwnProperty(jj)) {
          contract_confirm_fieldset.add(this.createCustomerDecisionsPanel(data.customers[jj]));
        }
      }
    }
    if (this.rendered && this.boxReady) {
      this.doLayout();
    }
  },
  getValues: function() {
    var v = {};
    collectComponentValues(this, v, true);
    if (2==v.signatureRequired) {
      v.agreementRequired = 0;
    }
    return v;
  },
  createCustomerDecisionsPanel: function(customer) {
    return {
      xtype: 'panel',
      layout: 'form',
      bodyCssClass: 'subpanel-top-padding',
      style: 'margin-bottom: 10px;',
      frame: true,
      title: customer.full_name,
      labelWidth: 350,
      items: [{
        xtype: 'hidden',
        name: 'agreementRequired',
        value: 1
      }, {
        xtype: 'combo',
        name: 'signatureRequired',
        fieldLabel: 'Заключение договора',
        mode: 'local',
        store : new Ext.data.ArrayStore({
            id: 0,
            fields: ['id', 'name'],
            data: [
              [1, 'В электронной форме'],
              [2, 'В письменной форме']
            ]
        }),
        editable: false,
        valueField: 'id',
        displayField: 'name',
        triggerAction: 'all',
        value: 1
      }, {
        xtype: 'hidden',
        name: 'customer_id',
        value: customer.id
      }]
    };
  }
});
