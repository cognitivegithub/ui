Ext.ns('Application.controllers.tsnModule');

Application.controllers.tsnModule.ApplicController = Ext.extend(Application.controllers.Abstract, {
  title: 'Заявки',
  createAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.applicAddForm',
      cmpParams: {
        procedure_id: params.procedure,
        application_id: null
      },
      title: 'Заявка на участие в процедуре',
      cls: 'cleanborder'
    });
  },
  editAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.applicAddForm',
      cmpParams: {
        procedure_id: params.procedure,
        application_id: params.application_id
      },
      title: 'Заявка на участие в процедуре',
      cls: 'cleanborder'
    });
  },
  deleteAction: function(params, app, panel) {
    var additionalFields = [];
    additionalFields.push({nm: 'application_id', val: params.id});
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.SignatureForm',
      cmpParams: {
        backUrl: 'tsn/applic/list',
        additional: additionalFields,
        signatureTextHeight: 250,
        useFormHandler: false,
        api: RPC_tsn.Applic.remove
      },
      listeners: {
        afterrender: function() {
          var values = {
            application_id: params.id
          };
          performRPCCall(RPC_tsn.Applic.loaddraft, [values], null, function(resp) {
            if (resp && resp.success) {
              var tpl = getTsnApplicCancelSignatureTemplate();
              Ext.getCmp('signature_text').setValue(tpl.applyTemplate(resp.applic));
            } else {
              echoResponseMessage(resp);
            }
          });
        }
      }
    })
  },
  listAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.TsnApplicGrid',
      title: 'Мои заявки',
      cmpParams: {
        directFn: RPC_tsn.Applic.list,
        companyType: 'my'
      }
    });
  },
  viewAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.applicView',
      cmpParams: {
        noneditable: true,
        title: 'Заявка на участие в процедуре',
        hideTitle: false,
        application_id: params.id
      }
    });
  }
});