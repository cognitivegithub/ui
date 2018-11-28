Ext.ns('Application.controllers.comModule');

Application.controllers.comModule.ProtocolController = Ext.extend(Application.controllers.Abstract, {
  title: 'Протоколы',
  signprotocolAction: function(params, app, panel) {
    var additionalFields = [];
    additionalFields.push({nm: "lot_id", val: params.lot});
    additionalFields.push({nm: "stage", val: params.stage});
    var back_url = 'com/applic/review/lot/'+params.lot+'/stage/'+params.stage;
    if(params.stage==5) {
      back_url = 'com/applic/openapplics/lot/'+params.lot+'/stage/'+params.stage;
    }
    if (params.act && params.act=='decline') back_url += '/act/'+params.act;
    var panel_id = Ext.id();
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.SignatureForm',
      cmpParams: {
        backUrl: back_url,
      	additional: additionalFields,
        useFormHandler: false,
        id: panel_id,
        api: RPC.Protocol.signprotocol,
        success_fn: function(resp) {
          if (resp.status_blocked && resp.status_blocked === true) {
            window.location = '/';
          } else {
            redirect_to('com/procedure/index');
          }
        },
        buttons: [{
          text: 'Запросить все вторые части',
          hidden: true,
          handler: function() {
            redirect_to('com/applic/showAllApplic/lot/'+params.lot);
          }
        }]
      },
      listeners: {
        afterrender : function() {
          Ext.getCmp(panel_id).el.mask('Идет загрузка текста для подписания. Подождите...', 'x-mask-loading');
          RPC.Protocol.getSignProtocolText(params.lot, params.stage, function(provider, resp) {
            Ext.getCmp(panel_id).el.unmask();
            if(resp.result.success) {
              var signature_text = resp.result.text_protocol;
              Ext.getCmp('signature_text').setValue(signature_text);
            } else {
              echoResponseMessage(resp.result);
            }
          });
        }
      }
    })
  },
  indexAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.ProtocolListPanel',
      title: 'Протоколы по лоту',
      cmpParams: {
        lot_id: params.lot
      }
    });
  },
  oosqueueAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.ProtocolExchangeGrid',
      title: 'Взаимодействие с ЕИС по публикации протоколов по процедуре',
      cmpParams: {
        procedure_id: params.procedure
      }
    });
  }
});