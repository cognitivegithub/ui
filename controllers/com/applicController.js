Ext.ns('Application.controllers.comModule');

Application.controllers.comModule.ApplicController = Ext.extend(Application.controllers.Abstract, {
  title: 'Заявки',
  createAction : function (params, app, panel) {
      panel.add({
        xtype: 'Application.components.actionPanel',
        //cmpType: 'Application.components.NewApplicForm',
        cmpType: 'Application.components.ApplicForm',
        cmpParams: {
          lot_id: params.lot,
          procedure_id: params.procedure,
          application_id:null,
          noneditable: false
        },
        title: 'Заявка на участие в процедуре',
        cls: 'cleanborder',
        forceHeader: true
      });
  },
  createbyprocedureAction : function (params, app, panel) {
      RPC.Procedure.load(params.procedure, function(resp){
        if (resp.success) {
          if (resp.procedure && resp.procedure.lots) {
            var lot_id = resp.procedure.lots[0].id;
            panel.add({
              xtype: 'Application.components.actionPanel',
              cmpType: 'Application.components.ApplicForm',
              cmpParams: {
                lot_id: lot_id,
                procedure_id: params.procedure,
                application_id:null,
                noneditable: false
              },
              title: 'Заявка на участие в процедуре',
              cls: 'cleanborder',
              forceHeader: true
            });
            panel.doLayout();
          }
        } else {
          redirect_to('com/procedure/index');
        }
      });
  },
  editAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.ApplicForm',
      cmpParams: {
        lot_id: params.lot,
        procedure_id: params.procedure,
        application_id: params.application_id,
        noneditable: false
      },
      title: 'Заявка на участие в процедуре',
      cls: 'cleanborder',
      forceHeader: true
    });
  },

  signAction : function (params, app, panel) {
    var additionalFields = [];
    additionalFields.push({nm: "application_id", val: params.application_id});

    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.SignatureForm',
      cmpParams: {
        backUrl: 'com/applic/create/procedure/'+params.procedure+'/lot/'+params.lot,
      	additional: additionalFields,
        useFormHandler: false,
        api: RPC.Applic.sign,
        success_fn: function(resp) {
          RPC.Index.serverinfo(function(response) {
            if (response.success && response.contragent) {
              Main.contragent.available_sum = parsePrice(response.contragent.available_sum);
              Main.app.fireEvent('available_sum_changed', Main.contragent.available_sum);
            }
          });
          redirect_to(resp.redirect_url);
        }
	  },
      listeners: {
        afterrender : function() {
          var values={};
          values.application_id = params.application_id;
          values.procedure_id=params.procedure;
          values.for_sign=true;
          RPC.Applic.loaddraft(values, function(provider, resp) {
            if(resp.result.success) {
              var p = {};
              var isPP26 = false;
              if (resp.result.applic.procedure.procedure_type==PROCEDURE_TYPE_AUC_ASC_26) {
                p.pp26 = true;
                isPP26 = true;
              }
              p.contragent_type = (Main.contragent.supplier_profile_id!=SUPPLIER_TYPE_FIZ_RF && Main.contragent.supplier_profile_id!=SUPPLIER_TYPE_FIZ_FOREIGN) ? 'fizik':'urik';
              performRPCCall(RPC.Reference.getApplicationText, [p], null, function(r) {
                var ap_text = "";
                if (!resp.result.applic.customer_agree_form) {
                  ap_text = r.application_text;
                }
                Ext.apply(resp.result.applic, {applic_text: ap_text});
                var tpl = getApplicSignatureTemplate((isPP26)?3:params.totalParts, resp.result.applic.procedure.procedure_type);
                var signature_text = tpl.applyTemplate(resp.result.applic);
                Ext.getCmp('signature_text').setValue(signature_text);
              });
            } else {
              Ext.MessageBox.alert('Ошибка', resp.result.message);
            }
          });
        }
      }
    })
  },
  listAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.ApplicGrid',
      title: 'Мои заявки',
      cmpParams: {
        directFn: RPC.Applic.index,
        companyType: 'my'
      }
    });
  },
  procslistAction : function (params, app, panel) {
    var cmpTitle = 'Заявки на мои процедуры';
    if(typeof params.procedure_id !== 'undefined') {
      cmpTitle = 'Список заявок на участие в процедуре';
    }
    panel.add({
    xtype: 'Application.components.fullscreenPanel',
    cmpType: 'Application.components.ApplicGrid',
    title: cmpTitle,
    cmpParams: {
      directFn: RPC.Applic.index,
      procedureId: params.procedure_id
    }
    });
  },
  cancelAction : function (params, app, panel) {
    var additionalFields = [];
    additionalFields.push({nm: "application_id", val: params.id});

    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.SignatureForm',
      cmpParams: {
        backUrl: 'com/applic/list/type/my',
      	additional: additionalFields,
        useFormHandler: false,
        api: RPC.Applic.cancel,
        success_fn: function(resp) {
          RPC.Index.serverinfo(function(response) {
            if (response.success && response.contragent) {
              Main.contragent.available_sum = parsePrice(response.contragent.available_sum);
              Main.app.fireEvent('available_sum_changed', Main.contragent.available_sum);
            }
          });
          redirect_to(resp.redirect_url);
        }
	  },
      listeners: {
        afterrender : function() {
          RPC.Reference.getApplicationCancelText(params.id, function(provider, resp) {
            if(resp.result.success) {
              var applic_text = resp.result.applic_text;
              Ext.getCmp('signature_text').setValue(applic_text);
            } else {
              Ext.MessageBox.alert('Ошибка', resp.result.message);
            }
          });
        }
      }
    })
  },
  deleteAction : function (params, app, panel) {
    var additionalFields = [];
    additionalFields.push({nm: "application_id", val: params.id});

    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.SignatureForm',
      cmpParams: {
        backUrl: 'com/applic/list/type/my',
      	additional: additionalFields,
        useFormHandler: false,
        api: RPC.Applic.remove
	  },
      listeners: {
        afterrender : function() {
          RPC.Applic.loaddraft(params.id, function(provider, resp) {
            if(resp.result.success) {
              var applic = resp.result.applic;
              var signature_text = 'Заявитель '+applic.contragent.full_name+' удаляет черновик заявки.'+'\n'+
'Реестровый номер процедуры: '+applic.procedure.registry_number+'\n'+
'Название процедуры: '+applic.procedure.title+'\n'+
'Дата и время удаления черновика заявки: '+Ext.util.Format.date(new Date(), 'd.m.Y H:i');
              Ext.getCmp('signature_text').setValue(signature_text);
            } else {
              Ext.MessageBox.alert('Ошибка', resp.result.message);
            }
          });
        }
      }
    })
  },
  viewAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      title: 'Заявка на участие в процедуре',
      //cmpType: 'Application.components.NewApplicForm',
      cmpType: 'Application.components.ApplicForm',
      forceHeader: true,
      cmpParams: {
        noneditable: true,
        title: 'Заявка на участие в процедуре',
        mode: 'view',
        hideTitle: false,
        application_id: params.id,
        lot_id: params.lot_id,
        filter: params.filter
      }
    });
  },
  reviewAction : function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.applicationsReviewForm',
      cmpParams: {
        stage: params.stage,
        lot_id: params.lot,
        procedure_id: params.procedure,
        act: params.act || ''
      }
    });
  },
  openapplicsAction : function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.applicationsOpeningForm',
      title: 'Вскрытие конвертов с заявками',
      cmpParams: {
        stage: 5,
        lot_id: params.lot,
        procedure_id: params.procedure,
        act: params.act || ''
      }
    });
  },
  viewapplicsAction : function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.applicationsViewForm',
      cmpParams: {
        lot_id: params.lot,
        filter: params.filter
      }
    });
  },
  showAllApplicAction: function(params, app, panel) {
    var additionalFields = [];
    additionalFields.push({nm: "lot_id", val: params.lot});
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.SignatureForm',
      cmpParams: {
        backUrl: 'com/protocol/signprotocol/lot/'+params.lot+'/stage/2/showall/1',
      	additional: additionalFields,
        useFormHandler: false,
        api: RPC.Applic.saveShowAllMode
  	  },
      listeners: {
        afterrender : function() {
          var values={};
          values.lot_id = params.lot;
          RPC.Applic.getShowAllApplicText(values, function(provider, resp) {
            if(resp.result.success) {
              Ext.getCmp('signature_text').setValue(resp.result.text_showall);
            } else {
              echoResponseMessage(resp);
            }
          });
        }
      }
    })
  },
  makeintentionAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.IntentionForm',
      title: 'Подача намерения об участии в закупке',
      cmpParams: {
        lot_id: params.lot,
        procedure_id: params.procedure
      }
    });
  },
  signintentionAction : function (params, app, panel) {
    var additionalFields = [];
    additionalFields.push({nm: "lot_id", val: params.lot});
    additionalFields.push({nm: "procedure_id", val: params.procedure});

    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.SignatureForm',
      cmpParams: {
        backUrl: 'com/applic/makeintention/procedure/'+params.procedure+'/lot/'+params.lot,
        additional: additionalFields,
        useFormHandler: false,
        api: RPC.Applic.signintention,
        success_fn: function(resp) {
          redirect_to('com/procedure/index');
        }
	    },
      listeners: {
        afterrender : function() {
          performRPCCall(RPC.Lot.load, [{lot_id: params.lot}], {wait_text: 'Получение данных о закупке.'}, function(resp) {
            if (resp.success) {
              var intention_text = 'Настоящим сообщаем о своем намерении принять участие в выбранной закупочной процедуре. Подача данного запроса не обязывает нас принимать участие в закупке.';
              var signature_text = getSignIntentionTemplate().apply(resp.procedure);
              signature_text += "\n" + intention_text;
              Ext.getCmp('signature_text').setValue(signature_text);
            } else {
              Ext.Msg.alert('Ошибка', resp.message);
            }
          });
        }
      }
    })
  },
  intentionslistAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.IntentionGrid',
      title: 'Намерения об участии в закупке',
      cmpParams: {
        directFn: RPC.Applic.intentionslist,
        list_type: 'my'
      }
    });
  },
  procsintentionsAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.IntentionGrid',
      title: 'Намерения об участии в закупке',
      cmpParams: {
        directFn: RPC.Applic.intentionslist,
        list_type: 'procs'
      }
    });
  },
  viewintentionAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.IntentionViewForm',
      title: 'Намерения об участии в закупке',
      cmpParams: {
        lot_id: params.lot
      }
    });
  },
  historyAction : function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.ApplicHistoryGridPanel',
      title: 'История изменений',
      cmpParams: {
        directFn: RPC.Applic.history,
        application_id: params.id
      }
    });
  },
  commissionlistAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.CommissionFormGrid'
    });
  }

});