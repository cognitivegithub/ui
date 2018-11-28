/**
 * Компонент выводит форму рассмотрения заявки на регистрацию доверенности пользователя.
 *
 * Параметры:
 * lot_id - id процедуры
 * type - тип, либо вопрос, либо ответ (request/explain)
 */

Ext.define('Application.components.RequestForm', {
  extend: 'Ext.form.Panel',
  frame: true,
  cls: 'spaced-panel',
  fileUpload: true,
  initComponent: function() {
    var component = this;

    component.ids = new Array();
    component.ids.filePanelId = Ext.id();
    component.ids.procedure_info_panel = Ext.id();
    component.ids.request_fieldset_id = Ext.id();
    component.ids.coordination_panel_id = Ext.id();
    component.ids.request_textarea_id = Ext.id();
    component.send_to_oos=false;

    if (!component.application_id) {
      component.application_id = null;
    }

    var message_name_title = 'Текст запроса';
    if (component.message_name == 'response_message') {
      message_name_title = 'Текст разъяснения';
    } else if (component.message_name == 'cancel_reason') {
      message_name_title = 'Причина отклонения';
    }
    var storeComments = getRequestCommentsStore(component.request_id);
    this.addEvents('reload');
    Ext.apply(this, {
      frame: true,
      title: component.title,
      cls: 'spaced-panel',
      defaults: {
        xtype: 'fieldset',
        autoHeight: true
      },
      items: [{
        id: component.ids.procedure_info_panel,
        title: 'Сведения о процедуре',
        hidden: component.rpc_load_request_type == 'application' ? true : false
      }, {
        id: component.ids.request_fieldset_id,
        title: component.textareaFieldTitle,
        layout: 'form',
        labelWidth: 140,
        items: [{
          xtype: 'textarea',
          anchor: '100%',
          height: 150,
          id: component.ids.request_textarea_id,
          name: component.message_name,
          fieldLabel: message_name_title+''+REQUIRED_FIELD,
          allowBlank: false,
          blankText: 'Сохранение запроса без текста невозможно'
        }]
      }, {
        xtype: 'Application.components.ProcedureCoordination',
        title: 'Согласование разъяснения',
        id: component.ids.coordination_panel_id,
        parent: component,
        hidden: !Main.config.procedure_coordination || component.request_type != 'response' || component.rpc_load_request_type != 'doc'
      }, {
        xtype: 'hidden',
        name: 'lot_id',
        value: component.lot_id
      }, {
        xtype: 'hidden',
        name: 'procedure_id',
        value: component.procedure_id
      }, {
        xtype: 'hidden',
        name: 'application_id',
        value: component.application_id
      }, {
        xtype: 'hidden',
        name: 'request_id',
        value: component.request_id
      }, {
        xtype: 'hidden',
        name: 'request_type',
        value: component.request_type
      },{
        xtype: 'grid',
        title: 'Согласования',
        store: storeComments,
        autoHeight: true,
        colModel: new Ext.grid.ColumnModel({
          columns: [
            {
              header: 'Статус',
              dataIndex: 'type',
              renderer: function(value) {
                return value == 'reject' ? 'Отклонено' : 'Утверждено';
              }
            },
            {
              header: 'Комментарий',
              dataIndex: 'comment',
              renderer: function(value) {
                return value;
              }
            },
            {
              header: 'Сотрудник',
              renderer: function(value, obj, record) {
                return record.get('last_name') + ' ' + record.get('first_name') + ' ' + record.get('middle_name');
              }
            },
            {
              header: 'Дата',
              dataIndex: 'date',
              renderer: function(value) {
                return value;
              }
            }
          ]
        }),
        viewConfig: {
          forceFit: true
        }
      }],
      buttons: [{
        text: 'Назад',
        handler: function() {
          history.back(1);
        }
      }, {
        text: 'Сохранить',
        scope: this,
        formBind: true,
        handler: function() {
          if(!component.textLenValidate()) {
            return false;
          };
          var form = this;
          if (this.getForm().isValid()) {
            performSave(form, null, 'reload');
          } else {
            Ext.Msg.alert('Ошибка', 'Ошибка в заполнении полей');
          }
        }
      }, {
        text: 'Подписать и направить',
        formBind: true,
        scope: this,
        handler: component.signBtn.createDelegate(this)
      }],
      listeners: {
        afterrender: function() {
          var params = {
            mask: true,
            mask_el: this.getEl()
          };
          performRPCCall(RPC.Procedure.load, [component.procedure_id], params, function(resp) {
            if (resp && resp.success) {
              if (component.rpc_load_request_type == 'application') {
                if (!(resp.procedure.application_stages == 2
                    && (resp.procedure.procedure_type == Application.models.Procedure.type_ids.auction_up
                    || resp.procedure.procedure_type == Application.models.Procedure.type_ids.auction_down
                    )) && !(resp.procedure.application_stages == 1 && resp.procedure.procedure_type == Application.models.Procedure.type_ids.auction_up_26)) {
                  performRPCCall(RPC.Company.suppliershortview, [{applic_id: component.application_id}], params, function(resp) {
                    if (resp && resp.success) {
                      component.insert(0, {
                        xtype: 'Application.components.cmpDataView',
                        noneditable: true,
                        cmpData: resp.cmp
                      });
                      component.doLayout();
                    } else {
                      Ext.Msg.alert('Ошибка', resp.message);
                    }
                  });
                }
              } else {
                component.procedure_organizer_department_id = resp.procedure.organizer_department_id;
                if (resp.procedure.registry_number == null) {
                  resp.procedure.registry_number ='';
                }
                Ext.getCmp(component.ids.procedure_info_panel).update(getProcedureDataTemplate().apply(resp.procedure));
              }
              component.send_to_oos = resp.procedure.send_to_oos;
              component.getForm().setValues(resp.procedure);
              component.loadRequestData();
            } else if (resp) {
              echoResponseMessage(resp);
            }
          });
        },
        reload: function() {
          var doc_panel = Ext.getCmp(this.ids.request_fieldset_id);
          doc_panel.remove(Ext.getCmp(this.ids.filePanelId));
          filePanelId = Ext.id();
          this.loadRequestData();
        }
      }
    });
    Application.components.RequestForm.superclass.initComponent.call(this);

    this.form.api = {
      submit: component.submit_fn
    };

    this.form.waitMsgTarget = true;
  },

  /*
   * Нажатие на кнопку "Подписать и направить"
   */
  signBtn: function () {
    var component = this;
    if (!this.textLenValidate()) {
      return false;
    }
    if (this.getForm().isValid()) {
      if (this.request_type == 'request') {
        if (!this.application_id) {
          performSave(component, 'com/procedure/' + component.sign_action + '/type/request/lot/' + component.lot_id, undefined, false, false);
        } else {
          performSave(component, 'com/procedure/' + component.sign_action + '/type/request/lot/' + component.lot_id + '/application/' + component.application_id, undefined, false, false);
        }
      } else if (component.request_type == 'response') {
        performSave(component, 'com/procedure/' + component.sign_action + '/type/response/reqid/' + component.getForm().findField('request_id').getValue(), undefined, false, false);
      } else if (component.request_type == 'cancel') {
        performSave(component, 'com/procedure/' + component.sign_action + '/type/cancel/reqid/' + component.getForm().findField('request_id').getValue(), undefined, false, false);
      }
    } else {
      Ext.Msg.alert('Ошибка', 'Ошибка в заполнении полей');
    }

  },

  textLenValidate: function () {
    var req_text = Ext.getCmp(this.ids.request_textarea_id).getValue();
    if (req_text.length > 2000 && this.send_to_oos) {
      Ext.Msg.alert('Ошибка', 'В связи с требованиями к форматам и файлам ЕИС, длина текста запроса' +
        ' и ответа на него не может превышать 2000 символов. Пожалуйста, отредактируйте текст и повторите попытку.');
      return false;
    } else {
      return true;
    }
  },

  loadRequestData: function () {
    var component = this;

    if (!this.disableFilePanel) {
      var doc_panel = Ext.getCmp(this.ids.request_fieldset_id);
      doc_panel.add({
        id: component.ids.filePanelId,
        border: false,
        hideTitle: true,
        items: [{
          xtype: 'Application.components.FilesPanel',
          file_panels: [{
            name: 'Документы',
            withDescr: false
          }],
          is_panel: true
        }]
      });
      doc_panel.doLayout();
    }

    performRPCCall(component.rpc_load_request,
      [{iLotId: component.lot_id,
       sType:component.rpc_load_request_type,
       iRequestId:component.getForm().findField('request_id').getValue(),
       iApplicationId:component.application_id}],
      {wait_delay: 0, wait_text: 'Загружаются сведения. Подождите...'},
      function (result) {
      if (result.success) {
        if (result.request && result.request.request_id !== null) {
          var requestData = result.request;
          component.getForm().setValues(requestData);
          if (Main.config.procedure_coordination && component.request_type == 'response' && component.rpc_load_request_type == 'doc') {
            setComponentValues(Ext.getCmp(coordination_panel_id), requestData);
          }
          if (!component.disableFilePanel) {
            if (component.request_type == 'request') loadFilesIntoFilePanels(result.files_request, {deleteHandler: component.rpc_remove_request_file});
            else loadFilesIntoFilePanels(result.files_response, {deleteHandler: component.rpc_remove_request_file});
          }
        }
      } else {
        Ext.Msg.alert('Ошибка', result.message);
      }
    });
  }
});
