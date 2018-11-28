
Ext.define('Application.components.balancePanel', {
  extend: 'Ext.Panel',
  initComponent : function () {
    var component = this;

    var balancePanelId = Ext.id();
    var bankdataPanelId = Ext.id();
    this.ids = {
      balance: balancePanelId,
      bank: bankdataPanelId
    };

    Ext.apply(this,
    {
      bodyCssClass: 'subpanel-top-padding',
      border: true,
      frame: true,
      items: [
        {
          xtype: 'fieldset',
          id: balancePanelId,
          autoHeight: true,
          title: 'Текущее состояние лицевого счета',
          items: [

          ]
        }, {
          xtype: 'fieldset',
          id: bankdataPanelId,
          autoHeight: true,
          title: 'Реквизиты для пополнения лицевого счета',
          style: 'margin-bottom: 0px;',
          items: [

          ]
        }
      ],
      buttons: [
        {
          text: 'История операций',
          handler: function() {
            redirect_to('finance/history/id/'+component.contragent_id);
          }
        }
      ],
      listeners : {
        beforerender : function() {
          this.relayEvents(Main.app, ['deposit_changed']);
          performRPCCall(RPC.Finance.balance, [component.contragent_id], null, function(resp) {
            if (resp && resp.success) {
              var bankData = resp.bankdata;

              var bdataTpl = getBankdataTemplate();

              var bdataSubpanel = {
                xtype: 'panel',
                frame: false,
                border: false,
                tpl: bdataTpl,
                data: bankData
              };
              Ext.getCmp(bankdataPanelId).add(bdataSubpanel);
              Ext.getCmp(bankdataPanelId).doLayout();
              Main.app.fireEvent('deposit_changed', resp.balance);
              component.updateBalance(resp.balance)
              component.doLayout();
            } else if(resp) {
              echoResponseMessage(resp);
            }
          });
        },
        deposit_changed: function(contragent) {
          this.updateBalance(contragent);
        }
      }
    });
    Application.components.balancePanel.superclass.initComponent.call(this);
  },
  updateBalance: function(balanceData) {
    var cmp = Ext.getCmp(this.ids.balance);
    if (!cmp) {
      return;
    }
    var balanceTpl = getBalanceTemplate();

    var balanceSubpanel = {
      xtype: 'panel',
      frame: false,
      border: false,
      tpl: balanceTpl,
      data: balanceData
    };
    cmp.removeAll();
    cmp.add(balanceSubpanel);
    cmp.doLayout();
  }
});
