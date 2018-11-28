
Ext.define('Application.components.ProtocolListPanel', {
  extend: 'Ext.panel.Panel',
  frame: true,
  border: false,
  bodyCssClass: 'subpanel',
  initComponent: function() {
    var component = this;
    Ext.apply(this, {
      items: [{
          html: '<div style="height: 100px; text-align: center; padding-top: 45px;">Пожалуйста подождите</div>'
      }],
      buttons: [{
        text: 'Назад',
        handler: function() {
          /* alena 4428 -->
          redirect_to('com/procedure/index');
          */
          history.back(); // <-- alena 4428 
        }
      }],
      listeners: {
        beforerender : function() {
          RPC.Lot.load(component.lot_id, function(resp) {
          var lotData = resp.procedure, lotDataForTemplate = lotData.lot;
          lotDataForTemplate.procedure_registry_number = lotData.registry_number;
          lotDataForTemplate.currency_vocab = lotData.currency_vocab;
          params.wait_text = 'Загружается список протоколов';
          var is_trade = Application.models.Procedure.isStatusExists(lotData.procedure_type, Application.models.Procedure.statuses.trade);
          performRPCCall(RPC.Protocol.getProtocolsByLot, [{lot_id: component.lot_id}], params, function(resp) {
            this.removeAll();
            this.add({
              xtype: 'Application.components.lotDataFieldSet',
              shortInfo: true,
              cls: 'subpanel',
              style: 'padding-bottom: 12px',
              autoHeight: true,
              listeners: {
                  afterrender : function() {
                    this.fireEvent('lotloaded', lotData);
                  }
                }
            });
            if (isAdmin()) {
              this.add({
                xtype: 'fieldset',
                title: 'Операции',
                cls: 'subpanel',
                style: 'padding-bottom: 12px',
                autoHeight: true,
                buttonAlign: 'left',
                buttons: [{
                  text: 'Переотправить протокол рассмотрения заявок',
                  disabled: lotData.lot.status<=Application.models.Procedure.statuses.first_parts,
                  handler: function() {
                    component.resendProtocol(lotData.lot.id, 'first_parts');
                  }
                }, {
                  text: 'Переотправить протокол проведения торгов',
                  disabled: lotData.lot.status<=Application.models.Procedure.statuses.trade || !is_trade,
                  handler: function() {
                    component.resendProtocol(lotData.lot.id, 'trade');
                  }
                }, {
                  text: 'Переотправить итоговый протокол',
                  disabled: lotData.lot.status<Application.models.Procedure.statuses.contract,
                  handler: function() {
                    component.resendProtocol(lotData.lot.id, 'second_parts');
                  }
                }]
              });
            }
            if (!resp.protocols || !resp.protocols.length) {
              this.add({
                xtype: 'panel',
                cls: 'subpanel',
                html: 'Список протоколов пуст'
              });
            } else {
              var protocol_types = {
                '1': 'Протоколы рассмотрения заявок',
                '11': 'Дополнительные файлы протоколов рассмотрения заявок',
                '2': 'Протоколы подведения итогов',
                '12': 'Дополнительные файлы протоколов подведения итогов',
                '3': 'Протоколы отказа от заключения договора',
                '44': 'Протоколы проведения аукциона',
                '45': 'Протоколы о признании аукциона не состоявшимся',
                '46': 'Протоколы проведения переторжки',
                '47': 'Протоколы о признании переторжки не сотоявшейся',
                '5': 'Протоколы вскрытия конвертов',
                '6': 'Протоколы квалификационного отбора',
                '50': 'Прочие документы в составе протоколов'
              };
              var protocols = {}, i;
              for (i=0; i<resp.protocols.length; i++) {
                var type = '' + resp.protocols[i].html[0].type_id;
                if (!protocols[type]) {
                  protocols[type] = [];
                }
                var p = resp.protocols[i].html[0];
                if (1==p.status && (p.type_id < 40 || p.type_id == 50)) {
                  continue;
                }
                if (3==p.status) {
                  p.obsolete = true;
                  p.obsolete_text = 'отменен';
                }
                protocols[type].push(p);
              }
              for (i in protocol_types) {
                if (!protocol_types.hasOwnProperty(i)) {
                  continue;
                }
                if (!protocols[i]) {
                  continue;
                }
                this.add({
                  xtype: 'panel',
                  items: [{
                    xtype: 'Application.components.filelistPanel',
                    title: protocol_types[i],
                    files: protocols[i],
                    withHash: false
                  }]
                });
              }
            }
            this.doLayout();
          });
        });
        }
      }
    });

    Application.components.ProtocolListPanel.superclass.initComponent.call(this);
    var params = {
      mask: true,
      handle_failure: true,
      scope: this,
      monitor_valid: this,
      wait_text: 'Загружаются сведения о лоте'
    };

  },
  resendProtocol: function(lot_id, type_id) {
    RPC.Protocol.sendEvent(lot_id, type_id, echoResponseMessage);
  }
});
