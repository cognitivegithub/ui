Ext.ns('Application.controllers.tsnModule');

Application.controllers.tsnModule.ProcedureController = Ext.extend(Application.controllers.Abstract, {
  title: 'Процедуры',
  indexAction : function (params, app, panel) {
    var procedure_type_title = 'Объявленные лоты';
    if (params.type) {
      if (params.type == 'archive') {
        procedure_type_title = 'Архив лотов';
      } else if (params.type == 'fixprice') {
        procedure_type_title = 'Фиксированная цена';
      } else if (params.type == 'auction') {
        procedure_type_title = 'Торги на повышение';
      } 
    }
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.procedureIndex',
      title: procedure_type_title,
      cmpParams: {
        filter: params.type
      }
    });
  },
  myAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.procedureIndex',
      title: 'Мои лоты',
      cmpParams: {
        filter: 'mine'
      }
    });
  },
  participationAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.procedureIndex',
      title: 'Лоты с моим участием',
      cmpParams: {
        filter: 'participation'
      }
    });
  },
  favouriteAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.procedureIndex',
      title: 'Избранные лоты',
      cmpParams: {
        filter: 'favourite'
      }
    });
  },
  addAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.procedureForm',
      width: 950,
      forceHeader: true,
      stageParam: false,
      title: 'Новая процедура'
    });
  },
  editAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.procedureForm',
      width: 950,
      forceHeader: true,
      title: 'Редактирование лота',
      cmpParams: {
        procedure_id: params.id
      }
    });
  },
  signAction: function(params, app, panel) {
    var additionalFields = [];
    if (params.id && undefined==params.procedure) {
      params.procedure = params.id;
    }
    additionalFields.push({nm: "procedure_id", val: params.procedure});

    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.SignatureForm',
      cmpParams: {
        backUrl: 'tsn/procedure/edit/id/'+params.procedure,
        additional: additionalFields,
        useFormHandler: false,
        api: RPC_tsn.Procedure.sign
      },
      listeners: {
        afterrender : function() {
          var p = {};
          p.procedure_id = params.procedure;
          performRPCCall(RPC_tsn.Procedure.loaddraft, [p], null, function(resp) {
            if(resp && resp.success) {
              var tpl = getTsnProcedureSignatureTemplate();
              var signature_text = tpl.applyTemplate(resp.procedure);
              Ext.getCmp('signature_text').setValue(signature_text);
            } else {
              echoResponseMessage(resp);
            }
          });
        }
      }
    });
  },
  viewAction : function(params, app, panel) {
    panel.add({
        xtype       : 'Application.components.actionPanel',
        cmpType     : 'Application.components.procedurePanel',
        title       : 'Описание лота',
        cmpParams   : {
          title         : 'Описание лота',
          cls           : 'procedure-view-short',
          procedure_id  : params.procedure
        }
      });
  }
});