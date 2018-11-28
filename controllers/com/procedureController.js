Ext.ns('Application.controllers.comModule');

Application.controllers.comModule.ProcedureController = Ext.extend(Application.controllers.Abstract, {
  title: 'Процедуры',
  indexAction : function (params, app, panel) {
    if (1==2 && Main.config.service_redirect && !Main.contragent.tariff_page_visited && Main.user.user_type == TYPE_USER) {
      document.location.href='/sync/ordertariff';
    }
    var procedure_type_title = 'Актуальные процедуры';
    if (params.type) {
      if (params.type == 'archive') {
        procedure_type_title = 'Архив процедур';
      } else if (params.type == 'auctions') {
        procedure_type_title = 'Электронные аукционы';
      } else if (params.type == 'auctionsdown') {
        procedure_type_title = 'Редукционы';
      } else if (params.type == 'auctionsup') {
        procedure_type_title = 'Аукционы на повышение';
      } else if (params.type == 'contest') {
        procedure_type_title = 'Конкурсы';
      } else if (params.type == 'pricelist') {
        procedure_type_title = 'Запросы котировок';
      } else if (params.type == 'quotation') {
        procedure_type_title = 'Запросы предложений';
      } else if (params.type == 'representatives') {
        procedure_type_title = 'Опубликованные специализированной организацией';
      }
    }
    /*panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.ProcedureGrid',
      title: procedure_type_title,
      cmpParams: {
        filter: params.type,
        customer_id: params.customer_id || false
      }
    });*/
    var model = 'procedure';
    var stepp_min = (params.type == undefined || params.type == null) ? 'receipt_applications' : null;
    var stepp_max = (params.type == undefined || params.type == null) ? 'signing_contract' : null;

    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.procGrid',
      title: procedure_type_title,
      cmpParams: {
        model: model,
        stepp_min: stepp_min,
        stepp_max: stepp_max,
        filter: (params.type == undefined || params.type == null) ? 'procedure_actual' : null,
        customer_id: params.customer_id || false
      }
    });
  },
  monitoringAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.ProcedureGrid',
      title: 'Все процедуры',
      cmpParams: {
        filter: 'monitoring'
      }
    });
  },
  myAction : function (params, app, panel)
  {
    var title = 'Закупки';
    var model = 'procedure';

    var type = (params.step) ? params.step : 'all';
    switch (type)
    {
      case 'procedure_approved':
        title = 'Согласованные';
        break;
      case 'procedure_editing':
        title = 'В работе';
        break;
      case 'procedure_rejected':
        title = 'Отклоненные';
        type = 'procedure_rejected'
        break;
      case 'procedure_sent_for_approval':
        title = 'Отправленные на согласование';
        break;
    }

    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.procGrid',
      title: title,
      cmpParams: {
        model: model,
        filter: type,
        customer_id: params.customer_id || false
      }
    });

    /*panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.ProcedureGrid',
      title: title,
      cmpParams: {
        filter: 'mine'
      }
    });*/
  },
  participationAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.ProcedureGrid',
      title: 'Процедуры с моим участием',
      cmpParams: {
        filter: 'participation'
      }
    });
  },
  favouriteAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.ProcedureGrid',
      title: 'Избранные процедуры',
      cmpParams: {
        filter: 'favourite'
      }
    });
  },
  newAction: function (params, app, panel) {
    if (Main.contragent.customer_accreditations == '') {
      panel.add({
        xtype: 'Application.components.actionPanel',
        title: 'Доступ запрещен',
        cmpType: 'Application.components.nowayPanel',
        cmpParams: {
          html: '<p class="ext-mb-text">Для создания новой процедуры необходима <a href="/#company/edit/group/customer/act/apply/tab/customer">аккредитация в качестве организатора</a>.</p>'
        }
      });
    } else {
      panel.add({
        xtype: 'Application.components.actionPanel',
        cmpType: 'Application.components.procedureEditForm',
        width: 950,
        forceHeader: true,
        stageParam: false,
        title: 'Новая процедура'
      });
    }
  },
  editAction: function(params, app, panel) {
    if (Main.procedure_edit_link_redirect) {
      var redirect_link = Main.procedure_edit_link_redirect;
      Main.procedure_edit_link_redirect = null;
      redirect_to(redirect_link);
    } else {
      panel.add({
        xtype: 'Application.components.actionPanel',
        cmpType: 'Application.components.procedureEditForm',
        width: 950,
        forceHeader: true,
        title: 'Редактирование процедуры',
        cmpParams: {
          procedure_id: params.id
        }
      });
    }
  },
  peretorgAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.procedureEditForm',
      width: 950,
      forceHeader: true,
      title: 'Переторжка процедуры по лоту',
      cmpParams: {
        procedure_id: params.procedure_id,
        lot_id: params.lot_id,
        frm: params.frm
      }
    });
  },
  doretorgAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.procedureEditForm',
      width: 950,
      forceHeader: true,
      title: 'Доторжка процедуры',
      cmpParams: {
        procedure_id: params.id,
        stageParam: params.stage
      }
    });
  },
  restoreAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.procedureRestoreForm',
      width: 950,
      cmpParams: {
        procedure_id: params.procedure,
        lot_id: params.lot
      }
    });
  },
  cancelAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.procedureCancelForm',
      width: 950,
      cmpParams: {
        procedure_id: params.id,
        lot_id: params.lot
      }
    });
    /*var additionalFields = [];
    if (params.id && undefined==params.procedure) {
      params.procedure = params.id;
    }
    additionalFields.push({nm: "procedure_id", val: params.procedure});
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.SignatureForm',
      cmpParams: {
        backUrl: 'procedure/index',
        additional: additionalFields,
        useFormHandler: false,
        api: RPC.Procedure.cancel
      },
      listeners: {
        afterrender : function() {
          var p = {};
          p.procedure_id = params.procedure;
          performRPCCall(RPC.Procedure.loaddraft, [p], null, function(resp) {
            if(resp && resp.success) {
              var tpl = getProcedureCancelTemplate();
              var data = {
                registry_number: resp.procedure.registry_number,
                date_cancelled: Ext.util.Format.localDateRenderer(new Date()),
                user_fio: Main.user.full_name
              };
              var signature_text = tpl.applyTemplate(data);
              Ext.getCmp('signature_text').setValue(signature_text);
            } else {
              echoResponseMessage(resp);
            }
          });
        }
      }
    });*/
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
        backUrl: 'com/procedure/edit/id/'+params.procedure,
        additional: additionalFields,
        useFormHandler: false,
        api: RPC.Procedure.sign
      },
      listeners: {
        afterrender : function() {
          var p = {};
          p.procedure_id = params.procedure;
          performRPCCall(RPC.Procedure.loaddraft, [p], null, function(resp) {
            if(resp && resp.success) {
              var tpl = getProcedureSignatureTemplate(resp.procedure.procedure_type);
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
        cmpType     : 'Application.components.procedureShortView',
        title       : 'Извещение о проведении процедуры',
        cmpParams   : {
          title         : 'Извещение о проведении процедуры',
          cls           : 'procedure-view-short',
          procedure_id  : params.procedure
        }
      });
  },
  requestAction: function(params, app, panel) {
    var cmpParams;
    if (params.type == 'request') {
      cmpParams = {
        request_id: '',
        disableFilePanel: false,
        message_name: 'request_message',
        textareaFieldTitle: 'Создание / изменение запроса'
      }
    } else if (params.type == 'response') {
      cmpParams = {
        request_id: params.reqid,
        disableFilePanel: false,
        message_name: 'response_message',
        textareaFieldTitle: 'Создание / изменение разъяснения'
      };
    } else if (params.type == 'cancel') {
      cmpParams = {
        request_id: params.reqid,
        disableFilePanel: true,
        message_name: 'cancel_reason',
        textareaFieldTitle: 'Создание / изменение причины отклонения запроса'
      };
    }
    Ext.apply(cmpParams, {
      title: 'Запрос на разъяснение положений документации к процедуре',
      lot_id: params.lot,
      procedure_id: params.procedure,
      request_type: params.type,
      submit_fn: RPC.Procedure.saveRequest,
      rpc_load_request: RPC.Procedure.loadRequest,
      rpc_load_request_type: 'doc',
      rpc_remove_request_file: RPC.Procedure.removeRequestFile,
      sign_action: 'signrequest'
    });
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.RequestForm',
      cmpParams: cmpParams
    });
  },
  signrequestAction : function (params, app, panel) {
    var additionalFields = [];
    var backurl = '';
    if (params['type'] == 'request') {
      additionalFields.push({nm: "lot_id", val: params.lot});
      backurl = 'com/procedure/request/id/'+params.id;
    } else if (params['type'] == 'response') {
      additionalFields.push({nm: "request_id", val: params.reqid});
      backurl = 'com/procedure/response/id/'+params.id+'/reqid/'+params.reqid;
    } else if (params['type'] == 'cancel') {
      additionalFields.push({nm: "request_id", val: params.reqid});
      backurl = 'com/procedure/cancel/id/'+params.id+'/reqid/'+params.reqid;
    }
    additionalFields.push({nm: "type", val: params.type});
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.SignatureForm',
      cmpParams: {
        backUrl: backurl,
        additional: additionalFields,
        api: RPC.Procedure.signRequest
      },
      listeners: {
        afterrender : function() {
          RPC.Procedure.requestSignatureText(params, function(provider, resp) {
            if(resp.result.success) {
              Ext.getCmp('signature_text').setValue(resp.result.message);
            } else {
              Ext.MessageBox.alert('Ошибка', resp.result.message);
            }
          });
        }
      }
    })
  },
  requestlistAction: function (params, app, panel) {
    var cmpParams = {
          store_fn: RPC.Procedure.requestlist,
          row_theme: 'Запрос на разъяснение положений документации к процедуре',
          request_action: 'request',
          showrequest_action: 'showrequest'
      };
    if (params.lot) {
      Ext.apply(cmpParams, {lot: params.lot} );
    }
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.RequestTabPanel',
      cmpParams: {
          requestGridParams: cmpParams,
          procedure: params.procedure

      },
      title: 'Разъяснения документации к процедурам'
    });
  },
  showrequestAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.RequestView',
      title: 'Запрос на разъяснение документации к процедуре',
      cmpParams: {
        title: 'Запрос на разъяснение документации к процедуре',
        procedure: params.procedure,
        lot: params.lot,
        request: params.reqid,
        readOnly: true,
        submit_fn: RPC.Procedure.changeRequestStatus,
        rpc_load_request: RPC.Procedure.loadRequest,
        rpc_remove_request_file: RPC.Procedure.removeRequestFile,
        rpc_load_request_type: 'doc',
        is_view: params.view,
        textareaFieldTitle: 'Создание / изменение разъяснения'
      }
    });
  },
  showexplainAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.ExplainView',
      title: 'Разъяснение документации к процедуре',
      cmpParams: {
        title: 'Разъяснение документации к процедуре',
        procedure: params.procedure,
        lot: params.lot,
        request: params.reqid
      }
    });
  },
  pauseAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.ProcedurePauseForm',
      title: 'Приостановка процедуры',
      cmpParams: {
        directFn: RPC.Procedure.pause,
        procedure_id: params.procedure,
        lot_id: params.lot,
        action: 'pause'
      }
    });
  },
  resumeAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.ProcedurePauseForm',
      title: 'Восстановление процедуры',
      cmpParams: {
        directFn: RPC.Procedure.resume,
        procedure_id: params.procedure,
        lot_id: params.lot,
        action: 'resume'
      }
    });
  },
  tradeAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.Trade',
      title: 'Аукцион',
      cmpParams: {
        procedure_id: params.procedure,
        lot_id: params.lot,
        cls: Ext.isGecko?'x-maskable':''
      }
    });
  },
  historyAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.HistoryPanel',
      title: 'История изменений',
      cmpParams: {
        procedure_id: params.procedure,
        type: 'procedure'
      }
    });
  },
  requestresultAction: function(params, app, panel) {
    if (params.type == 'request') {
      var cmpParams = {
        request_id: '',
        disableFilePanel: false,
        message_name: 'request_message',
        textareaFieldTitle: 'Создание / изменение запроса'
      }
    } else if (params.type == 'response') {
      var cmpParams = {
        request_id: params.reqid,
        disableFilePanel: false,
        message_name: 'response_message',
        textareaFieldTitle: 'Создание / изменение разъяснения'
      };
    } else if (params.type == 'cancel') {
      var cmpParams = {
        request_id: params.reqid,
        disableFilePanel: true,
        message_name: 'cancel_reason',
        textareaFieldTitle: 'Создание / изменение причины отклонения запроса'
      };
    }
    Ext.apply(cmpParams, {
      title: 'Запрос на разъяснение итогов торгов',
      lot_id: params.lot,
      procedure_id: params.procedure,
      request_type: params.type,
      submit_fn: RPC.Procedure.saveRequestResult,
      rpc_load_request: RPC.Procedure.loadRequest,
      rpc_load_request_type: 'result',
      rpc_remove_request_file: RPC.Procedure.removeRequestResultFile,
      sign_action: 'signrequestresult'
    });
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.RequestForm',
      cmpParams: cmpParams
    });
  },
  signrequestresultAction : function (params, app, panel) {
    var additionalFields = [];
    var backurl = '';
    if (params['type'] == 'request') {
      additionalFields.push({nm: "lot_id", val: params.lot});
      backurl = 'com/procedure/requestresult/type/request/id/'+params.id;
    } else if (params['type'] == 'response') {
      additionalFields.push({nm: "request_id", val: params.reqid});
      backurl = 'com/procedure/requestresult/type/response/id/'+params.id+'/reqid/'+params.reqid;
    } else if (params['type'] == 'cancel') {
      additionalFields.push({nm: "request_id", val: params.reqid});
      backurl = 'com/procedure/requestresult/type/cancel/id/'+params.id+'/reqid/'+params.reqid;
    }
    additionalFields.push({nm: "type", val: params.type});
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.SignatureForm',
      cmpParams: {
        backUrl: backurl,
        additional: additionalFields,
        api: RPC.Procedure.signRequestResult
      },
      listeners: {
        afterrender : function() {
          RPC.Procedure.requestResultSignatureText(params, function(provider, resp) {
            if(resp.result.success) {
              Ext.getCmp('signature_text').setValue(resp.result.message);
            } else {
              Ext.MessageBox.alert('Ошибка', resp.result.message);
            }
          });
        }
      }
    })
  },
  requestresultlistAction: function (params, app, panel) {
    var cmpParams = {
      store_fn: RPC.Procedure.requestresultlist,
      row_theme: 'Запрос на разъяснение итогов процедуры',
      request_action: 'requestresult',
      showrequest_action: 'showrequestresult'
    };
    if (params.lot) {
      Ext.apply(cmpParams, {lot: params.lot} );
    }
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.RequestTabPanel',
      cmpParams: {requestGridParams: cmpParams},
      title: 'Протоколы разногласий'
    });
  },
  showrequestresultAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.RequestView',
      title: 'Запрос на разъяснение итогов процедуры',
      cmpParams: {
        title: 'Запрос на разъяснение итогов процедуры',
        procedure: params.procedure,
        lot: params.lot,
        request: params.reqid,
        readOnly: true,
        submit_fn: RPC.Procedure.saveRequestResult,
        rpc_load_request: RPC.Procedure.loadRequest,
        rpc_load_request_type: 'result'
      }
    });
  },
  requestapplicAction: function(params, app, panel) {
    var cmpParams;
    if (params.type == 'request') {
      cmpParams = {
        request_id: '',
        disableFilePanel: false,
        message_name: 'request_message',
        textareaFieldTitle: 'Создание / изменение запроса'
      }
    } else if (params.type == 'response') {
      cmpParams = {
        request_id: params.reqid,
        disableFilePanel: false,
        message_name: 'response_message',
        textareaFieldTitle: 'Создание / изменение разъяснения'
      };
    } else if (params.type == 'cancel') {
      cmpParams = {
        request_id: params.reqid,
        disableFilePanel: true,
        message_name: 'cancel_reason',
        textareaFieldTitle: 'Создание / изменение причины отклонения запроса'
      };
    }
    Ext.apply(cmpParams, {
      title: 'Запрос на разъяснение положений заявки',
      lot_id: params.lot,
      procedure_id: params.procedure,
      application_id: params.application,
      request_type: params.type,
      submit_fn: RPC.Procedure.saveRequestApplication,
      rpc_load_request: RPC.Procedure.loadRequest,
      rpc_load_request_type: 'application',
      rpc_remove_request_file: RPC.Procedure.removeRequestApplicationFile,
      sign_action: 'signrequestapplic'
    });
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.RequestForm',
      cmpParams: cmpParams
    });
  },
  requestappliclistAction: function (params, app, panel) {
    var cmpParams = {
      store_fn: RPC.Procedure.requestappliclist,
      row_theme: 'Запрос на разъяснение положений заявки на участие',
      request_action: 'requestapplic',
      showrequest_action: 'showrequestapplic',
      application_action: '/application/{application_id}'
    };
    if (params.lot) {
      Ext.apply(cmpParams, {lot: params.lot} );
    }
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.RequestTabPanel',
      cmpParams: {
          requestGridParams: cmpParams,
          activeTab: params.activetab,
          procedure: params.procedure,
          supplier: params.supplier

      },
      title: 'Разъяснения положений заявок на участие'
    });
  },
  signrequestapplicAction : function (params, app, panel) {
    var additionalFields = [];
    var backurl = '';
    if (params['type'] == 'request') {
      additionalFields.push({nm: "lot_id", val: params.lot});
      additionalFields.push({nm: "application_id", val: params.application});
      backurl = 'com/procedure/requestapplic/type/request/id/'+params.id;
    } else if (params['type'] == 'response') {
      additionalFields.push({nm: "request_id", val: params.reqid});
      backurl = 'com/procedure/requestapplic/type/response/id/'+params.id+'/reqid/'+params.reqid;
    } else if (params['type'] == 'cancel') {
      additionalFields.push({nm: "request_id", val: params.reqid});
      backurl = 'com/procedure/requestapplic/type/cancel/id/'+params.id+'/reqid/'+params.reqid;
    }
    additionalFields.push({nm: "type", val: params.type});
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.SignatureForm',
      cmpParams: {
        backUrl: backurl,
        additional: additionalFields,
        api: RPC.Procedure.signRequestApplic
      },
      listeners: {
        afterrender : function() {
          RPC.Procedure.requestApplicSignatureText(params, function(provider, resp) {
            if(resp.result.success) {
              Ext.getCmp('signature_text').setValue(resp.result.message);
            } else {
              Ext.MessageBox.alert('Ошибка', resp.result.message);
            }
          });
        }
      }
    })
  },
  showrequestapplicAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.RequestView',
      title: 'Запрос на разъяснение положений заявки на участие',
      cmpParams: {
        title: 'Запрос на разъяснение положений заявки на участие',
        procedure: params.procedure,
        lot: params.lot,
        request: params.reqid,
        readOnly: true,
        submit_fn: RPC.Procedure.saveRequestApplication,
        rpc_load_request: RPC.Procedure.loadRequest,
        rpc_load_request_type: 'application'
      }
    });
  },
  // пункт меню "Процедуры > Рассылки приглашений"
  invitesAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.InvitesLogGrid',
      title: 'Рассылки приглашений'
    });
  },
  sendinvitesAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.ProcedureInvitesForm',
      title: 'Отправка приглашений',
      cmpParams: {
        procedure_id: params.procedure ? params.procedure : null
      }
    });
  },
  changedatesAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.ProcedureChangeDatesForm',
      title: 'Перевод сроков проведения',
      cmpParams: {
        lot_id: params.lot ? params.lot : null
      }
    });
  },
  decisionAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.ProcedureDecisionForm',
      title: 'Подтверждение итогов процедуры'
    });
  },
  documentAddAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.ProcedureDocumentAddForm',
      title: 'Загрузка документа в состав протоколов',
      cmpParams: {
        lot_id: params.lot,
        procedure_id: params.procedure
      }
    });
  },
  operatorDocumentAddAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.procedureOperatorDocumentAddForm',
      title: 'Загрузка документа в извещение',
      cmpParams: {
        lot_id: params.lot,
        procedure_id: params.procedure
      }
    });
  },
  statisticsAction: function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.ProcedureStatisticsPanel',
      cmpParams: {
        title: 'Отчеты'
      }
    })
  },
  expertsAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.procedureExpertsForm',
      width: 950,
      cmpParams: {
        procedure_id: params.id
      }
    });
  },
  inviteemailsAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.procedureInviteEmailsForm',
      cmpParams: {
        procedure_id: params.id
      }
    });
  },
  accesslogAction: function(params, app, panel) {
    panel.add({
      title: 'Доступ к процедурам',
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.procedureAccessLogGrid'
    });
  },
  prolongateAction: function(params, app, panel) {
    panel.add({
      xtype: 'Application.components.actionPanel',
      cmpType: 'Application.components.ProcedureProlongateForm',
      title: 'Перевод сроков',
      cmpParams: {
        lot_id: params.lot ? params.lot : null,
        procedure_id: params.procedure ? params.procedure: null,
        prolongate: true
      }
    });
  },

  /**
   * Процедуры/Отчёты по шаблонам
   */
  reportsAction : function (params, app, panel) {
    panel.add({
      xtype: 'Application.components.fullscreenPanel',
      cmpType: 'Application.components.AdminReportsBrowser',
      title: 'Отчёты'
    });
  }
});
